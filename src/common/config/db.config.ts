import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

// Entities
import { User } from '../../users/user.entity.js';

function stringToBoolean(val?: string): boolean {
  return val?.trim() === 'true' ? true : false;
}

export default registerAs<TypeOrmModuleOptions>(
  'database',
  () =>
    ({
      type: process.env.DB_TYPE ?? 'mysql',
      username: process.env.DB_USERNAME ?? 'root',
      password: process.env.DB_PASSWORD ?? '',
      host: process.env.DB_HOST ?? 'localhost',
      port: Number.parseInt(process.env.DB_PORT ?? '3306', 10),
      database: 'task_manager',
      entities: [User],
      // It's dangerous
      autoLoadEntities: stringToBoolean(process.env.DB_AUTO_LOAD_ENTITIES),
      synchronize: stringToBoolean(process.env.DB_SYNCHRONIZE),
    }) as TypeOrmModuleOptions,
);
