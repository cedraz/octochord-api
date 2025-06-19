import { Integration } from '../entities/integration.entity';
import { PushEvent } from '@octokit/webhooks-types';

export class GithubNotificationDto {
  payload: PushEvent;
  integration: Integration;
}
