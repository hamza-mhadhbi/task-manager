import { OmitType } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

import { UserDto } from '../common/dto/user.dto.js';

export class RegisterResponseDto extends OmitType(UserDto, ['password']) {
  @Exclude()
  password?: string;

  constructor(partial: Partial<RegisterResponseDto>) {
    super(partial);
    Object.assign(this, partial);
  }
}
