import {
  apiClient,
  clearAuthSession,
  ensureCsrfCookie,
  setAuthTokenFromResponse,
} from '@/services/api';
import type { LoginRequest } from '../types/login.types';

export async function loginUser(data: LoginRequest): Promise<void> {
  await clearAuthSession();
  await ensureCsrfCookie();

  const response = await apiClient.post<Record<string, unknown>>('auth/login', {
    email: data.email,
    password: data.password,
  });

  setAuthTokenFromResponse(response.data);
}
