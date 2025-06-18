import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateApiHealthCheckDto } from './dto/create-api-health-check.dto';
import { UpdateApiHealthCheckDto } from './dto/update-api-health-check.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ApiHealthCheckQueueService } from 'src/jobs/queues/api-health-check-queue.service';
import { ApiHealthCheck } from './entities/api-health-check.entity';
import { ErrorMessagesHelper } from 'src/helpers/error-messages.helper';
import { ApiHealthCheckPaginationDto } from './dto/api-health-check.pagination.dto';

@Injectable()
export class ApiHealthCheckService {
  constructor(
    private prismaService: PrismaService,
    private apiHealthCheckQueueService: ApiHealthCheckQueueService,
  ) {}

  async create(
    userId: string,
    dto: CreateApiHealthCheckDto,
  ): Promise<ApiHealthCheck> {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException(ErrorMessagesHelper.USER_NOT_FOUND);
    }

    const apiHealthCheck = await this.prismaService.apiHealthCheck.create({
      data: {
        url: dto.url,
        interval: dto.interval,
        status: 'PENDING',
        method: dto.method,
        user: { connect: { id: userId } },
      },
    });

    await this.apiHealthCheckQueueService.execute({
      id: apiHealthCheck.id,
      url: apiHealthCheck.url,
      interval: apiHealthCheck.interval,
      method: dto.method,
    });

    return apiHealthCheck;
  }

  async findAll(userId: string, dto: ApiHealthCheckPaginationDto) {
    const [apiHealthChecks, total] = await Promise.all([
      this.prismaService.apiHealthCheck.findMany({
        where: {
          ...dto.where(),
          user: { id: userId },
        },
        ...dto.orderBy(),
      }),
      this.prismaService.apiHealthCheck.count({
        where: dto.where(),
      }),
    ]);

    return dto.createMetadata(apiHealthChecks, total);
  }

  findOne(id: string): Promise<ApiHealthCheck | null> {
    return this.prismaService.apiHealthCheck.findUnique({
      where: { id },
    });
  }

  update(
    id: string,
    updateApiHealthCheckDto: UpdateApiHealthCheckDto,
  ): Promise<ApiHealthCheck> {
    return this.prismaService.apiHealthCheck.update({
      where: { id },
      data: {
        url: updateApiHealthCheckDto.url,
        interval: updateApiHealthCheckDto.interval,
        method: updateApiHealthCheckDto.method,
      },
    });
  }

  remove(id: string): Promise<ApiHealthCheck> {
    return this.prismaService.apiHealthCheck.delete({
      where: { id },
    });
  }
}
