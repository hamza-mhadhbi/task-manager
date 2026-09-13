import { Injectable } from '@nestjs/common';

import { User } from './user.entity.js';
import { UserRepository } from './user.repository.js';

/* v8 ignore start */
@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}
  /* v8 ignore stop */

  public async findUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  public async createUser(user: Partial<User>): Promise<User> {
    return this.userRepository.create(user);
  }
}
