import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from './entities/client.entity';
import { ClientSession } from './entities/client-session.entity';
import { ClientSessionsService } from './services/client-sessions.service';
import { SessionCleanupService } from './services/session-cleanup.service';

@Module({
  imports: [TypeOrmModule.forFeature([Client, ClientSession])],
  providers: [ClientSessionsService, SessionCleanupService],
  exports: [ClientSessionsService],
})
export class ClientsModule {}
