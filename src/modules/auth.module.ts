import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from 'src/controllers/auth.controller';
import { PermissionsController } from 'src/controllers/permission.controller';
import { RoleController } from 'src/controllers/role.controller';
import { UserController } from 'src/controllers/user.controller';
import { Permission } from 'src/entities/permission.entity';
import { Role } from 'src/entities/role.entity';
import { Session } from 'src/entities/session.entity';
import { User } from 'src/entities/user.entity';
import { PermissionRepository } from 'src/repositories/permission.repository';
import { RoleRepository } from 'src/repositories/role.repository';
import { SessionRepository } from 'src/repositories/session.repository';
import { UserRepository } from 'src/repositories/user.repository';
import { AuthService } from 'src/services/auth.service';
import { PermissionService } from 'src/services/permission.service';
import { RoleService } from 'src/services/role.service';
import { UserService } from 'src/services/user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, Permission, Session]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'SECRET',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [
    AuthController,
    UserController,
    RoleController,
    PermissionsController,
  ],
  providers: [
    AuthService,
    UserRepository,
    RoleRepository,
    PermissionRepository,
    UserService,
    SessionRepository,
    RoleService,
    PermissionService,
  ],
})
export class AuthModule {}
