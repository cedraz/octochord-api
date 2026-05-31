import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateApiHealthCheckDto } from '../application/dto/create-api-health-check.dto';
import { UpdateApiHealthCheckDto } from '../application/dto/update-api-health-check.dto';
import { ApiHealthCheckPaginationDto } from '../application/dto/api-health-check.pagination.dto';
import { ApiHealthCheckLogPaginationDto } from '../application/dto/api-health-check-log.pagination.dto';
import { ApiHealthCheckChartQueryDto } from '../application/dto/api-health-check-chart.dto';
import { ApiPaginatedResponse } from 'src/shared/application/dto/api-pagineted-response.dto';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { TAuthenticatedUser } from 'src/shared/types/authenticated-user';
import { JwtAuthGuard } from 'src/modules/auth/application/guards/access-token-auth.guard';
import { ApiHealthCheckService } from '../application/api-health-check.service';
import { ApiHealthCheckEntity } from '../domain/entities/api-health-check.entity';

@ApiTags('Api Health Check')
@UseGuards(JwtAuthGuard)
@Controller('api-health-check')
export class ApiHealthCheckController {
  constructor(private readonly apiHealthCheckService: ApiHealthCheckService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new monitor' })
  create(
    @Body() createApiHealthCheckDto: CreateApiHealthCheckDto,
    @CurrentUser() user: TAuthenticatedUser,
  ) {
    return this.apiHealthCheckService.create(user.sub, createApiHealthCheckDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all monitors for the authenticated user' })
  @ApiPaginatedResponse(ApiHealthCheckEntity)
  findAll(
    @Query() dto: ApiHealthCheckPaginationDto,
    @CurrentUser() user: TAuthenticatedUser,
  ) {
    return this.apiHealthCheckService.findAll(user.sub, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a monitor by id' })
  findOne(@Param('id') id: string) {
    return this.apiHealthCheckService.findOne(id);
  }

  @Get(':id/stats')
  @ApiOperation({
    summary:
      'Get uptime, avg response time, P95 and total checks for a monitor',
  })
  getStats(@Param('id') id: string) {
    return this.apiHealthCheckService.getStats(id);
  }

  @Get(':id/chart')
  @ApiOperation({ summary: 'Get time-series response data for the chart' })
  getChart(
    @Param('id') id: string,
    @Query() query: ApiHealthCheckChartQueryDto,
  ) {
    return this.apiHealthCheckService.getChart(id, query.range);
  }

  @Get(':id/logs')
  @ApiOperation({ summary: 'Get paginated verification history for a monitor' })
  getLogs(
    @Param('id') id: string,
    @Query() dto: ApiHealthCheckLogPaginationDto,
  ) {
    return this.apiHealthCheckService.getLogs(id, dto);
  }

  @Get(':id/logs/export')
  @ApiOperation({ summary: 'Export full verification history as CSV' })
  async exportLogs(@Param('id') id: string, @Res() res: Response) {
    const csv = await this.apiHealthCheckService.exportLogsCsv(id);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="logs-${id}.csv"`,
    );
    res.send(csv);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a monitor' })
  update(
    @Param('id') id: string,
    @Body() updateApiHealthCheckDto: UpdateApiHealthCheckDto,
  ) {
    return this.apiHealthCheckService.update(id, updateApiHealthCheckDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a monitor' })
  remove(@Param('id') id: string) {
    return this.apiHealthCheckService.remove(id);
  }
}
