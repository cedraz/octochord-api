import { CreateEmailIntegrationDto } from '../application/dto/create-email-integration.dto';
import { CreateIntegrationDto } from '../application/dto/create-integration.dto';
import { EmailIntegrationEntity } from './entities/email-integration.entity';
import { IntegrationEntity } from './entities/integration.entity';

export abstract class IntegrationRepository {
  abstract create(
    userId: string,
    createIntegrationDto: CreateIntegrationDto,
  ): Promise<IntegrationEntity>;

  abstract createEmailIntegration(
    integrationId: string,
    createEmailIntegrationDto: CreateEmailIntegrationDto,
  ): Promise<EmailIntegrationEntity>;

  abstract findIntegrationByHookId(
    hookId: string,
  ): Promise<IntegrationEntity | null>;
}
