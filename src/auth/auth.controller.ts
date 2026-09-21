import {
  ApiConflictResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
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

// DTOs
import { RegisterRequestDto } from './dto/register-request.dto.js';
import { RegisterResponseDto } from './dto/register-response-dto.js';
import { ErrorResponseDto } from '../common/dto/error-response.dto.js';

// Services
import { AuthService } from './auth.service.js';
import { LoginResponseDto } from './dto/login-response.dto.js';
import { LoginRequestDto } from './dto/login-request.dto.js';

@Controller({
  path: '/auth',
})
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  @HttpCode(HttpStatus.OK)
  @Header('Content-Type', 'application/json')
  @ApiOkResponse({
    description: 'User account created.',
    type: RegisterResponseDto,
  })
  @ApiConflictResponse({
    description: 'Email already used by another account.',
    type: ErrorResponseDto,
  })
  @UseInterceptors(ClassSerializerInterceptor)
  public async register(
    @Body() registerRequest: RegisterRequestDto,
  ): Promise<RegisterResponseDto> {
    const userDomain = await this.authService.register(registerRequest);
    return new RegisterResponseDto(userDomain);
  }

  @Post('/login')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: LoginResponseDto,
    description: 'Authentification success',
    example: new LoginResponseDto('eyMyAccessToken...'),
  })
  @ApiUnauthorizedResponse({
    type: ErrorResponseDto,
    description: 'Authentification Failed',
    example: {
      statusCode: HttpStatus.UNAUTHORIZED,
      message: 'Authentification failed !',
      error: 'Unauthorized',
    },
  })
  public async login(
    @Body() loginRequest: LoginRequestDto,
  ): Promise<LoginResponseDto> {
    const result = await this.authService.login(loginRequest);
    return new LoginResponseDto(result.accessToken);
  }
}
