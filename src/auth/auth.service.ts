import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SamlUser } from './interfaces/saml-user.interface';
import { AuthenticatedUser } from './interfaces/authenticated-user.interface';
import { ClientSessionsService } from '../clients/services/client-sessions.service';
import { ClientSession } from '../clients/entities/client-session.entity';
import {
  UeaJwtPayload,
  UeaValidateFail,
  UeaValidateResponse,
} from './interfaces/uea-auth.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly clientSessionsService: ClientSessionsService,
  ) {}

  mapSamlUser(samlUser: SamlUser): AuthenticatedUser {
    if (!samlUser?.id || !samlUser?.displayName) {
      throw new BadRequestException(
        'No se recibieron datos de usuario desde SAML',
      );
    }

    const { id, displayName } = samlUser;

    return {
      client_id: id,
      user_name: displayName,
    };
  }

  mapUeaUserFromToken(token: string): AuthenticatedUser {
    const payload = this.jwtService.decode(token) as UeaJwtPayload | null;
    if (!payload?.userId || !payload?.name) {
      throw new UnprocessableEntityException(
        'No se pudo obtener userId y name desde el token UEA',
      );
    }
    return { client_id: payload.userId, user_name: payload.name };
  }

  private resolveClientDomain(clientIdentifier: string): string {
    if (!clientIdentifier) {
      throw new BadRequestException(
        'El identificador del cliente es requerido',
      );
    }

    const [, domain] = clientIdentifier.split('@');
    const rawDomain = (domain ?? clientIdentifier).toLowerCase();

    const suffixAliases: Array<{ suffix: string; target: string }> = [
      { suffix: '.uhemisferios.edu.ec', target: 'uhemisferios.edu.ec' },
    ];

    const suffixMatch = suffixAliases.find(({ suffix }) =>
      rawDomain.endsWith(suffix),
    );
    if (suffixMatch) {
      return suffixMatch.target;
    }

    return rawDomain;
  }

  async createSession(
    clientIdentifier: string,
    userId: string,
  ): Promise<{
    session: ClientSession;
    clientDomain: string;
    activeSessions: number;
    limit: number;
    cliService: string;
    cliCuenta: string;
  }> {
    const clientDomain = this.resolveClientDomain(clientIdentifier);
    const { session, activeSessions, limit, cliService, domain, cliCuenta } =
      await this.clientSessionsService.createSessionForClient(
        clientDomain,
        userId,
      );

    return {
      session,
      clientDomain: domain,
      activeSessions,
      limit,
      cliService,
      cliCuenta,
    };
  }

  createToken(user: AuthenticatedUser): string {
    const { client_id, user_name, service, cuenta } = user;

    const payload: Record<string, unknown> = {
      data: {
        usuNombre: user_name,
        authorities: ['ROLE_USUARIO'],
        service: service,
        cuenta: cuenta,
        services: [service],
      },
      user_name: client_id,
      client_id: service,
      scope: ['read'],
      authorities: ['ROLE_USUARIO'],
      jti: '',
    };

    return this.jwtService.sign(payload);
  }

  getSessionTtlSeconds(): number {
    return this.clientSessionsService.getSessionTtlSeconds();
  }

  async validateUeaTokenRemoto(token: string): Promise<void> {
    const url = new URL(process.env.UEA_VALIDATE_URL);
    url.searchParams.set('token', token);

    let json: UeaValidateResponse;
    try {
      const validate = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${process.env.UEA_TOKEN}`,
        },
      });
      if (!validate.ok) {
        throw new Error(`UEA validate HTTP ${validate.status}`);
      }
      json = (await validate.json()) as UeaValidateResponse;
    } catch {
      throw new ServiceUnavailableException(
        'No se pudo validar el token con UEA',
      );
    }

    if (!json?.success || !json?.valid) {
      const msg = (json as UeaValidateFail)?.message ?? 'Token inválido (UEA)';
      throw new UnauthorizedException(msg);
    }
  }
}
