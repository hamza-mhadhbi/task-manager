import { HttpStatus } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({
    type: 'number',
    required: true,
    nullable: false,
    example: HttpStatus.CONFLICT,
  })
  statusCode: HttpStatus;

  @ApiProperty({
    type: 'string',
    required: true,
    nullable: false,
    example: 'The email is already exists !',
  })
  message: string;

  @ApiPropertyOptional({
    type: 'string',
    nullable: false,
    example: 'Conflict',
  })
  error?: string;

  constructor(statusCode: HttpStatus, message: string, error?: string) {
    this.statusCode = statusCode;
    this.message = message;
    this.error = error;
  }
}
