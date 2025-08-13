import {
  Controller,
  Post,
  Body,
  Headers,
  UseGuards,
  Request,
  NotFoundException,
} from '@nestjs/common';
import { PushEvent } from '@octokit/webhooks-types';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiHideProperty,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { Request as ExpressRequest } from 'express';
import { JwtPayload } from 'src/common/types/jwt-payload.interface';
import { ErrorMessagesHelper } from 'src/helpers/error-messages.helper';
import { IntegrationService } from '../application/integration.service';
import { CreateIntegrationDto } from '../application/dto/create-integration.dto';
import { IntegrationEntity } from '../domain/entities/integration.entity';

@Controller('integration')
export class IntegrationController {
  constructor(private readonly integrationService: IntegrationService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiCreatedResponse({ type: IntegrationEntity })
  create(
    @Body() createIntegrationDto: CreateIntegrationDto,
    @Request() req: ExpressRequest,
  ) {
    const user = req.user as JwtPayload;
    return this.integrationService.create(user.sub, createIntegrationDto);
  }

  @ApiHideProperty()
  @Post('webhook')
  async handleWebhook(
    @Headers('x-github-event') eventType: string,
    @Headers('x-hub-signature-256') signature: string,
    @Headers('x-github-hook-id') hookId: string,
    @Body() payload: PushEvent,
  ) {
    console.log('Received webhook event:', eventType);
    console.log('Received signature:', signature);
    console.log('Received hook ID:', hookId);

    const integration =
      await this.integrationService.findIntegrationByHookId(hookId);

    if (!integration) {
      throw new NotFoundException(ErrorMessagesHelper.HOOK_ID_NOT_FOUND);
    }

    this.integrationService.verifySignature(
      signature,
      integration.githubWebhookSecret,
      payload,
    );

    return this.integrationService.handleNotification({
      payload,
      integration,
    });
  }
}
