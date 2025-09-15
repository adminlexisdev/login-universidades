import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-saml';

@Injectable()
export class SamlStrategy extends PassportStrategy(Strategy, 'saml') {
  constructor() {
    super({
      entryPoint:
        'https://login.microsoftonline.com/b01015b7-2169-467c-a7b8-c5f48d97892e/saml2',
      issuer: 'universidad.lexis.com.ec/sso',
      callbackUrl: 'https://universidad.lexis.com.ec/sso/callback',
      logoutUrl:
        'https://login.microsoftonline.com/b01015b7-2169-467c-a7b8-c5f48d97892e/saml2',
      cert: 'MIIC8DCCAdigAwIBAgIQa8PLwYpVz4tLYaTWA6oVjTANBgkqhkiG9w0BAQsFADA0MTIwMAYDVQQDEylNaWNyb3NvZnQgQXp1cmUgRmVkZXJhdGVkIFNTTyBDZXJ0aWZpY2F0ZTAeFw0yNTA4MTQxNzQxNTNaFw0yODA4MTQxNzQxNTNaMDQxMjAwBgNVBAMTKU1pY3Jvc29mdCBBenVyZSBGZWRlcmF0ZWQgU1NPIENlcnRpZmljYXRlMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA3QqNBePllPyuis9GIdmC9iij1UPgMuqU/GCHWH3F3tGX1w8JNZJrVM4G8DChEjOv16fFEGVWZ+J8Hwd73O56BoG2KjpYaODcuh7VCzyVCp6nOAga3L39ZZ2FCV4ngNL4SyUFB5V7mcIcrzTO5AA7a4SLbz1jOWqKS92gkfkuoOVLtClC58EYwoJfpSvydJquhUR0AeTomm5poBEJt1c4rxchJnofbr5w3TCx+VFTozMXiy+qJMMmqtRwsahQHwfYSO1R4TPr09NjwuXwOAcEJ/i9znAfJLLjU/AObE/QqohUjsgyASFZKQMELmSoGI7nM4BOEUI/oDzm14Z/ZP7jhQIDAQABMA0GCSqGSIb3DQEBCwUAA4IBAQA+WPTd28Ay5Twpdm22bQA2jh0Ir06mwMpA82db8sD05SCy6lW+DEW9Z5zFNtbDDP7rwnKMy/bQnjTEUfTyoLnZAnapK9NXBvPZzKnv83l+QNF2dz1MhY6ySlwnQcXLuowK2wwGC9NbE7hunWvKE1OHQtsxYGorG8Xod++vYzuewdVeCKzIg2Bv+w55TxC9a/6NSScGNtA0OUHQ49+baGdOvFAzKhAUmCHhYnkAnywKIVYrdJdItT0HBdHgP9Xbc/6QlejMcOnkWl3ExXG+Aouz3icL79a9YKLsqfvkomHkU/g+tYpQU0RW5FRhfZvK11YCzc8I79cOrr2pDGxnBV2L',
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
