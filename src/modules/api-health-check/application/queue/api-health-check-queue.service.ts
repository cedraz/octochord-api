import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { ApiHealthCheckDto } from '../dto/api-health-check.dto';
import { QueueNames } from 'src/shared/helpers/queue-names.helper';

@Injectable()
export class ApiHealthCheckQueueService {
  constructor(
    @InjectQueue(QueueNames.API_HEALTH_CHECK_QUEUE)
    private apiHealthCheckQueue: Queue,
  ) {}

  async execute(dto: ApiHealthCheckDto) {
    const jobId = `check-${dto.url}-${dto.interval}`;

    await this.apiHealthCheckQueue.add(jobId, dto, {
      repeat: {
        every: dto.interval * 1000, // Convert seconds to milliseconds
      },
    });
  }
}
