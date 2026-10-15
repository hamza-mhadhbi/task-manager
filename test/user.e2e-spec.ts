import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { type App } from 'supertest/types.js';
import request from 'supertest';

import { AppModule } from '../src/app.module.js';
import { User } from '../src/users/user.entity.js';

describe('UserController (e2e)', () => {
  let app: INestApplication<App>;
  let userRepository: Repository<User>;
  const email = `${Math.random().toString(36).substring(2, 11)}@yopmail.com`;
  const password = 'p@SsWord123!';
  let user: User;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    // Mirrors the global pipe configured in src/main.ts.
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();

    userRepository = moduleFixture.get<Repository<User>>(
      getRepositoryToken(User),
    );

    // Create a new user for test
    user = (
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email,
          password,
          fullName: 'Test Me',
        })
        .expect(HttpStatus.OK)
    ).body;
    accessToken = (
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email,
          password,
        })
        .expect(HttpStatus.OK)
    ).body.accessToken;
  });

  afterAll(async () => {
    if (user?.id) await userRepository.delete({ id: user.id });
    await app.close();
  });

  describe('GET /users/me', () => {
    it('should throw unauthorized exception when call it without jwt token', async () => {
      await request(app.getHttpServer())
        .get('/users/me')
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return user profile without password', async () => {
      const userProfile = (
        await request(app.getHttpServer())
          .get('/users/me')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(HttpStatus.OK)
      ).body;
      expect(userProfile).toEqual({
        id: user.id,
        email,
        fullName: user.fullName,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        role: user.role,
      });
      expect(userProfile.password).toBeUndefined();
    });
  });
});
