import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  Query,
} from '@nestjs/common';
import { ApiHealthCheckService } from './api-health-check.service';
import { CreateApiHealthCheckDto } from './dto/create-api-health-check.dto';
import { UpdateApiHealthCheckDto } from './dto/update-api-health-check.dto';
import { Request as ExpressRequest } from 'express';
import { JwtPayload } from 'src/common/types/jwt-payload.interface';
import { ApiHealthCheckPaginationDto } from './dto/api-health-check.pagination.dto';
import { ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { ApiHealthCheck } from './entities/api-health-check.entity';
import { ApiPaginatedResponse } from 'src/common/dto/api-pagineted-response.dto';

@Controller('api-health-check')
export class ApiHealthCheckController {
  constructor(private readonly apiHealthCheckService: ApiHealthCheckService) {}

  @Post()
  @ApiCreatedResponse({ type: ApiHealthCheck })
  create(
    @Body() createApiHealthCheckDto: CreateApiHealthCheckDto,
    @Request() req: ExpressRequest,
  ) {
    const user = req.user as JwtPayload;
    return this.apiHealthCheckService.create(user.sub, createApiHealthCheckDto);
  }

  @Get()
  @ApiPaginatedResponse(ApiHealthCheck)
  findAll(
    @Query() dto: ApiHealthCheckPaginationDto,
    @Request() req: ExpressRequest,
  ) {
    const user = req.user as JwtPayload;
    return this.apiHealthCheckService.findAll(user.sub, dto);
  }

  @Get(':id')
  @ApiOkResponse({ type: ApiHealthCheck })
  findOne(@Param('id') id: string) {
    return this.apiHealthCheckService.findOne(id);
  }

  @Patch(':id')
  @ApiOkResponse({ type: ApiHealthCheck })
  update(
    @Param('id') id: string,
    @Body() updateApiHealthCheckDto: UpdateApiHealthCheckDto,
  ) {
    return this.apiHealthCheckService.update(id, updateApiHealthCheckDto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: ApiHealthCheck })
  remove(@Param('id') id: string) {
    return this.apiHealthCheckService.remove(id);
  }
}
