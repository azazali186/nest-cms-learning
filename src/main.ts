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

let permissionRepo: Repository<Permission>;
let roleRepo: Repository<Role>;

async function bootstrap() {
  const server = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();
  app.use(helmet());
  await app.startAllMicroservices();

  const config = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('Nest CMS API')
    .setDescription('The Nest CMS API Management System')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  await app.listen(process.env.PORT || 3001);

  const entityManager: EntityManager = app.get(EntityManager);
  permissionRepo = entityManager.getRepository(Permission);
  roleRepo = entityManager.getRepository(Role);

  extractAndSaveRoutes(server);
}
bootstrap();

function extractAndSaveRoutes(server: express.Express) {
  const routes = server._router.stack
    .filter((layer: { route: any }) => layer.route)
    .map((layer: { route: { methods: object; path: any } }) => ({
      methods: Object.keys(layer.route.methods).map((method) =>
        method.toUpperCase(),
      ),
      path: layer.route.path,
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
    guard: 'web',
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
