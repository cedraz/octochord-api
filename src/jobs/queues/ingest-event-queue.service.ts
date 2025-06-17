import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { QueueNames } from '../utils/queue-names.helper';
import { IngestEventDto } from '../dto/ingest-event.dto';

@Injectable()
export class IngestEventQueueService {
  constructor(
    @InjectQueue(QueueNames.INGEST_EVENT_QUEUE)
    private ingestEventQueue: Queue,
  ) {}

  async execute({ date, email, name, event_type, id }: IngestEventDto) {
    await this.ingestEventQueue.add(QueueNames.INGEST_EVENT_QUEUE, {
      date,
      email,
      name,
      event_type,
      id,
    });
  }
}
