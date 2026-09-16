import { ApiProperty } from '@nestjs/swagger';

enum GlobalStatus {
  Ok = 'ok',
  Error = 'error',
}

enum ComponentStatus {
  Up = 'up',
  Down = 'down',
}

interface IDetails {
  status: ComponentStatus;
  responseTime: number;
  message?: string;
}

const databaseIndicatorSchema = {
  type: 'object' as const,
  properties: {
    status: { type: 'string' as const, enum: Object.values(ComponentStatus) },
    responseTime: { type: 'number' as const },
    message: { type: 'string' as const },
  },
  required: ['status', 'responseTime'],
  additionalProperties: false,
};

export class HealthResponseDto {
  @ApiProperty({
    type: 'string',
    enum: GlobalStatus,
    required: true,
  })
  status: GlobalStatus;

  @ApiProperty({
    type: 'object',
    properties: {
      database: databaseIndicatorSchema,
    },
  })
  info: Record<'database', IDetails>;

  @ApiProperty({
    type: 'object',
    properties: {
      database: databaseIndicatorSchema,
    },
  })
  details: Record<'database', IDetails>;

  @ApiProperty({
    type: 'object',
    properties: {
      database: databaseIndicatorSchema,
    },
  })
  error?: Record<'database', IDetails>;
}
