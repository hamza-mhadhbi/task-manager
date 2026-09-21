import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { UserModule } from '../users/user.module.js';
import { authConfig } from './config/auth.config.js';
import { jwtConfig } from './config/jwt.config.js';

@Module({
  imports: [
    UserModule,
    ConfigModule.forFeature(authConfig),
    JwtModule.registerAsync(jwtConfig.asProvider()),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
