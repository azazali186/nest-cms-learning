import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  EntityManager,
  OneToMany,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { User } from './user.entity';
import { Permission } from './permission.entity';
import { AdminPage } from './admin-page.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by_id' })
  created_by: User | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'updated_by_id' })
  updated_by: User | null;

  @Column({
    type: 'timestamp',
    onUpdate: 'CURRENT_TIMESTAMP',
    nullable: true,
  })
  updated_at: Date;

  @OneToMany(() => User, (user) => user.roles)
  users: User[];

  @ManyToMany(() => Permission, (permission) => permission.roles)
  @JoinTable({ name: 'role_permissions' })
  permissions: Permission[];
  adminPages: AdminPage[];

  // Get default role or create if not exists
  static async getDefaultRole(entityManager: EntityManager): Promise<Role> {
    return this.getOrCreateRole(entityManager, 'member', 'Default member role');
  }

  // Get admin role or create if not exists
  static async getAdminRole(entityManager: EntityManager): Promise<Role> {
    return this.getOrCreateRole(entityManager, 'admin', 'Default admin role');
  }

  // Helper function to get or create role
  private static async getOrCreateRole(
    entityManager: EntityManager,
    roleName: string,
    description: string,
  ): Promise<Role> {
    let role = await entityManager.findOne(Role, { where: { name: roleName } });
    if (!role) {
      role = new Role();
      role.name = roleName;
      role.description = description;
      await entityManager.save(Role, role);
    }
    return role;
  }
}
