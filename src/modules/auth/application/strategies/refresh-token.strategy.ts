import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { env } from 'src/shared/config/env.schema';
import { TAuthenticatedUser } from 'src/shared/types/authenticated-user';
import { StrategiesHelper } from 'src/shared/helpers/strategies.helper';
import { TRefreshTokenPayload } from 'src/shared/types/jwt-payload';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  StrategiesHelper.REFRESH_TOKEN_STRATEGY,
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: env.REFRESH_TOKEN_SECRET,
    });
  }

  validate(payload: TRefreshTokenPayload): TAuthenticatedUser {
    return { sub: payload.sub };
  }
}
