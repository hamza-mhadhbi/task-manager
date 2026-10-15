import { OmitType } from '@nestjs/swagger';

import { UserDto } from '../../common/dto/user.dto.js';

export class MeResponseDto extends OmitType(UserDto, ['password']) {
  constructor({ password: _password, ...profile }: Partial<UserDto>) {
    super();
    Object.assign(this, profile);
  }
}
