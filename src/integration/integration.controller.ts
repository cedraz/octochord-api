import {
  Controller,
  Post,
  Body,
  Headers,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { IntegrationService } from './integration.service';
import * as crypto from 'crypto';
import { PushEvent } from '@octokit/webhooks-types';

@Controller('integration')
export class IntegrationController {
  constructor(private readonly integrationService: IntegrationService) {}

  @Post('send-discord-message')
  async sendDiscordMessage() {
    await this.integrationService.sendDiscordMessage('ASGASGASGAS TESTE');
    return { status: 'Mensagem enviada com sucesso' };
  }

  @Post('webhook')
  async handleWebhook(
    @Headers('x-github-event') eventType: string,
    @Headers('x-hub-signature-256') signature: string,
    @Body() payload: PushEvent,
  ) {
    const expectedSignature = 'githubwebhooksecret';
    if (!this.verifySignature(signature, expectedSignature, payload)) {
      throw new HttpException('Assinatura inválida', HttpStatus.FORBIDDEN);
    }

    if (eventType === 'push') {
      console.log('Evento de push recebido:', payload);
      console.log('Pusher: ', payload.pusher.name);
      await this.integrationService.sendDiscordMessage(
        `Novo push por ${payload.pusher.name} no repositório ${payload.repository.full_name}`,
      );
    }
  }

  private verifySignature(
    signature: string,
    secret: string,
    payload: any,
  ): boolean {
    if (!signature || !secret) return false;

    const hmac = crypto.createHmac('sha256', secret);
    const digest =
      'sha256=' + hmac.update(JSON.stringify(payload)).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
  }
}
