import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StrategiesConstant } from 'src/shared/constants/strategies.constant';

@Injectable()
export class JwtAuthGuard extends AuthGuard(
  StrategiesConstant.ACCESS_TOKEN_STRATEGY,
) {}
