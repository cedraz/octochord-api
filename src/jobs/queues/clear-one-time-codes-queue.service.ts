import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { QueueNames } from '../utils/queue-names.helper';
import { PrismaService } from 'src/prisma/prisma.service';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class ClearOneTimeCodesQueueService {
  constructor(
    @InjectQueue(QueueNames.CLEAR_ONE_TIME_CODES)
    private clearOneTimeCodesQueue: Queue,
    private prismaService: PrismaService,
  ) {}

  @Cron('* 59 23 * * *') // Run every day at 23:59
  async execute() {
    const expiredOneTimeCodes = await this.prismaService.oneTimeCode.findMany({
      where: { expiresAt: { lte: new Date() } },
    });

    if (expiredOneTimeCodes.length !== 0) {
      await this.clearOneTimeCodesQueue.add(QueueNames.CLEAR_ONE_TIME_CODES, {
        expiredOneTimeCodes,
      });
    }
  }
}
