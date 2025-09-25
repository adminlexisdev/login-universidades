import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Client } from './client.entity';

@Entity({ name: 'client_sessions' })
@Index('cse_client_expires_idx', ['cseCliId', 'expiresAt'])
@Index('cse_client_user_unique', ['cseCliId', 'cseUserId'], { unique: true })
export class ClientSession {
  @PrimaryGeneratedColumn('uuid', { name: 'cse_id' })
  cseId: string;

  @Index('cse_cookie_unique', ['cseCookieId'], { unique: true })
  @Column({ name: 'cse_cookie_id', type: 'varchar', length: 36 })
  cseCookieId: string;

  @Column({ name: 'cse_user_id', type: 'varchar', length: 191 })
  cseUserId: string;

  @Column({ name: 'cse_cli_id', type: 'varchar', length: 36 })
  cseCliId: string;

  @ManyToOne(() => Client, (client) => client.sessions)
  @JoinColumn({ name: 'cse_cli_id', referencedColumnName: 'cliId' })
  client: Client;

  @Column({ name: 'expires_at', type: 'datetime', nullable: true })
  expiresAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt: Date;
}
