import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Mock, vi } from 'vitest';
import { Request } from 'express';

import { UserController } from './user.controller.js';
import { UserService } from './user.service.js';
import { User } from './user.entity.js';
import { UserRole } from '../common/models/user.model.js';
import { MeResponseDto } from './dto/me-response.dto.js';

describe('UserController', () => {
  let userController: UserController;
  let userService: { findUserById: Mock };

  const now = new Date().toISOString();
  const anUser: User = {
    id: '123456',
    password: 'P@ssWorD1',
    role: UserRole.User,
    fullName: 'Full Name',
    email: 'fullname@yopmail.com',
    createdAt: now,
    updatedAt: now,
  };

  const anUserWithoutPassword: MeResponseDto = {
    id: anUser.id,
    role: anUser.role,
    fullName: anUser.fullName,
    email: anUser.email,
    createdAt: anUser.createdAt,
    updatedAt: anUser.updatedAt as string,
  };

  beforeEach(async () => {
    userService = {
      findUserById: vi.fn((id) => {
        if (id === anUser.id) return anUser;
        throw new NotFoundException(UserService.USER_NOT_FOUND_ERROR);
      }),
    };
    const app: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: userService }],
    }).compile();

    userController = app.get<UserController>(UserController);
  });

  it('GET /users/me should returns the user profile object', async () => {
    const req = mockRequest({
      userId: anUser.id,
    });
    const user = await userController.me(req);
    expect(userService.findUserById).toHaveBeenCalledTimes(1);
    expect(userService.findUserById).toHaveBeenCalledWith(anUser.id);
    expect(user).toEqual(anUserWithoutPassword);
  });

  it('GET /users/me should throw a not found exception', async () => {
    const wrongUserId = 'someWrongUserId';
    const req = mockRequest({
      userId: wrongUserId,
    });
    await expect(userController.me(req)).rejects.toThrow(
      new NotFoundException(UserService.USER_NOT_FOUND_ERROR),
    );
    expect(userService.findUserById).toHaveBeenCalledTimes(1);
    expect(userService.findUserById).toHaveBeenCalledWith(wrongUserId);
  });

  it('GET /users/me should throw an unauthorized exception', async () => {
    const req = mockRequest();
    await expect(userController.me(req)).rejects.toThrow(
      new UnauthorizedException(),
    );
    expect(userService.findUserById).toHaveBeenCalledTimes(0);
  });
});

function mockRequest(user?: unknown): Request {
  return { user } as Partial<Request> as Request;
}
