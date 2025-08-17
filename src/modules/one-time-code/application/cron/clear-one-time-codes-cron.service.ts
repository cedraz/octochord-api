import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { OneTimeCodeRepository } from '../../domain/one-time-code.repository';
import { CustomLogger } from 'src/shared/logger/logger.service';

@Injectable()
export class ClearOneTimeCodesCronService {
  constructor(
    private readonly oneTimeCodeRepository: OneTimeCodeRepository,
    private readonly logger: CustomLogger,
  ) {
    this.logger.setContext(ClearOneTimeCodesCronService.name);
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    this.logger.log('Iniciando job de limpeza de one-time codes expirados...');

    try {
      const deletedCount =
        await this.oneTimeCodeRepository.deleteExpiredCodes();

      this.logger.log(
        `Limpeza concluída. ${deletedCount} códigos foram removidos.`,
      );
    } catch (error) {
      this.logger.error(
        'Falha ao executar o job de limpeza de one-time codes.',
        'Clear One Time Codes CRON',
        error,
      );
    }
  }
}
