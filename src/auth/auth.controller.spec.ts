import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Mock, vi } from 'vitest';

import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { RegisterRequestDto } from './dto/register-request.dto.js';
import { RegisterResponseDto } from './dto/register-response-dto.js';
import { LoginRequestDto } from './dto/login-request.dto.js';
import { LoginResponseDto } from './dto/login-response.dto.js';
import { UserRole } from '../common/models/user.model.js';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: { register: Mock; login: Mock };

  const registerRequest: RegisterRequestDto = {
    email: 'user_123@yopmail.com',
    password: 'p@SsWord123!',
    fullName: 'John Doe',
    role: UserRole.User,
  };

  beforeEach(async () => {
    authService = {
      register: vi.fn(),
      login: vi.fn(),
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

  describe('POST /auth/login', () => {
    const loginRequest: LoginRequestDto = {
      email: 'user_123@yopmail.com',
      password: 'p@SsWord123!',
    };

    it('should delegate login to AuthService.login and return the access token', async () => {
      authService.login.mockResolvedValue({
        accessToken: 'signed.jwt.token',
        claims: {
          sub: '3cb57923-871a-45e0-999c-3cbcd239844a',
          username: loginRequest.email,
          email: loginRequest.email,
          role: UserRole.User,
        },
      });

      const result = await authController.login(loginRequest);

      expect(authService.login).toHaveBeenCalledTimes(1);
      expect(authService.login).toHaveBeenCalledWith(loginRequest);
      expect(result).toEqual(new LoginResponseDto('signed.jwt.token'));
    });

    it('should propagate the error thrown by AuthService.login', async () => {
      const error = new UnauthorizedException('Invalid credentials !');
      authService.login.mockRejectedValue(error);

      await expect(authController.login(loginRequest)).rejects.toThrow(error);
    });
  });
});
