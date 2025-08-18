import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateApiHealthCheckDto } from './dto/create-api-health-check.dto';
import { UpdateApiHealthCheckDto } from './dto/update-api-health-check.dto';
import { ErrorMessagesHelper } from 'src/shared/helpers/error-messages.helper';
import { ApiHealthCheckPaginationDto } from './dto/api-health-check.pagination.dto';
import { ApiHealthCheckQueueService } from './queue/api-health-check-queue.service';
import { ApiHealthCheckRepository } from '../domain/api-health-check.repository';
import { ApiHealthCheckEntity } from '../domain/entities/api-health-check.entity';
import { UnitOfWork } from 'src/shared/domain/unit-of-work';
import { APIStatus } from 'src/shared/domain/enums/api-status.enum';
import { EmailNotificationEntity } from '../domain/entities/email-notification.entity';
import { PaginationResultDto } from 'src/shared/domain/entities/pagination-result.entity';
import { UserServiceAPI } from 'src/modules/user/application/user.service.interface';
import { USER_SERVICE_TOKEN } from 'src/shared/tokens/tokens';

@Injectable()
export class ApiHealthCheckService {
  constructor(
    private readonly apiHealthCheckRepository: ApiHealthCheckRepository,
    private readonly uow: UnitOfWork,
    private readonly apiHealthCheckQueueService: ApiHealthCheckQueueService,
    @Inject(USER_SERVICE_TOKEN)
    private readonly userService: UserServiceAPI,
  ) {}

  async create(
    userId: string,
    dto: CreateApiHealthCheckDto,
  ): Promise<ApiHealthCheckEntity> {
    const user = await this.userService.findById(userId);

    if (!user) {
      throw new NotFoundException(ErrorMessagesHelper.USER_NOT_FOUND);
    }

    const apiHealthCheck = await this.uow.execute(async (tx) => {
      const apiHealthCheck = new ApiHealthCheckEntity({
        url: dto.url,
        interval: dto.interval,
        method: dto.method,
        userId: user.id,
        status: APIStatus.PENDING,
      });

      const createdApiHealthCheck = await this.apiHealthCheckRepository.create(
        apiHealthCheck,
        tx,
      );

      if (dto.createEmailNotificationDto) {
        const emailNotification = new EmailNotificationEntity({
          emails: dto.createEmailNotificationDto.emails,
          apiHealthCheckId: createdApiHealthCheck.id,
        });

        await this.apiHealthCheckRepository.createEmailNotification(
          emailNotification,
          tx,
        );
      }

      return createdApiHealthCheck;
    });

    await this.apiHealthCheckQueueService.execute({
      id: apiHealthCheck.id,
      url: apiHealthCheck.url,
      interval: apiHealthCheck.interval,
      method: apiHealthCheck.method,
    });

    return apiHealthCheck;
  }

  async findAll(
    userId: string,
    dto: ApiHealthCheckPaginationDto,
  ): Promise<PaginationResultDto<ApiHealthCheckEntity>> {
    return this.apiHealthCheckRepository.findAll(userId, dto);
  }

  findOne(id: string): Promise<ApiHealthCheckEntity | null> {
    return this.apiHealthCheckRepository.findById(id);
  }

  update(
    id: string,
    updateApiHealthCheckDto: UpdateApiHealthCheckDto,
  ): Promise<ApiHealthCheckEntity> {
    return this.apiHealthCheckRepository.update(id, updateApiHealthCheckDto);
  }

  remove(id: string): Promise<ApiHealthCheckEntity> {
    return this.apiHealthCheckRepository.remove(id);
  }
}
