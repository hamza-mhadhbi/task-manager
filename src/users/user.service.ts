import { Injectable, NotFoundException } from '@nestjs/common';

import { User } from './user.entity.js';
import { UserRepository } from './user.repository.js';

@Injectable()
export class UserService {
  public static readonly USER_NOT_FOUND_ERROR = 'User not found !';

  constructor(private readonly userRepository: UserRepository) {}

  public async findUserById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException(UserService.USER_NOT_FOUND_ERROR);
    return user;
  }

  public async findUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  public async createUser(user: Partial<User>): Promise<User> {
    return this.userRepository.create(user);
  }
}
