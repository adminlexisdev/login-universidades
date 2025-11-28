import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClientSessionsService } from '../../clients/services/client-sessions.service';
import { randomUUID } from 'crypto';

@Injectable()
export class UgService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly clientSessionsService: ClientSessionsService,
  ) {}

  async login(): Promise<{
    token: string;
    session: any;
    clientDomain: string;
    activeSessions: number;
    limit: number;
  }> {
    const uniqueSessionUserId = `ug-user-${randomUUID()}`;
    const clientDomain = 'ug.edu.ec';

    const { session, activeSessions, limit, cliService, cliCuenta } =
      await this.clientSessionsService.createSessionForClient(
        clientDomain,
        uniqueSessionUserId,
      );

    const token = this.generateGenericToken(cliService, cliCuenta);

    return {
      token,
      session,
      clientDomain,
      activeSessions,
      limit,
    };
  }

  private generateGenericToken(service: string, cuenta: string): string {
    const user_name = 'Estudiante UG';
    const client_id = 'ug-generic-user';

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
}
