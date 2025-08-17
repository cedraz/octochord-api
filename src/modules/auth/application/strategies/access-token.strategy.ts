import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { env } from 'src/shared/config/env.schema';
import { TAccessTokenPayload } from 'src/shared/types/jwt-payload.interface';
import { TAuthenticatedUser } from 'src/shared/types/authenticated-user';
import { StrategiesConstant } from 'src/shared/constants/strategies.constant';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(
  Strategy,
  StrategiesConstant.ACCESS_TOKEN_STRATEGY,
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: env.ACCESS_TOKEN_SECRET,
    });
  }

  validate(payload: TAccessTokenPayload): TAuthenticatedUser {
    return { sub: payload.sub };
  }
}
