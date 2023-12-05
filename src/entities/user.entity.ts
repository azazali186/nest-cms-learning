import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  JoinColumn,
  ManyToOne,
  OneToOne,
} from 'typeorm';
import { Role } from './role.entity';
import { Session } from './session.entity';
import { UserStatus } from '../enum/user-status.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({ default: '', length: 15 })
  mobile_number: string;

  @Column()
  name: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  last_login: Date;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn()
  created_by: User | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn()
  updated_by: User | null;

  @Column({
    type: 'timestamp',
    onUpdate: 'CURRENT_TIMESTAMP',
    nullable: true,
  })
  updated_at: Date;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @ManyToOne(() => Role, (role) => role.users)
  // @Transform(({ value }) => value.name)
  roles: Role;

  @OneToMany(() => Session, (session) => session.user)
  sessions: Session[];

  @OneToOne(() => Session)
  @JoinColumn()
  get latestSession(): Session | undefined {
    if (this.sessions && this.sessions.length > 0) {
      return this.sessions.reduce((latest, current) =>
        current.created_at > latest.created_at ? current : latest,
      );
    }
    return undefined;
  }
}
