export class ApiHealthCheckStatsResponseDto {
  /** Percentual de uptime nos últimos 30 dias */
  uptime: number;
  /** Meta de SLA configurada no monitor */
  slaTarget: number;
  /** Tempo médio de resposta nos últimos 30 dias (ms) */
  avgResponseTime: number;
  /** P95 de latência nos últimos 30 dias (ms) */
  p95ResponseTime: number;
  /** Total de verificações nas últimas 24h */
  totalChecks: number;
  /** Intervalo de verificação em segundos */
  interval: number;
}
