import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { ApiHealthCheckRepository } from '../../domain/api-health-check.repository';
import { ApiHealthCheckEntity } from '../../domain/entities/api-health-check.entity';
import { EmailNotificationEntity } from '../../domain/entities/email-notification.entity';
import { $Enums } from '@prisma/client';
import { HttpMethods } from 'src/shared/domain/enums/http-methods.enum';
import { APIStatus } from 'src/shared/domain/enums/api-status.enum';
import { ApiHealthCheckPaginationDto } from '../../application/dto/api-health-check.pagination.dto';
import { Transaction } from 'src/shared/domain/transaction';
import { PrismaTransaction } from 'src/shared/prisma/prisma.transaction';

@Injectable()
export class ApiHealthCheckPrismaRepository
  implements ApiHealthCheckRepository
{
  constructor(private prisma: PrismaService) {}

  async create(
    apiHealthCheck: ApiHealthCheckEntity,
    tx?: Transaction,
  ): Promise<ApiHealthCheckEntity> {
    const client = (tx as PrismaTransaction)?.client || this.prisma;

    const apiHealthCheckCreated = await client.apiHealthCheck.create({
      data: {
        status: apiHealthCheck.status,
        url: apiHealthCheck.url,
        interval: apiHealthCheck.interval,
        user: { connect: { id: apiHealthCheck.userId } },
        method: apiHealthCheck.method as $Enums.HttpMethods,
      },
    });

    return new ApiHealthCheckEntity({
      ...apiHealthCheckCreated,
      method: apiHealthCheckCreated.method as HttpMethods,
      status: apiHealthCheckCreated.status as APIStatus,
    });
  }

  createEmailNotification(
    emailNotification: EmailNotificationEntity,
    tx?: Transaction,
  ): Promise<EmailNotificationEntity> {
    const client = (tx as PrismaTransaction)?.client || this.prisma;

    return client.emailNotification.create({
      data: {
        emails: emailNotification.emails,
        apiHealthCheck: { connect: { id: emailNotification.apiHealthCheckId } },
      },
    });
  }

  async findAll(userId: string, dto: ApiHealthCheckPaginationDto) {
    const [apiHealthChecks, total] = await Promise.all([
      this.prisma.apiHealthCheck.findMany({
        where: {
          ...dto.where(),
          user: { id: userId },
        },
        ...dto.orderBy(),
      }),
      this.prisma.apiHealthCheck.count({
        where: dto.where(),
      }),
    ]);

    const apiHealthCheckEntities = apiHealthChecks.map(
      (apiHealthCheck) =>
        new ApiHealthCheckEntity({
          ...apiHealthCheck,
          method: apiHealthCheck.method as HttpMethods,
          status: apiHealthCheck.status as APIStatus,
        }),
    );

    return dto.createMetadata(apiHealthCheckEntities, total);
  }

  async findById(id: string): Promise<ApiHealthCheckEntity | null> {
    const apiHealthCheck = await this.prisma.apiHealthCheck.findUnique({
      where: { id },
    });

    if (!apiHealthCheck) {
      return null;
    }

    return new ApiHealthCheckEntity({
      ...apiHealthCheck,
      method: apiHealthCheck.method as HttpMethods,
      status: apiHealthCheck.status as APIStatus,
    });
  }

  async update(
    id: string,
    updateApiHealthCheckDto: ApiHealthCheckEntity,
  ): Promise<ApiHealthCheckEntity> {
    const updatedApiHealthCheck = await this.prisma.apiHealthCheck.update({
      where: { id },
      data: {
        url: updateApiHealthCheckDto.url,
        interval: updateApiHealthCheckDto.interval,
        method: updateApiHealthCheckDto.method as $Enums.HttpMethods,
        status: updateApiHealthCheckDto.status as $Enums.APIStatus,
      },
    });

    return new ApiHealthCheckEntity({
      ...updatedApiHealthCheck,
      method: updatedApiHealthCheck.method as HttpMethods,
      status: updatedApiHealthCheck.status as APIStatus,
    });
  }

  async remove(id: string): Promise<ApiHealthCheckEntity> {
    const apiHealthCheck = await this.prisma.apiHealthCheck.delete({
      where: { id },
    });

    return new ApiHealthCheckEntity({
      ...apiHealthCheck,
      method: apiHealthCheck.method as HttpMethods,
      status: apiHealthCheck.status as APIStatus,
    });
  }
}
