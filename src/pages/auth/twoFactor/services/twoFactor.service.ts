import { apiClient, ensureCsrfCookie } from '@/services/api';
import type {
  ConfirmPasswordRequest,
  PasswordConfirmedStatusResponse,
  TwoFactorConfirmRequest,
  TwoFactorQrCodeResponse,
  TwoFactorRecoveryCodesResponse,
  TwoFactorSecretKeyResponse,
  TwoFactorSetupData,
} from '../types/twoFactor.types';

export async function getPasswordConfirmedStatus(): Promise<PasswordConfirmedStatusResponse> {
  const response = await apiClient.get<PasswordConfirmedStatusResponse>(
    'auth/user/confirmed-password-status',
  );
  return response.data;
}

export async function enableTwoFactor(): Promise<void> {
  await ensureCsrfCookie();
  await apiClient.post('auth/user/two-factor-authentication');
}

export async function fetchTwoFactorSetupData(): Promise<TwoFactorSetupData> {
  const [qrResponse, secretResponse, recoveryResponse] = await Promise.all([
    apiClient.get<TwoFactorQrCodeResponse>('auth/user/two-factor-qr-code'),
    apiClient.get<TwoFactorSecretKeyResponse>('auth/user/two-factor-secret-key'),
    apiClient.get<TwoFactorRecoveryCodesResponse>('auth/user/two-factor-recovery-codes'),
  ]);

  return {
    qrSvg: qrResponse.data.svg,
    secretKey: secretResponse.data.secretKey,
    recoveryCodes: recoveryResponse.data,
  };
}

export async function confirmTwoFactor(data: TwoFactorConfirmRequest): Promise<void> {
  await ensureCsrfCookie();
  await apiClient.post('auth/user/confirmed-two-factor-authentication', data);
}

export async function confirmPassword(data: ConfirmPasswordRequest): Promise<void> {
  await ensureCsrfCookie();
  await apiClient.post('auth/user/confirm-password', data);
}
