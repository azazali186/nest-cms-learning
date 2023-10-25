import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_PRIMARY_HOSTNAME || '192.168.30.28',
  port: parseInt(process.env.DB_PRIMARY_PORT) || 5556,
  username: 'janny',
  password: 'Aj189628@',
  database: 'nest-cms',
  entities: [],
  synchronize: true,
  autoLoadEntities: true,
  logging: true,
  logger: 'file',
};
