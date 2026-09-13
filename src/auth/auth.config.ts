import { ConfigFactory, registerAs } from '@nestjs/config';

export interface AuthConfig {
  auth: {
    passwordSalt: number;
  };
}

export const authConfig = registerAs<AuthConfig, ConfigFactory>('auth', () => ({
  passwordSalt: Number.parseInt(process.env.PASSWORD_SALT ?? '10', 10),
}));
