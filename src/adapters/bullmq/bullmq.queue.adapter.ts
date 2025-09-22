import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Queue } from 'bullmq';
import {
  IQueueProvider,
  Job,
} from 'src/shared/domain/providers/queue.provider';
import { QueueNames } from 'src/shared/helpers/queue-names.helper';

@Injectable()
export class BullMQQueueAdapter implements IQueueProvider {
  private queues: Map<string, Queue>;

  constructor(
    @InjectQueue(QueueNames.SEND_EMAIL_QUEUE) private readonly mailQueue: Queue,
    @InjectQueue(QueueNames.API_HEALTH_CHECK_QUEUE)
    private readonly healthCheckQueue: Queue,
    @InjectQueue(QueueNames.SEND_DISCORD_MESSAGE_QUEUE)
    private readonly discordQueue: Queue,
    @InjectQueue(QueueNames.INGEST_EVENT_QUEUE)
    private readonly ingestEventQueue: Queue,
  ) {
    this.queues = new Map<string, Queue>();
    this.queues.set(QueueNames.SEND_EMAIL_QUEUE, this.mailQueue);
    this.queues.set(QueueNames.API_HEALTH_CHECK_QUEUE, this.healthCheckQueue);
    this.queues.set(QueueNames.SEND_DISCORD_MESSAGE_QUEUE, this.discordQueue);
    this.queues.set(QueueNames.INGEST_EVENT_QUEUE, this.ingestEventQueue);
  }

  async add(job: Job): Promise<void> {
    const { jobName, queueName, payload, opts } = job;

    const queue = this.queues.get(queueName);

    if (!queue) {
      throw new NotFoundException(`Queue "${queueName}" not found.`);
    }

    await queue.add(jobName, payload, opts);
  }
}
