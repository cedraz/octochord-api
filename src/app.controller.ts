import { Controller, Get, Head, Header } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrometheusService } from './providers/prom-client/prometheus.service';

@Controller()
@ApiTags('App')
export class AppController {
  constructor(private readonly prometheusService: PrometheusService) {}

  @Get()
  getHello(): string {
    return 'API is running!';
  }

  @Get('health')
  health(): string {
    return 'API Running Smoothly! Health Check Passed!';
  }

  @Head()
  getHead(): string {
    return 'Hello World!';
  }

  @Get('metrics')
  @Header('Content-Type', 'text/plain; version=0.0.4')
  getMetrics(): string {
    return this.prometheusService.metrics();
  }
}
