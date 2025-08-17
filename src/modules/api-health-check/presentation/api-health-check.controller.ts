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
} from '@nestjs/common';
import { CreateApiHealthCheckDto } from '../application/dto/create-api-health-check.dto';
import { UpdateApiHealthCheckDto } from '../application/dto/update-api-health-check.dto';
import { ApiHealthCheckPaginationDto } from '../application/dto/api-health-check.pagination.dto';
import { ApiPaginatedResponse } from 'src/shared/dto/api-pagineted-response.dto';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { TAuthenticatedUser } from 'src/shared/types/authenticated-user';
import { JwtAuthGuard } from 'src/modules/auth/application/guards/access-token-auth.guard';
import { ApiHealthCheckService } from '../application/api-health-check.service';
import { ApiHealthCheckEntity } from '../domain/entities/api-health-check.entity';

@Controller('api-health-check')
export class ApiHealthCheckController {
  constructor(private readonly apiHealthCheckService: ApiHealthCheckService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body() createApiHealthCheckDto: CreateApiHealthCheckDto,
    @CurrentUser() user: TAuthenticatedUser,
  ) {
    return this.apiHealthCheckService.create(user.sub, createApiHealthCheckDto);
  }

  @Get()
  @ApiPaginatedResponse(ApiHealthCheckEntity)
  @UseGuards(JwtAuthGuard)
  findAll(
    @Query() dto: ApiHealthCheckPaginationDto,
    @CurrentUser() user: TAuthenticatedUser,
  ) {
    return this.apiHealthCheckService.findAll(user.sub, dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.apiHealthCheckService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateApiHealthCheckDto: UpdateApiHealthCheckDto,
  ) {
    return this.apiHealthCheckService.update(id, updateApiHealthCheckDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.apiHealthCheckService.remove(id);
  }
}
