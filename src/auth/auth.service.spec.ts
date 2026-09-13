import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { Mock, vi } from 'vitest';

import { AuthService, RegisterArgs } from './auth.service.js';
import { UserRole } from '../common/models/user.model.js';
import { UserService } from '../users/user.service.js';
import { UserAlreadyExistsException } from './user-already-exists-exception.exception.js';
import { User } from '../users/user.entity.js';

describe('AuthService', () => {
  let authService: AuthService;
  let userService: {
    findUserByEmail: Mock;
    createUser: Mock;
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

    const app: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: userService },
        {
          provide: ConfigService,
          useValue: { get: vi.fn().mockReturnValue({ passwordSalt: 4 }) },
        },
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
});
