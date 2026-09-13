import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from './user.entity.js';
import { UserService } from './user.service.js';
import { UserRepository } from './user.repository.js';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UserRepository, UserService],
  exports: [UserService, TypeOrmModule],
})
export class UserModule {}
