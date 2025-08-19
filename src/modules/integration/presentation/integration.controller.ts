import {
  Controller,
  Post,
  Body,
  Headers,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { PushEvent } from '@octokit/webhooks-types';
import { ApiBearerAuth, ApiHideProperty } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/application/guards/access-token-auth.guard';
import { ErrorMessagesHelper } from 'src/shared/helpers/error-messages.helper';
import { IntegrationService } from '../application/integration.service';
import { CreateIntegrationDto } from '../application/dto/create-integration.dto';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { TAuthenticatedUser } from 'src/shared/types/authenticated-user';

@Controller('integration')
export class IntegrationController {
  constructor(private readonly integrationService: IntegrationService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  create(
    @Body() createIntegrationDto: CreateIntegrationDto,
    @CurrentUser() user: TAuthenticatedUser,
  ) {
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
