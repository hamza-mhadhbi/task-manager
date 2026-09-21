import { OmitType } from '@nestjs/swagger';

import { UserDto } from '../../common/dto/user.dto.js';

export class RegisterRequestDto extends OmitType(UserDto, [
  'id',
  'createdAt',
  'updatedAt',
]) {}
