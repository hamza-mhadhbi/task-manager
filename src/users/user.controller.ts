import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpStatus,
  Req,
  UnauthorizedException,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { type Request } from 'express';

import { MeResponseDto } from './dto/me-response.dto.js';
import { UserService } from './user.service.js';
import { ErrorResponseDto } from '../common/dto/error-response.dto.js';

@Controller('users')
@ApiBearerAuth()
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/me')
  @ApiOkResponse({
    description: 'This is you.',
    type: MeResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'User not found.',
    type: ErrorResponseDto,
    example: new ErrorResponseDto(
      HttpStatus.NOT_FOUND,
      UserService.USER_NOT_FOUND_ERROR,
      'Not Found',
    ),
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized.',
    type: ErrorResponseDto,
    example: new ErrorResponseDto(HttpStatus.UNAUTHORIZED, 'Unauthorized'),
  })
  public async me(
    @Req()
    req: Request,
  ): Promise<MeResponseDto> {
    const userId = (req.user as { userId?: string } | undefined)?.userId;
    if (!userId) throw new UnauthorizedException();

    const user = await this.userService.findUserById(userId);
    return new MeResponseDto(user);
  }
}
