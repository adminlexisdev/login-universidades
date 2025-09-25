import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { DataSource, Repository } from 'typeorm';
import { Client } from '../entities/client.entity';
import { ClientSession } from '../entities/client-session.entity';

@Injectable()
export class ClientSessionsService {
  constructor(
    @InjectRepository(ClientSession)
    private readonly sessionsRepository: Repository<ClientSession>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  private ttlSeconds(): number {
    const raw = Number(process.env.SESSION_TTL_SECONDS);
    return Number.isFinite(raw) && raw > 0 ? raw : 3600;
  }

  private expiresAt(): Date {
    return new Date(Date.now() + this.ttlSeconds() * 1000);
  }

  async getActiveSessionCount(clientId: string): Promise<number> {
    return this.sessionsRepository
      .createQueryBuilder('session')
      .where('session.cseCliId = :clientId', { clientId })
      .andWhere('(session.expiresAt IS NULL OR session.expiresAt > :now)', {
        now: new Date(),
      })
      .getCount();
  }

  async createSessionForClient(
    clientDomain: string,
    userId: string,
  ): Promise<{
    session: ClientSession;
    activeSessions: number;
    limit: number;
    cliService: string;
    domain: string;
  }> {
    return this.dataSource.transaction(async (manager) => {
      const now = new Date();
      const clientsRepo = manager.getRepository(Client);
      const sessionsRepo = manager.getRepository(ClientSession);

      const client = await clientsRepo
        .createQueryBuilder('client')
        .setLock('pessimistic_write')
        .where('client.cliDomain = :clientDomain', {
          clientDomain: clientDomain,
        })
        .getOne();

      if (!client) {
        throw new NotFoundException(`Cliente no está registrado`);
      }

      await manager
        .createQueryBuilder()
        .delete()
        .from(ClientSession)
        .where('cse_cli_id = :clientId', { clientId: client.cliId })
        .andWhere('expires_at IS NOT NULL')
        .andWhere('expires_at <= :now', { now })
        .execute();

      const existingSession = await sessionsRepo
        .createQueryBuilder('session')
        .setLock('pessimistic_write')
        .where('session.cseCliId = :clientId', { clientId: client.cliId })
        .andWhere('session.cseUserId = :userId', { userId })
        .andWhere('(session.expiresAt IS NULL OR session.expiresAt > :now)', {
          now,
        })
        .getOne();

      const activeQuery = () =>
        sessionsRepo
          .createQueryBuilder('session')
          .where('session.cseCliId = :clientId', { clientId: client.cliId })
          .andWhere('(session.expiresAt IS NULL OR session.expiresAt > :now)', {
            now: new Date(),
          })
          .getCount();

      if (existingSession) {
        existingSession.expiresAt = this.expiresAt();
        const session = await sessionsRepo.save(existingSession);
        const activeSessions = await activeQuery();

        return {
          session,
          activeSessions,
          limit: client.cliConcurrencyLimit,
          cliService: client.cliService,
          domain: client.cliDomain,
        };
      }

      const activeCount = await activeQuery();

      if (activeCount >= client.cliConcurrencyLimit) {
        throw new ForbiddenException(
          'Se alcanzó el máximo de concurrencias permitidas para este cliente',
        );
      }

      const session = sessionsRepo.create({
        client,
        cseCliId: client.cliId,
        cseUserId: userId,
        cseCookieId: randomUUID(),
        expiresAt: this.expiresAt(),
      });

      const savedSession = await sessionsRepo.save(session);

      return {
        session: savedSession,
        activeSessions: activeCount + 1,
        limit: client.cliConcurrencyLimit,
        cliService: client.cliService,
        domain: client.cliDomain,
      };
    });
  }

  getSessionTtlSeconds(): number {
    return this.ttlSeconds();
  }
}
