import { Test, TestingModule } from '@nestjs/testing';
import { Mock, vi } from 'vitest';

import { UserService } from './user.service.js';
import { UserRepository } from './user.repository.js';
import { User } from './user.entity.js';
import { UserRole } from '../common/models/user.model.js';

describe('UserService', () => {
  let userService: UserService;
  let userRepository: {
    findByEmail: Mock;
    create: Mock;
  };

  const user: User = {
    id: '3cb57923-871a-45e0-999c-3cbcd239844a',
    email: 'user_123@yopmail.com',
    password: 'hashed-password',
    fullName: 'John Doe',
    role: UserRole.User,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(async () => {
    userRepository = {
      findByEmail: vi.fn(),
      create: vi.fn(),
    };

    const app: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: UserRepository, useValue: userRepository },
      ],
    }).compile();

    userService = app.get<UserService>(UserService);
  });

  describe('findUserByEmail', () => {
    it('should return the user when found', async () => {
      userRepository.findByEmail.mockResolvedValue(user);

      const result = await userService.findUserByEmail(user.email);

      expect(userRepository.findByEmail).toHaveBeenCalledTimes(1);
      expect(userRepository.findByEmail).toHaveBeenCalledWith(user.email);
      expect(result).toBe(user);
    });

    it('should return null when no user matches the email', async () => {
      userRepository.findByEmail.mockResolvedValue(null);

      const result = await userService.findUserByEmail('unknown@yopmail.com');

      expect(result).toBeNull();
    });
  });

  describe('createUser', () => {
    it('should delegate creation to the repository', async () => {
      const partialUser: Partial<User> = {
        email: user.email,
        password: user.password,
        fullName: user.fullName,
        role: user.role,
      };
      userRepository.create.mockResolvedValue(user);

      const result = await userService.createUser(partialUser);

      expect(userRepository.create).toHaveBeenCalledTimes(1);
      expect(userRepository.create).toHaveBeenCalledWith(partialUser);
      expect(result).toBe(user);
    });
  });
});
