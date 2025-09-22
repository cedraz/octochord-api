import { Injectable } from '@nestjs/common';
import * as client from 'prom-client';
import { IncHttpCounterDto } from './dto/inc-http-counter.dto';

@Injectable()
export class PrometheusMonitoringAdapter {
  private register: client.Registry;
  private httpRequestDurationMicroseconds: client.Histogram;

  constructor() {
    this.register = new client.Registry();
    client.collectDefaultMetrics({ register: this.register });

    this.httpRequestDurationMicroseconds = new client.Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duração das requisições HTTP em segundos',
      labelNames: ['method', 'route', 'code'],
      buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
    });

    this.register.registerMetric(this.httpRequestDurationMicroseconds);
  }

  observeHttp(dto: IncHttpCounterDto): void {
    const { method, endpoint, statusCode, duration } = dto;

    this.httpRequestDurationMicroseconds
      .labels(method, endpoint, statusCode.toString())
      .observe(duration / 1000); // CONVERTIDO EM SEGUNDOS
  }

  metrics(): string {
    return this.register.metrics();
  }
}
