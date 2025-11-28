import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-saml';

@Injectable()
export class SamlStrategy extends PassportStrategy(Strategy, 'saml') {
  constructor() {
    const entryPoint = process.env.SAML_ENTRY_POINT;
    const issuer = process.env.SAML_ISSUER;
    const callbackUrl = process.env.SAML_CALLBACK_URL;
    const logoutUrl = process.env.SAML_LOGOUT_URL;
    const cert = process.env.SAML_CERT;

    super({
      entryPoint,
      issuer,
      callbackUrl,
      logoutUrl,
      cert,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  async validate(profile: any, done: Function) {
    const user = {
      id: profile.nameID,
      email:
        profile.email ||
        profile[
          'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'
        ],
      displayName:
        profile['http://schemas.microsoft.com/identity/claims/displayname'],
    };

    return done(null, user);
  }
}
