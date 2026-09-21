import { PickType } from '@nestjs/swagger';

import { UserDto } from '../../common/dto/user.dto.js';

export class LoginRequestDto extends PickType(UserDto, ['email', 'password']) {}
