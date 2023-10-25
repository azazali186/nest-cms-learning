import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToMany,
  JoinTable,
  EntityManager,
} from 'typeorm';
import { User } from './user.entity';
import { Permission } from './permission.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  created_at: Date;

  @ManyToMany(() => User, (user) => user.roles)
  users: User[];

  @ManyToMany(() => Permission, (permission) => permission.roles)
  @JoinTable({ name: 'role_permissions' })
  permissions: Permission[];

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
