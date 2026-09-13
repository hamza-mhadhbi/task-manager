import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { UserModule } from '../users/user.module.js';
import { authConfig } from './auth.config.js';

@Module({
  imports: [UserModule, ConfigModule.forFeature(authConfig)],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
