import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from 'src/controllers/auth.controller';
import { BroadcastingController } from 'src/controllers/broadcasting.controller';
import { LogController } from 'src/controllers/log.controller';
import { PermissionsController } from 'src/controllers/permission.controller';
import { RoleController } from 'src/controllers/role.controller';
import { UserController } from 'src/controllers/user.controller';
import { AdminPage } from 'src/entities/admin-page.entity';
import { Log } from 'src/entities/log.entity';
import { Permission } from 'src/entities/permission.entity';
import { Role } from 'src/entities/role.entity';
import { Session } from 'src/entities/session.entity';
import { User } from 'src/entities/user.entity';
import { AdminPageRepository } from 'src/repositories/admin-page.repository';
import { LogRepository } from 'src/repositories/log.repository';
import { PermissionRepository } from 'src/repositories/permission.repository';
import { RoleRepository } from 'src/repositories/role.repository';
import { SessionRepository } from 'src/repositories/session.repository';
import { UserRepository } from 'src/repositories/user.repository';
import { LangService } from 'src/services/lang.service';
import { LogService } from 'src/services/log.service';
import { PermissionService } from 'src/services/permission.service';
import { RedisService } from 'src/services/redis.service';
import { RoleService } from 'src/services/role.service';
import { UserService } from 'src/services/user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, Permission, AdminPage, Log, Session]),
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
    LogController,
    BroadcastingController,
  ],
  providers: [
    UserRepository,
    RoleRepository,
    PermissionRepository,
    AdminPageRepository,
    SessionRepository,
    UserService,
    RoleService,
    PermissionService,
    JwtService,
    LangService,
    LogService,
    LogRepository,
    RedisService,
  ],
})
export class AuthModule {}
