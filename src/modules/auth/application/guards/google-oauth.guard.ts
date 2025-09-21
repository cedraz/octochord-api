import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StrategiesHelper } from 'src/shared/helpers/strategies.helper';

@Injectable()
export class GoogleOauthGuard extends AuthGuard(
  StrategiesHelper.GOOGLE_OAUTH_STRATEGY,
) {}
