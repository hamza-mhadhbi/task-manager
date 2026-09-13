import { User } from '../../users/user.entity.js';
import databaseConfig from './db.config.js';

describe('databaseConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.DB_TYPE;
    delete process.env.DB_USERNAME;
    delete process.env.DB_PASSWORD;
    delete process.env.DB_HOST;
    delete process.env.DB_PORT;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('falls back to default values when no env vars are set', () => {
    expect(databaseConfig()).toEqual({
      type: 'mysql',
      username: 'root',
      password: '',
      host: 'localhost',
      port: 3306,
      database: 'task_manager',
      synchronize: false,
      autoLoadEntities: false,
      entities: [User],
    });
  });

  it('reads values from environment variables when provided', () => {
    process.env.DB_TYPE = 'postgres';
    process.env.DB_USERNAME = 'admin';
    process.env.DB_PASSWORD = 'secret';
    process.env.DB_HOST = 'db.internal';
    process.env.DB_PORT = '5433';
    process.env.DB_SYNCHRONIZE = 'false';
    process.env.DB_AUTO_LOAD_ENTITIES = 'false';

    expect(databaseConfig()).toEqual({
      type: 'postgres',
      username: 'admin',
      password: 'secret',
      host: 'db.internal',
      port: 5433,
      database: 'task_manager',
      synchronize: false,
      autoLoadEntities: false,
      entities: [User],
    });

    // Set some values
    process.env.DB_SYNCHRONIZE = 'true';
    process.env.DB_AUTO_LOAD_ENTITIES = 'true';

    expect(databaseConfig()).toEqual({
      type: 'postgres',
      username: 'admin',
      password: 'secret',
      host: 'db.internal',
      port: 5433,
      database: 'task_manager',
      synchronize: true,
      autoLoadEntities: true,
      entities: [User],
    });
  });

  it('parses DB_PORT as a number', () => {
    process.env.DB_PORT = '5432';

    expect(databaseConfig().port).toBe(5432);
    expect(typeof databaseConfig().port).toBe('number');
  });
});
