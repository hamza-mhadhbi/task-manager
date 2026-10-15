import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import {
  HealthCheckService,
  HealthCheck,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';

import { HealthResponseDto } from './health-response.dto.js';
import { Public } from '../common/decorators/public.decorator.js';

@Public()
@Controller()
export class HealthController {
  constructor(
    private healthCheckService: HealthCheckService,
    private db: TypeOrmHealthIndicator,
  ) {}

  @Get('/health')
  @HealthCheck()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Health check endpoint.',
    type: HealthResponseDto,
  })
  public health() {
    return this.healthCheckService.check([
      () => this.db.pingCheck('database').withTimeout(1000),
    ]);
  }
}
