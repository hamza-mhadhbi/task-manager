import { ApiOkResponse } from '@nestjs/swagger';
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Header,
  HttpCode,
  HttpStatus,
  Post,
  UseInterceptors,
} from '@nestjs/common';

import { RegisterRequestDto } from './register-request.dto.js';
import { AuthService } from './auth.service.js';
import { RegisterResponseDto } from './register-response-dto.js';

@Controller({
  path: '/auth',
})
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  @HttpCode(HttpStatus.OK)
  @Header('Content-Type', 'application/json')
  @ApiOkResponse({
    type: RegisterResponseDto,
  })
  @UseInterceptors(ClassSerializerInterceptor)
  public async register(
    @Body() user: RegisterRequestDto,
  ): Promise<RegisterResponseDto> {
    const userDomain = await this.authService.register(user);
    return new RegisterResponseDto(userDomain);
  }
}
