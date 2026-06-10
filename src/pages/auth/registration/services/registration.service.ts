import {
  apiClient,
  clearAuthSession,
  ensureCsrfCookie,
  setAuthTokenFromResponse,
} from '@/services/api';
import type { RegisterRequest, RegisterResponse } from '../types/registration.types';

export async function registerUser(data: RegisterRequest): Promise<RegisterResponse> {
  await clearAuthSession();
  await ensureCsrfCookie();

  const response = await apiClient.post<RegisterResponse>('auth/register', data);
  return response.data;
}

export async function loginUser(email: string, password: string): Promise<void> {
  await clearAuthSession();
  await ensureCsrfCookie();

  const response = await apiClient.post<Record<string, unknown>>('auth/login', {
    email,
    password,
  });

  setAuthTokenFromResponse(response.data);
  sessionStorage.setItem("mcc_is_authenticated", "true");
}
