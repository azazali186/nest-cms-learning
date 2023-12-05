import * as dotenv from 'dotenv';

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';
import { Permission } from './entities/permission.entity';
import { EntityManager, Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import helmet from 'helmet';
import {
  EXCLUDED_ROUTES,
  getPermissionNameFromRoute,
} from './utils/helper.utils';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as swaggerUi from 'swagger-ui-express';
import {
  accessLogMiddleware,
  errorLogMiddleware,
} from './middleware/logging.middleware';
import { IoAdapter } from '@nestjs/platform-socket.io';

let permissionRepo: Repository<Permission>;
let roleRepo: Repository<Role>;

async function bootstrap() {
  const server = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server), {
    httpsOptions: null,
  });
  app.use(accessLogMiddleware());

  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe());

  app.useWebSocketAdapter(new IoAdapter(app));
  // app.useGlobalFilters(new HttpExceptionFilter());
  app.enableCors();

  await app.startAllMicroservices();

  const config = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('Next CMS Management API')
    .setDescription('Next CMS Management API')
    .setVersion('1.0')
    .addServer(process.env.SWAGGER_SERVER)
    .addServer(process.env.SWAGGER_DEV_SERVER)
    .build();

  const document = SwaggerModule.createDocument(app, config);

  server.use(
    '/swagger',
    swaggerUi.serve,
    swaggerUi.setup(document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    }),
  );

  app.use(helmet());
  app.use(errorLogMiddleware);
  await app.listen(process.env.PORT || 4000);

  const entityManager: EntityManager = app.get(EntityManager);
  permissionRepo = entityManager.getRepository(Permission);
  roleRepo = entityManager.getRepository(Role);

  extractAndSaveRoutes(server);
}

bootstrap();

function extractAndSaveRoutes(server: express.Express) {
  // console.log('server._router.stack   :   ', server._router.stack);
  const routes = server._router.stack
    .filter((layer: { route: any }) => layer.route)
    .map((layer: { route: { methods: object; path: any; stack: any } }) => ({
      methods: Object.keys(layer.route.methods).map((method) =>
        method.toUpperCase(),
      ),
      path: layer.route.path,
      stack: layer.route?.stack || '',
    }));

  for (const route of routes) {
    saveRouteAsPermission(route);
  }
  associatePermissionWithAdminRole();
}

async function saveRouteAsPermission(route: any) {
  const name = getPermissionNameFromRoute(route.path, route.methods[0])
    .toUpperCase()
    .replaceAll('-', '_');

  // Avoid multiple database queries by checking for the existence of the permission just once
  let permission = await permissionRepo.findOne({
    where: { name, path: route.path },
  });

  if (!permission && !EXCLUDED_ROUTES.includes(name.toUpperCase())) {
    permission = await savePermission(name, route.path);
  }
}

function savePermission(name: string, path: any): Promise<Permission> {
  const permission = permissionRepo.create({
    name,
    path,
  });

  return permissionRepo.save(permission);
}

async function associatePermissionWithAdminRole() {
  const permissions: Permission[] = await permissionRepo.find();
  let role = await roleRepo.findOne({
    where: { name: 'admin' },
    relations: ['permissions'],
  });

  if (!role) {
    // If the admin role doesn't exist, create it and assign all permissions
    role = new Role();
    role.name = 'admin';
    role.description = 'Administrator';
    role.permissions = permissions;
    await roleRepo.save(role);
  } else {
    // If the admin role exists, make sure all permissions are assigned
    for (const permission of permissions) {
      if (!role.permissions.some((p) => p.id === permission.id)) {
        role.permissions.push(permission);
      }
    }
    await roleRepo.save(role);
  }
}
