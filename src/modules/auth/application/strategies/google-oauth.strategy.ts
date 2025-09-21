import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth2';
import { env } from 'src/shared/config/env.schema';
import { StrategiesHelper } from 'src/shared/helpers/strategies.helper';
import { GoogleProfile, GoogleUser } from '../../domain/types';

@Injectable()
export class GoogleStrategy extends PassportStrategy(
  Strategy,
  StrategiesHelper.GOOGLE_OAUTH_STRATEGY,
) {
  constructor() {
    super({
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: env.GOOGLE_CALLBACK_URL,
      scope: ['profile', 'email'],
    });
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: GoogleProfile,
    done: VerifyCallback,
  ) {
    const { id, name, emails, photos } = profile;

    const user: GoogleUser = {
      provider: 'google',
      providerId: id,
      email: emails[0].value,
      name: `${name.givenName} ${name.familyName}`,
      picture: photos.length > 0 ? photos[0].value : null,
    };

    done(null, user);
  }
}
