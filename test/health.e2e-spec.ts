import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types.js';

import { AppModule } from './../src/app.module.js';

describe('HealthController (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /health', () => {
    it(`should return ${HttpStatus.OK}`, async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(HttpStatus.OK);
      expect(response.body.status).toEqual('ok');
      expect(response.body.info.database.status).toEqual('up');
      expect(response.body.details.database.status).toEqual('up');
      expect(typeof response.body.info.database.responseTime).toEqual('number');
      expect(typeof response.body.details.database.responseTime).toEqual(
        'number',
      );
    });
  });
});
