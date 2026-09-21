import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { type ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { UserRole } from '../common/models/user.model.js';
import { UserService } from '../users/user.service.js';
import { authConfig } from './config/auth.config.js';
import { UserAlreadyExistsException } from './user-already-exists-exception.exception.js';
import { User } from '../users/user.entity.js';

export interface RegisterArgs extends LoginArgs {
  role?: UserRole;
  fullName: string;
}

export interface LoginArgs {
  email: string;
  password: string;
}

interface Claims {
  sub: string;
  username: string;
  role: UserRole;
}

export interface LoginReturnValue {
  accessToken: string;
  claims: Claims;
}

interface IAuthService {
  register(userToCreate: RegisterArgs): Promise<User>;
  login(loginAndPassword: LoginArgs): Promise<LoginReturnValue>;
}

@Injectable()
export class AuthService implements IAuthService {
  private static readonly INVALID_CREDENTIAL_ERROR = 'Invalid credentials !';

  constructor(
    private readonly userService: UserService,
    @Inject(authConfig.KEY)
    private readonly config: ConfigType<typeof authConfig>,
    private readonly jwtService: JwtService,
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
    user.password = await bcrypt.hash(user.password, this.config.passwordSalt);

    // Init role
    if (!user.role) user.role = UserRole.User;

    return this.userService.createUser(user);
  }

  public async login(loginAndPassword: LoginArgs): Promise<LoginReturnValue> {
    const user = await this.userService.findUserByEmail(loginAndPassword.email);

    // Invalid credential error
    if (!user)
      throw new UnauthorizedException(AuthService.INVALID_CREDENTIAL_ERROR);

    const result = await bcrypt.compare(
      loginAndPassword.password,
      user.password,
    );

    // Invalid credential error
    if (!result)
      throw new UnauthorizedException(AuthService.INVALID_CREDENTIAL_ERROR);

    const claims: Claims = {
      sub: user.id,
      username: user.email,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(claims);

    return { accessToken, claims };
  }
}
