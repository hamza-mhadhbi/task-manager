import { InternalServerErrorException } from '@nestjs/common';
import { registerAs } from '@nestjs/config';

export interface AuthConfig {
  passwordSalt: number;
  secret: string;
  issuer: string;
  audience: string;
}

export function authFactory(): AuthConfig {
  const { JWT_AUDIENCE, JWT_ISSUER, JWT_SECRET, PASSWORD_SALT } = process.env;

  if (!JWT_SECRET || JWT_SECRET.trim() === '')
    throw new InternalServerErrorException(
      'Auth Config - Invalid value for JWT_SECRET !',
    );

  try {
    new URL(JWT_ISSUER ?? '');
  } catch {
    throw new InternalServerErrorException(
      'Auth Config - Invalid value for JWT_ISSUER !',
    );
  }

  try {
    new URL(JWT_AUDIENCE ?? '');
  } catch {
    throw new InternalServerErrorException(
      'Auth Config - Invalid value for JWT_AUDIENCE !',
    );
  }

  return {
    passwordSalt: Number.parseInt(PASSWORD_SALT ?? '10', 10),
    secret: JWT_SECRET,
    issuer: JWT_ISSUER as string,
    audience: JWT_AUDIENCE as string,
  };
}

export const authConfig = registerAs<AuthConfig>('auth', authFactory);
