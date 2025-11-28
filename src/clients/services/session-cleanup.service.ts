import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientSession } from '../entities/client-session.entity';

@Injectable()
export class SessionCleanupService {
  private readonly logger = new Logger(SessionCleanupService.name);

  constructor(
    @InjectRepository(ClientSession)
    private readonly sessionsRepository: Repository<ClientSession>,
  ) {}

  private static readonly cronExpression =
    process.env.SESSION_CLEANUP_CRON ?? CronExpression.EVERY_DAY_AT_MIDNIGHT;

  @Cron(SessionCleanupService.cronExpression)
  async handleCleanup(): Promise<void> {
    const { affected } = await this.sessionsRepository
      .createQueryBuilder()
      .delete()
      .from(ClientSession)
      .where('expires_at IS NOT NULL AND expires_at <= NOW(3)')
      .execute();

    if (affected && affected > 0) {
      this.logger.verbose(`Se eliminaron ${affected} sesiones expiradas`);
    }
  }
}
