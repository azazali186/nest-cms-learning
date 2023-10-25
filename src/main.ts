import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';
import { Permission } from './entities/permission.entity';
import { EntityManager, Repository } from 'typeorm';
import { Role } from './entities/role.entity';

let permissionRepo: Repository<Permission>;
let roleRepo: Repository<Role>;

async function bootstrap() {
  const server = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

  app.setGlobalPrefix('api/v1');
  await app.startAllMicroservices();
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
}

async function saveRouteAsPermission(route: any) {
  const name = getPermissionNameFromRoute(route.path, route.methods[0]);

  // Avoid multiple database queries by checking for the existence of the permission just once
  let permission = await permissionRepo.findOne({
    where: { name, path: route.path },
  });

  if (!permission) {
    permission = await savePermission(name, route.path);
    await associatePermissionWithAdminRole(permission);
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

function getPermissionNameFromRoute(path: string, method: string): string {
  method = getMethodName(path, method);
  const name = path;
  path =
    method.toLowerCase() +
    '-' +
    path.replaceAll('/api/v1/', '').replaceAll('/', '-').replace('-:id', '');

  if (path.includes('login')) {
    path = 'login';
  }
  if (path.includes('logout')) {
    path = 'logout';
  }
  if (path.includes('register')) {
    path = 'register';
  }
  if (path.includes('forgot-password')) {
    path = 'forgot-password';
  }
  if (path.includes('reset-password')) {
    path = 'reset-password';
  }
  if (path.includes('verify-email')) {
    path = 'verify-email';
  }
  if (
    path.includes('approval') ||
    path.includes('reject') ||
    path.includes('approve') ||
    path.includes('approved') ||
    path.includes('cancel') ||
    path.includes('cancelled') ||
    path.includes('rejected') ||
    path.includes('confirmed') ||
    path.includes('confirm')
  ) {
    path = name
      .replaceAll('/api/v1/auth-service/', '')
      .replaceAll('/', '-')
      .replace('-:id', '');
  }
  return path;
}

function getMethodName(path: string, method: string): string {
  switch (method) {
    case 'GET':
      if (path.slice(-3) == ':id') {
        method = 'view';
      } else {
        method = 'view-all';
      }
      break;
    case 'POST':
      method = 'create';
      break;
    case 'PATCH':
      method = 'update';
      break;
    case 'PUT':
      method = 'update';
      break;
    case 'DELETE':
      method = 'delete';
      break;

    default:
      method = 'view-all';
      break;
  }
  return method;
}

async function associatePermissionWithAdminRole(permission: Permission) {
  let role = await roleRepo.findOne({
    where: { name: 'admin' },
    relations: ['permissions'],
  });

  if (!role) {
    role = roleRepo.create({
      name: 'admin',
      description: 'Administrator',
      permissions: [permission],
    });
  } else if (!role.permissions.some((p) => p.id === permission.id)) {
    role.permissions.push(permission);
  }

  await roleRepo.save(role);
}
