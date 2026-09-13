import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { Mock, vi } from 'vitest';
import { Repository } from 'typeorm';

import { UserRepository } from './user.repository.js';
import { User } from './user.entity.js';
import { UserRole } from '../common/models/user.model.js';

describe('UserRepository', () => {
  let userRepository: UserRepository;
  let repository: {
    findOneBy: Mock;
    create: Mock;
    save: Mock;
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
    repository = {
      findOneBy: vi.fn(),
      create: vi.fn(),
      save: vi.fn(),
    };

    const app: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        {
          provide: getRepositoryToken(User),
          useValue: repository as unknown as Repository<User>,
        },
      ],
    }).compile();

    userRepository = app.get<UserRepository>(UserRepository);
  });

  describe('findByEmail', () => {
    it('should return the user when found', async () => {
      repository.findOneBy.mockResolvedValue(user);

      const result = await userRepository.findByEmail(user.email);

      expect(repository.findOneBy).toHaveBeenCalledTimes(1);
      expect(repository.findOneBy).toHaveBeenCalledWith({
        email: user.email,
      });
      expect(result).toBe(user);
    });

    it('should return null when no user matches the email', async () => {
      repository.findOneBy.mockResolvedValue(null);

      const result = await userRepository.findByEmail('unknown@yopmail.com');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create then save the user entity', async () => {
      const partialUser: Partial<User> = {
        email: user.email,
        password: user.password,
        fullName: user.fullName,
        role: user.role,
      };
      repository.create.mockReturnValue(partialUser);
      repository.save.mockResolvedValue(user);

      const result = await userRepository.create(partialUser);

      expect(repository.create).toHaveBeenCalledTimes(1);
      expect(repository.create).toHaveBeenCalledWith(partialUser);
      expect(repository.save).toHaveBeenCalledTimes(1);
      expect(repository.save).toHaveBeenCalledWith(partialUser);
      expect(result).toBe(user);
    });
  });
});
