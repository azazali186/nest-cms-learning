import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinTable,
  ManyToMany, // Import this line
} from 'typeorm';
import { Permission } from './permission.entity';

@Entity('admin_page')
export class AdminPage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  icon: string;

  @Column({ nullable: true })
  url: string;

  @Column({ nullable: true })
  route_name: string;

  @ManyToMany(() => Permission, (permission) => permission.admin_pages)
  @JoinTable({ name: 'admin_page_permissions' })
  permissions: Permission[];

  @OneToMany(() => AdminPage, (ap) => ap.parent)
  children: AdminPage[];

  @ManyToOne(() => AdminPage, (ap) => ap.children)
  parent: AdminPage;

  @Column({ default: true })
  status: boolean;

  isAccess: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({
    type: 'timestamp',
    onUpdate: 'CURRENT_TIMESTAMP',
    nullable: true,
  })
  updated_at: Date;
}
