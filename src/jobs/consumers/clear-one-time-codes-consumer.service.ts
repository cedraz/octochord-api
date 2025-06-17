import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { QueueNames } from '../utils/queue-names.helper';
import { PrismaService } from 'src/prisma/prisma.service';
import { ClearOneTimeCodesDto } from '../dto/clear-one-time-codes.dto';

@Processor(QueueNames.CLEAR_ONE_TIME_CODES)
export class ClearOneTimeCodesConsumerService extends WorkerHost {
  constructor(private prismaService: PrismaService) {
    super();
  }

  async process({ data }: Job<ClearOneTimeCodesDto>) {
    await this.prismaService.oneTimeCode.deleteMany({
      where: {
        id: {
          in: data.expiredOneTimeCodes.map((v) => v.id),
        },
      },
    });
  }
}
