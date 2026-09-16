import { Test, TestingModule } from '@nestjs/testing';
import {
  HealthCheckService,
  TerminusModule,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { Mock, vi } from 'vitest';

import { HealthController } from './health.controller.js';

describe('HealthController', () => {
  let healthController: HealthController;
  let healthCheckService: {
    check: Mock;
  };

  let db: {
    pingCheck: Mock;
  };

  beforeEach(async () => {
    healthCheckService = {
      check: vi.fn(),
    };

    db = {
      pingCheck: vi.fn(),
    };

    const app: TestingModule = await Test.createTestingModule({
      imports: [TerminusModule],
      providers: [
        { provide: HealthCheckService, useValue: healthCheckService },
        { provide: TypeOrmHealthIndicator, useValue: db },
      ],
      controllers: [HealthController],
    }).compile();

    healthController = app.get<HealthController>(HealthController);
  });

  describe('GET /health', () => {
    const response = {
      status: 'ok',
      info: {
        database: {
          responseTime: 4,
          status: 'up',
        },
      },
      error: {},
      details: {
        database: {
          responseTime: 4,
          status: 'up',
        },
      },
    };

    it('should delegate health check to HalthCheckService.check and return ok', async () => {
      healthCheckService.check.mockResolvedValue(response);
      db.pingCheck.mockReturnValue({
        withTimeout: vi.fn(),
      });

      const result = await healthController.health();
      expect(healthCheckService.check).toHaveBeenCalledTimes(1);

      const [[healthIndicators]] = healthCheckService.check.mock.calls;
      expect(healthIndicators).toHaveLength(1);

      healthIndicators[0]();
      expect(db.pingCheck).toHaveBeenCalledWith('database');

      expect(result).toEqual(response);
    });

    it('should delegate health check to HalthCheckService.check and return error', async () => {
      response.status = 'error';
      response.info.database.status = 'down';
      response.details.database.status = 'down';

      healthCheckService.check.mockResolvedValue(response);
      db.pingCheck.mockReturnValue({
        withTimeout: vi.fn(),
      });

      const result = await healthController.health();
      expect(healthCheckService.check).toHaveBeenCalledTimes(1);

      const [[healthIndicators]] = healthCheckService.check.mock.calls;
      expect(healthIndicators).toHaveLength(1);

      healthIndicators[0]();
      expect(db.pingCheck).toHaveBeenCalledWith('database');

      expect(result).toEqual(response);
    });
  });
});
