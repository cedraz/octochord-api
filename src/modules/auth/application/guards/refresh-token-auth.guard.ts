import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StrategiesConstant } from 'src/shared/constants/strategies.constant';

@Injectable()
export class RefreshTokenAuthGuard extends AuthGuard(
  StrategiesConstant.REFRESH_TOKEN_STRATEGY,
) {}
