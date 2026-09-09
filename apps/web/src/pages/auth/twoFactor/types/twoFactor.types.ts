export type TwoFactorStep =
  | 'idle'      // not yet started
  | 'confirmPassword'
  | 'setup'     // QR + secret + recovery codes shown
  | 'confirm'   // waiting for 6-digit TOTP code
  | 'enabled';  // fully confirmed

export interface PasswordConfirmedStatusResponse {
  confirmed: boolean;
}

export interface TwoFactorQrCodeResponse {
  svg: string;
}

export interface TwoFactorSecretKeyResponse {
  secretKey: string;
}

export type TwoFactorRecoveryCodesResponse = string[];

export interface TwoFactorSetupData {
  qrSvg: string;
  secretKey: string;
  recoveryCodes: string[];
}

export interface TwoFactorConfirmRequest {
  code: string;
}

export interface ConfirmPasswordRequest {
  password: string;
}
