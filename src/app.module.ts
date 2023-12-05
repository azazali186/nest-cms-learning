import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthModule } from './modules/common.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { CheckPermissionMiddleware } from './middleware/check-permission.middleware';
import { JwtService } from '@nestjs/jwt';
import { UserService } from './services/user.service';
import { UserRepository } from './repositories/user.repository';
import { Permission } from './entities/permission.entity';
import { Role } from './entities/role.entity';
import { User } from './entities/user.entity';
import { RoleRepository } from './repositories/role.repository';
import { SessionRepository } from './repositories/session.repository';
import { Session } from './entities/session.entity';
import { PermissionRepository } from './repositories/permission.repository';
import { WsGateway } from './ws/ws.gateway';
import { JwtWebSocketMiddleware } from './middleware/jwt-socket.middlwware';
import { JwtAuthService } from './services/jwt-auth.service';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 3,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 20,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100,
      },
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(typeOrmConfig),
    TypeOrmModule.forFeature([User, Role, Permission, Session]),
    AuthModule,
  ],
  controllers: [],
  providers: [
    JwtService,
    UserService,
    UserRepository,
    RoleRepository,
    SessionRepository,
    PermissionRepository,
    JwtWebSocketMiddleware,
    JwtAuthService,
    WsGateway,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CheckPermissionMiddleware).forRoutes('*'); // This applies the middleware to all routes.
  }
}
