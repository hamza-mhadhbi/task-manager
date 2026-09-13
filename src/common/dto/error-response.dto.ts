import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({
    type: 'number',
    required: true,
    nullable: false,
    example: 409,
  })
  statusCode: number;

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
}
