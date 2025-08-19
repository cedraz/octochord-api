import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StrategiesHelper } from 'src/shared/helpers/strategies.helper';

@Injectable()
export class RefreshTokenAuthGuard extends AuthGuard(
  StrategiesHelper.REFRESH_TOKEN_STRATEGY,
) {}
