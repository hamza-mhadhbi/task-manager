import { registerAs } from '@nestjs/config';
import { InternalServerErrorException } from '@nestjs/common';
import type { JwtSignOptions } from '@nestjs/jwt';

import { authFactory } from './auth.config.js';

interface JWTConfig {
  secret: string;
  signOptions: {
    expiresIn: JwtSignOptions['expiresIn'];
    issuer: string;
    audience: string;
  };
}

export const jwtConfig = registerAs<JWTConfig>('jwt', () => {
  const { secret, issuer, audience } = authFactory();

  const { JWT_EXPIRES_IN } = process.env;

  if (!JWT_EXPIRES_IN || JWT_EXPIRES_IN.trim() === '')
    throw new InternalServerErrorException(
      'JWTConfig - invalid value for JWT_EXPIRES_IN !',
    );

  return {
    secret,
    signOptions: {
      expiresIn: JWT_EXPIRES_IN as JwtSignOptions['expiresIn'],
      issuer,
      audience,
    },
  };
});
