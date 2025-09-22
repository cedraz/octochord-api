import { JobsOptions } from 'bullmq';
import { QueueNames } from 'src/shared/helpers/queue-names.helper';

export interface Job {
  jobName: string;
  queueName: QueueNames;
  payload: unknown;
  opts?: JobsOptions;
}

export interface IQueueProvider {
  add(job: Job): Promise<void>;
}
