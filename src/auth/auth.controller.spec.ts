import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Mock, vi } from 'vitest';

import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { RegisterRequestDto } from './register-request.dto.js';
import { RegisterResponseDto } from './register-response-dto.js';
import { UserRole } from '../common/models/user.model.js';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: { register: Mock };

  const registerRequest: RegisterRequestDto = {
    email: 'user_123@yopmail.com',
    password: 'p@SsWord123!',
    fullName: 'John Doe',
    role: UserRole.User,
  };

  beforeEach(async () => {
    authService = {
      register: vi.fn(),
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    authController = app.get<AuthController>(AuthController);
  });

  describe('POST /auth/register', () => {
    it('should delegate registration to AuthService.register', async () => {
      const registerResponse: RegisterResponseDto = {
        id: '3cb57923-871a-45e0-999c-3cbcd239844a',
        email: registerRequest.email,
        fullName: registerRequest.fullName,
        role: UserRole.User,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      authService.register.mockResolvedValue(registerResponse);

      const result = await authController.register(registerRequest);
      expect(authService.register).toHaveBeenCalledTimes(1);
      expect(authService.register).toHaveBeenCalledWith(registerRequest);
      expect(result).toEqual(registerResponse);
    });

    it('should propagate the error thrown by AuthService.register', async () => {
      const error = new ConflictException(
        'Email already used by an another account !',
      );
      authService.register.mockRejectedValue(error);

      await expect(authController.register(registerRequest)).rejects.toThrow(
        error,
      );
    });
  });
});
