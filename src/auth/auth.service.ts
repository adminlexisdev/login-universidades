import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SamlUser } from './interfaces/saml-user.interface';
import { AuthenticatedUser } from './interfaces/authenticated-user.interface';
import { ClientSessionsService } from '../clients/services/client-sessions.service';
import { ClientSession } from '../clients/entities/client-session.entity';

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

  private resolveClientDomain(clientIdentifier: string): string {
    if (!clientIdentifier) {
      throw new BadRequestException(
        'El identificador del cliente es requerido',
      );
    }

    const [, domain] = clientIdentifier.split('@');
    return (domain ?? clientIdentifier).toLowerCase();
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
  }> {
    const clientDomain = this.resolveClientDomain(clientIdentifier);
    const { session, activeSessions, limit, cliService, domain } =
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
    };
  }

  createToken(user: AuthenticatedUser): string {
    const { client_id, user_name, service } = user;

    return this.jwtService.sign({ client_id, user_name, service });
  }

  getSessionTtlSeconds(): number {
    return this.clientSessionsService.getSessionTtlSeconds();
  }
}
