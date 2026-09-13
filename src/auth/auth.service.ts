import { Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

import { UserRole } from '../common/models/user.model.js';
import { UserService } from '../users/user.service.js';
import { AuthConfig } from './auth.config.js';
import { UserAlreadyExistsException } from './user-already-exists-exception.exception.js';
import { User } from '../users/user.entity.js';

export interface RegisterArgs {
  email: string;
  role?: UserRole;
  fullName: string;
  password: string;
}

interface IAuthService {
  register(userToCreate: RegisterArgs): Promise<User>;
}

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    private readonly userService: UserService,
    private readonly authConfig: ConfigService<AuthConfig>,
  ) {}

  public async register(userToCreate: RegisterArgs): Promise<User> {
    // Find user by email
    const userAlReadyExists = await this.userService.findUserByEmail(
      userToCreate.email,
    );

    // Conflict error
    if (userAlReadyExists) throw new UserAlreadyExistsException();

    const user = {
      ...userToCreate,
    };

    // Hash the user password using bcrypt
    user.password = await bcrypt.hash(
      user.password,
      this.authConfig.get('auth').passwordSalt,
    );

    // Init role
    if (!user.role) user.role = UserRole.User;

    return this.userService.createUser(user);
  }
}
