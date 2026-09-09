import { ConfigFactory, registerAs } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';

export default registerAs<TypeOrmModuleAsyncOptions, ConfigFactory>(
  'database',
  () => ({
    type: process.env.DB_TYPE ?? 'mysql',
    username: process.env.DB_USERNAME ?? 'root',
    password: process.env.DB_PASSWORD ?? '',
    host: process.env.DB_HOST ?? 'localhost',
    port: Number.parseInt(process.env.DB_PORT ?? '3306', 10),
    database: 'task_manager',
  }),
);
