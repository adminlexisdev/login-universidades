import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ClientSession } from './client-session.entity';

@Entity({ name: 'clients' })
export class Client {
  @PrimaryGeneratedColumn('uuid', { name: 'cli_id' })
  cliId: string;

  @Column({ name: 'cli_name', nullable: true })
  cliName?: string;

  @Column({ name: 'cli_service', nullable: false })
  cliService: string;

  @Index('cli_domain_unique', { unique: true })
  @Column({ name: 'cli_domain', length: 255 })
  cliDomain: string;

  @Column({ name: 'cli_concurrency_limit', type: 'int', default: 1 })
  cliConcurrencyLimit: number;

  @OneToMany(() => ClientSession, (s) => s.client)
  sessions?: ClientSession[];

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt: Date;
}
