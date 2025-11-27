export interface UeaValidateOk {
  success: true;
  valid: true;
  data: {
    valid: true;
    scope: string;
    issuedAt: string;
    expiresAt: string;
  };
}

export interface UeaValidateFail {
  success: false;
  valid: false;
  message?: string;
}

export type UeaValidateResponse = UeaValidateOk | UeaValidateFail;

export interface UeaJwtPayload {
  jti?: string;
  userId?: string;
  email?: string;
  name?: string;
  dni?: string;
  interfaceId?: number;
  scope?: string;
  iat?: number;
  exp?: number;
  [k: string]: unknown;
}
