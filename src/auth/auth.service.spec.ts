import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { Mock, vi } from 'vitest';

import { AuthService, LoginArgs, RegisterArgs } from './auth.service.js';
import { UserRole } from '../common/models/user.model.js';
import { UserService } from '../users/user.service.js';
import { UserAlreadyExistsException } from './user-already-exists-exception.exception.js';
import { User } from '../users/user.entity.js';
import { authConfig } from './config/auth.config.js';

describe('AuthService', () => {
  let authService: AuthService;
  let userService: {
    findUserByEmail: Mock;
    createUser: Mock;
  };
  let jwtService: {
    signAsync: Mock;
  };

  const user = {
    id: '3cb57923-871a-45e0-999c-3cbcd239844a',
    email: 'user_123@yopmail.com',
    fullName: 'John Doe',
    role: UserRole.User,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as User;

  beforeEach(async () => {
    userService = {
      findUserByEmail: vi.fn(),
      createUser: vi.fn(),
    };
    jwtService = {
      signAsync: vi.fn(),
    };

    const app: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: userService },
        {
          provide: authConfig.KEY,
          useValue: {
            passwordSalt: 4,
            secret: 'test-secret',
            issuer: 'https://issuer.test',
            audience: 'https://audience.test',
          },
        },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    authService = app.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should hash the password and create the user', async () => {
      const partialUser: RegisterArgs = {
        email: user.email,
        password: 'p@Ssword!',
        fullName: user.fullName,
        role: user.role,
      };
      userService.findUserByEmail.mockResolvedValue(null);
      userService.createUser.mockResolvedValue(user);

      const result = await authService.register(partialUser);

      expect(userService.findUserByEmail).toHaveBeenCalledTimes(1);
      expect(userService.findUserByEmail).toHaveBeenCalledWith(
        partialUser.email,
      );
      expect(userService.createUser).toHaveBeenCalledTimes(1);
      // The password passed to createUser must be hashed, not the plain one.
      expect(userService.createUser).toHaveBeenCalledWith(
        expect.objectContaining({
          password: expect.not.stringContaining('p@Ssword!'),
        }),
      );
      expect(result).toEqual(user);
    });

    it('should default the role to USER when none is provided', async () => {
      const partialUser: RegisterArgs = {
        email: user.email,
        password: 'p@Ssword!',
        fullName: user.fullName,
      };
      userService.findUserByEmail.mockResolvedValue(null);
      userService.createUser.mockResolvedValue(user);

      await authService.register(partialUser);

      expect(userService.createUser).toHaveBeenCalledWith(
        expect.objectContaining({ role: UserRole.User }),
      );
    });

    it('should throw a UserAlreadyExistsException when the email is already used', async () => {
      const partialUser: RegisterArgs = {
        email: user.email,
        password: 'p@Ssword!',
        fullName: user.fullName,
        role: user.role,
      };
      userService.findUserByEmail.mockResolvedValue(user);

      await expect(authService.register(partialUser)).rejects.toBeInstanceOf(
        UserAlreadyExistsException,
      );
      expect(userService.createUser).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const rawPassword = 'p@Ssword!';
    let hashedUser: User;

    beforeEach(async () => {
      hashedUser = { ...user, password: await bcrypt.hash(rawPassword, 4) };
    });

    it('should return an access token and the claims for valid credentials', async () => {
      const loginArgs: LoginArgs = {
        email: hashedUser.email,
        password: rawPassword,
      };
      userService.findUserByEmail.mockResolvedValue(hashedUser);
      jwtService.signAsync.mockResolvedValue('signed.jwt.token');

      const result = await authService.login(loginArgs);

      expect(userService.findUserByEmail).toHaveBeenCalledWith(loginArgs.email);
      const expectedClaims = {
        sub: hashedUser.id,
        username: hashedUser.email,
        role: hashedUser.role,
      };
      expect(jwtService.signAsync).toHaveBeenCalledWith(expectedClaims);
      expect(result).toEqual({
        accessToken: 'signed.jwt.token',
        claims: expectedClaims,
      });
    });

    it('should throw an UnauthorizedException when no user matches the email', async () => {
      userService.findUserByEmail.mockResolvedValue(null);

      await expect(
        authService.login({
          email: 'unknown@yopmail.com',
          password: rawPassword,
        }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should throw an UnauthorizedException when the password is wrong', async () => {
      userService.findUserByEmail.mockResolvedValue(hashedUser);

      await expect(
        authService.login({
          email: hashedUser.email,
          password: 'wrong-password',
        }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });
  });
});
