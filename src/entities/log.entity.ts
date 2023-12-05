import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('logs')
export class Log {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 10, nullable: true })
  method: string;

  @Column({ type: 'text', nullable: true })
  url: string;

  @Column({ length: 255, nullable: true })
  hostname: string;

  @Column({ type: 'text', nullable: true })
  request_body: string;

  @Column({ type: 'text', nullable: true })
  response_body: string;

  @Column({ length: 10, nullable: true })
  status_code: string;

  @Column({ length: 20, nullable: true })
  response_time: string;

  @Column({ length: 10, nullable: true })
  content_length: string;

  @Column({ length: 50, nullable: true })
  browser: string;

  @Column({ length: 50, nullable: true })
  version: string;

  @Column({ length: 50, nullable: true })
  os: string;

  @Column({ length: 15, nullable: true })
  ip_address: string;

  @Column({ length: 50, nullable: true })
  platform: string;

  @Column({ length: 255, nullable: true })
  user_agent: string;

  @Column({ length: 255, nullable: true })
  requested_by: string;

  @Column({ length: 255, nullable: true })
  admin_page: string;

  @Column({ length: 255, nullable: true })
  action: string;

  @Column({ default: '', length: 15 })
  mobile_number: string;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    nullable: true,
  })
  created_at: Date;

  @Column({
    type: 'timestamp',
    onUpdate: 'CURRENT_TIMESTAMP',
    nullable: true,
  })
  updated_at: Date;
}
