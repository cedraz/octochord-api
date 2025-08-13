import { PushEvent } from '@octokit/webhooks-types';
import { IntegrationEntity } from '../../domain/entities/integration.entity';

export class GithubNotificationDto {
  payload: PushEvent;
  integration: IntegrationEntity;
}
