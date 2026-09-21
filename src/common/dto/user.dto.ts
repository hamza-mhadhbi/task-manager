import { ApiProperty } from '@nestjs/swagger';
import {
  IsUUID,
  IsNotEmpty,
  MaxLength,
  IsString,
  IsEnum,
  IsEmail,
  MinLength,
  IsDateString,
} from 'class-validator';
import { Exclude } from 'class-transformer';

import { UserRole } from '../models/user.model.js';

export class UserDto {
  @ApiProperty({
    type: 'string',
    maxLength: 36,
    required: true,
    nullable: false,
    example: '3cb57923-871a-45e0-999c-3cbcd239844a',
  })
  @IsUUID()
  @IsNotEmpty()
  @MaxLength(36)
  id: string;

  @ApiProperty({
    type: 'string',
    enum: UserRole,
    required: false,
    nullable: false,
    example: UserRole.User,
  })
  @IsString()
  @IsEnum(UserRole)
  @IsNotEmpty()
  // Define the default value
  role: UserRole = UserRole.User;

  @ApiProperty({
    type: 'string',
    required: true,
    nullable: false,
    maxLength: 255,
    example: 'user_123@yopmail.com',
  })
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  email: string;

  @ApiProperty({
    type: 'string',
    required: true,
    nullable: false,
    example: 'p@SsWord123!',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(32)
  @Exclude({ toPlainOnly: true })
  password: string;

  @ApiProperty({
    type: 'string',
    required: true,
    nullable: false,
    maxLength: 68,
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(68)
  fullName: string;

  @ApiProperty({
    type: 'string',
    required: true,
    nullable: false,
    maxLength: 32,
    example: '2026-09-13T08:20:04.049Z',
  })
  @IsDateString()
  @IsNotEmpty()
  createdAt: string;

  @ApiProperty({
    type: 'string',
    required: true,
    nullable: false,
    maxLength: 32,
    example: '2026-09-13T08:20:04.049Z',
  })
  @IsDateString()
  @IsNotEmpty()
  updatedAt: string;

  constructor(partial: Partial<UserDto>) {
    Object.assign(this, partial);
  }
}
