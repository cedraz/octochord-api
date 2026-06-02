import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { ApiHealthCheckRepository } from '../../domain/api-health-check.repository';
import { ApiHealthCheckEntity } from '../../domain/entities/api-health-check.entity';
import { ApiHealthCheckLogEntity } from '../../domain/entities/api-health-check-log.entity';
import { EmailNotificationEntity } from '../../domain/entities/email-notification.entity';
import { $Enums, Prisma } from '@prisma/client';
import { HttpMethods } from 'src/shared/domain/enums/http-methods.enum';
import { APIStatus } from 'src/shared/domain/enums/api-status.enum';
import { ApiHealthCheckPaginationDto } from '../../application/dto/api-health-check.pagination.dto';
import { ApiHealthCheckLogPaginationDto } from '../../application/dto/api-health-check-log.pagination.dto';
import { ApiHealthCheckStatsResponseDto } from '../../application/dto/api-health-check-stats-response.dto';
import {
  ApiHealthCheckChartResponseDto,
  ChartRange,
} from '../../application/dto/api-health-check-chart.dto';
import { Transaction } from 'src/shared/domain/transaction';
import { PrismaTransaction } from 'src/shared/prisma/prisma.transaction';
import { PaginationResultDto } from 'src/shared/domain/entities/pagination-result.entity';
import { UpdateApiHealthCheckDto } from '../../application/dto/update-api-health-check.dto';

function getRangeStart(range: ChartRange): Date {
  const ms: Record<ChartRange, number> = {
    [ChartRange.ONE_HOUR]: 60 * 60 * 1000,
    [ChartRange.SIX_HOURS]: 6 * 60 * 60 * 1000,
    [ChartRange.TWENTY_FOUR_HOURS]: 24 * 60 * 60 * 1000,
    [ChartRange.SEVEN_DAYS]: 7 * 24 * 60 * 60 * 1000,
  };
  return new Date(Date.now() - ms[range]);
}

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

    const created = await client.apiHealthCheck.create({
      data: {
        name: apiHealthCheck.name,
        status: apiHealthCheck.status,
        url: apiHealthCheck.url,
        interval: apiHealthCheck.interval,
        slaTarget: apiHealthCheck.slaTarget,
        user: { connect: { id: apiHealthCheck.userId } },
        method: apiHealthCheck.method as $Enums.HttpMethods,
      },
    });

    return new ApiHealthCheckEntity({
      ...created,
      method: created.method as HttpMethods,
      status: created.status as APIStatus,
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
        where: { ...dto.where(), user: { id: userId } },
        ...dto.orderBy(),
      }),
      this.prisma.apiHealthCheck.count({ where: dto.where() }),
    ]);

    return dto.createMetadata(
      apiHealthChecks.map(
        (a) =>
          new ApiHealthCheckEntity({
            ...a,
            method: a.method as HttpMethods,
            status: a.status as APIStatus,
          }),
      ),
      total,
    );
  }

  async findById(id: string): Promise<ApiHealthCheckEntity | null> {
    const apihealthCheck = await this.prisma.apiHealthCheck.findUnique({
      where: { id },
      include: { emailNotification: true },
    });
    if (!apihealthCheck) return null;
    return new ApiHealthCheckEntity({
      ...apihealthCheck,
      method: apihealthCheck.method as HttpMethods,
      status: apihealthCheck.status as APIStatus,
      emailNotification: apihealthCheck.emailNotification
        ? new EmailNotificationEntity({
            ...apihealthCheck.emailNotification,
          })
        : undefined,
    });
  }

  async update(
    id: string,
    dto: UpdateApiHealthCheckDto,
  ): Promise<ApiHealthCheckEntity> {
    const hasEmails = dto.emails !== undefined;

    let emailNotificationData: {
      emailNotification?: Prisma.EmailNotificationUpdateOneWithoutApiHealthCheckNestedInput;
    } = {};
    if (hasEmails) {
      emailNotificationData = {
        emailNotification: {
          upsert: {
            create: { emails: dto.emails },
            update: { emails: dto.emails },
          },
        },
      };
    } else {
      // Se emails não foi fornecido, não altera. Se for um array vazio, remove a notificação.
      emailNotificationData = {
        emailNotification:
          dto.emails === undefined ? undefined : { delete: true },
      };
    }

    const updated = await this.prisma.apiHealthCheck.update({
      where: { id },
      data: {
        name: dto.name,
        url: dto.url,
        interval: dto.interval,
        slaTarget: dto.slaTarget,
        method: dto.method,
        status: dto.status,
        emailNotification: emailNotificationData.emailNotification,
      },
    });

    return new ApiHealthCheckEntity({
      ...updated,
      method: updated.method as HttpMethods,
      status: updated.status as APIStatus,
    });
  }

  async remove(id: string): Promise<ApiHealthCheckEntity> {
    const a = await this.prisma.apiHealthCheck.delete({ where: { id } });
    return new ApiHealthCheckEntity({
      ...a,
      method: a.method as HttpMethods,
      status: a.status as APIStatus,
    });
  }

  // ── Stats ─────────────────────────────────────────────────────────────────

  async getStats(id: string): Promise<ApiHealthCheckStatsResponseDto> {
    const monitor = await this.prisma.apiHealthCheck.findUnique({
      where: { id },
      select: { interval: true, slaTarget: true },
    });

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [uptimeAgg, statsAgg, totalChecks, p95Result] = await Promise.all([
      // uptime: contagem de logs UP e total nos últimos 30 dias
      this.prisma.apiHealthCheckLog.groupBy({
        by: ['status'],
        where: { apiHealthCheckId: id, checkedAt: { gte: thirtyDaysAgo } },
        _count: { status: true },
      }),

      // média de responseTime nos últimos 30 dias
      this.prisma.apiHealthCheckLog.aggregate({
        where: { apiHealthCheckId: id, checkedAt: { gte: thirtyDaysAgo } },
        _avg: { responseTime: true },
      }),

      // total de verificações nas últimas 24h
      this.prisma.apiHealthCheckLog.count({
        where: { apiHealthCheckId: id, checkedAt: { gte: twentyFourHoursAgo } },
      }),

      // P95 via SQL nativo para eficiência
      this.prisma.$queryRaw<[{ p95: number | null }]>`
        SELECT PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY response_time) AS p95
        FROM api_health_check_logs
        WHERE api_health_check_id = ${id}
          AND checked_at >= ${thirtyDaysAgo}
      `,
    ]);

    const upCount =
      uptimeAgg.find((g) => g.status === 'UP')?._count.status ?? 0;
    const totalLogs = uptimeAgg.reduce((s, g) => s + g._count.status, 0);
    const uptime = totalLogs > 0 ? (upCount / totalLogs) * 100 : 100;

    return {
      uptime: Math.round(uptime * 100) / 100,
      slaTarget: monitor?.slaTarget ?? 99.9,
      avgResponseTime: Math.round(statsAgg._avg.responseTime ?? 0),
      p95ResponseTime: Math.round(p95Result[0]?.p95 ?? 0),
      totalChecks,
      interval: monitor?.interval ?? 900,
    };
  }

  // ── Chart ─────────────────────────────────────────────────────────────────

  async getChart(
    id: string,
    range: ChartRange,
  ): Promise<ApiHealthCheckChartResponseDto> {
    const since = getRangeStart(range);

    const logs = await this.prisma.apiHealthCheckLog.findMany({
      where: { apiHealthCheckId: id, checkedAt: { gte: since } },
      select: { checkedAt: true, responseTime: true },
      orderBy: { checkedAt: 'asc' },
    });

    return {
      range,
      points: logs.map((l) => ({
        checkedAt: l.checkedAt,
        responseTime: l.responseTime,
      })),
    };
  }

  // ── Logs ──────────────────────────────────────────────────────────────────

  async getLogs(
    id: string,
    dto: ApiHealthCheckLogPaginationDto,
  ): Promise<PaginationResultDto<ApiHealthCheckLogEntity>> {
    const where = dto.where(id);

    const [logs, total] = await Promise.all([
      this.prisma.apiHealthCheckLog.findMany({
        where,
        ...dto.orderBy(),
      }),
      this.prisma.apiHealthCheckLog.count({ where }),
    ]);

    return dto.createMetadata(
      logs.map(
        (l) =>
          new ApiHealthCheckLogEntity({
            ...l,
            status: l.status as APIStatus,
          }),
      ),
      total,
    );
  }

  // ── CSV Export ────────────────────────────────────────────────────────────

  async countByUserId(userId: string): Promise<number> {
    return this.prisma.apiHealthCheck.count({ where: { userId } });
  }

  async exportLogsCsv(id: string): Promise<string> {
    const logs = await this.prisma.apiHealthCheckLog.findMany({
      where: { apiHealthCheckId: id },
      orderBy: { checkedAt: 'desc' },
      select: {
        status: true,
        statusCode: true,
        errorMessage: true,
        responseTime: true,
        checkedAt: true,
      },
    });

    const header =
      'Status,Status Code,Error Message,Response Time (ms),Checked At';
    const rows = logs.map((l) => {
      const errorMsg = l.errorMessage ?? '';
      const escapedError = errorMsg ? `"${errorMsg.replace(/"/g, '""')}"` : '';
      return [
        l.status,
        l.statusCode ?? '',
        escapedError,
        l.responseTime,
        l.checkedAt.toISOString(),
      ].join(',');
    });

    return [header, ...rows].join('\n');
  }
}
