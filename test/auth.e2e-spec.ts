import { randomUUID } from 'node:crypto';

import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { Repository } from 'typeorm';

import { AppModule } from './../src/app.module.js';
import { User } from '../src/users/user.entity.js';
import { UserRole } from '../src/common/models/user.model.js';

describe('AuthController (e2e)', () => {
  let app: INestApplication<App>;
  let userRepository: Repository<User>;
  const createdEmails: string[] = [];

  const uniqueEmail = () => {
    // The email column is capped at 32 chars (see UserDto), so keep this short.
    const uniqueSuffix = randomUUID().replace(/-/g, '').slice(0, 10);
    const email = `e2e-${uniqueSuffix}@yopmail.com`;
    createdEmails.push(email);
    return email;
  };

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
  });

  afterAll(async () => {
    // Best-effort cleanup so repeated runs don't accumulate test users.
    await Promise.all(
      createdEmails.map((email) => userRepository.delete({ email })),
    );
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('should register a new user and return it without the password', async () => {
      const email = uniqueEmail();

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email,
          password: 'p@SsWord123!',
          fullName: 'John Doe',
        })
        .expect(HttpStatus.OK);
      expect(response.body).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          email,
          fullName: 'John Doe',
          role: UserRole.User,
        }),
      );
      expect(response.body.password).toBeUndefined();
    });

    it('should default the role to USER when none is provided', async () => {
      const email = uniqueEmail();

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email,
          password: 'p@SsWord123!',
          fullName: 'Jane Doe',
        })
        .expect(HttpStatus.OK);

      expect(response.body.role).toBe(UserRole.User);
    });

    it('should reject registration with an already used email (409)', async () => {
      const email = uniqueEmail();
      const payload = {
        email,
        password: 'p@SsWord123!',
        fullName: 'John Doe',
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(payload)
        .expect(HttpStatus.OK);

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(payload)
        .expect(HttpStatus.CONFLICT);

      expect(response.body.message).toMatch('The email is already exists !');
    });

    it('should reject an invalid email (400)', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'not-an-email',
          password: 'p@SsWord123!',
          fullName: 'John Doe',
        })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should reject a password that is too short (400)', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: uniqueEmail(),
          password: '123',
          fullName: 'John Doe',
        })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should reject a payload missing required fields (400)', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: uniqueEmail() })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should reject unknown fields not part of the DTO (400)', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: uniqueEmail(),
          password: 'p@SsWord123!',
          fullName: 'John Doe',
          isSuperAdmin: true,
        })
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe('POST /auth/login', () => {
    const password = 'p@SsWord123!';

    const registerUser = async (email: string) => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email, password, fullName: 'John Doe' })
        .expect(HttpStatus.OK);
    };

    it('should authenticate with valid credentials and return an access token', async () => {
      const email = uniqueEmail();
      await registerUser(email);

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password })
        .expect(HttpStatus.OK);

      expect(response.body).toEqual(
        expect.objectContaining({ accessToken: expect.any(String) }),
      );
      expect(response.body.accessToken.length).toBeGreaterThan(32);
    });

    it('should reject an unknown email (401)', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: uniqueEmail(), password })
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should reject a wrong password (401)', async () => {
      const email = uniqueEmail();
      await registerUser(email);

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password: 'wrong-password' })
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should reject an invalid email (400)', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'not-an-email', password })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should reject a payload missing required fields (400)', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: uniqueEmail() })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should reject unknown fields not part of the DTO (400)', async () => {
      const email = uniqueEmail();
      await registerUser(email);

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password, isSuperAdmin: true })
        .expect(HttpStatus.BAD_REQUEST);
    });
  });
});
