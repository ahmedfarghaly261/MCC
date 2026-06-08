import axios from 'axios';
import { apiClient, SANCTUM_CSRF_URL, setAuthToken } from '@/services/api';
import type { RegisterRequest, RegisterResponse } from '../types/registration.types';

async function clearExistingSession(): Promise<void> {
  setAuthToken(null);

  try {
    await axios.get(SANCTUM_CSRF_URL, { withCredentials: true });
    await apiClient.post('auth/logout');
  } catch {
    // No active session or no logout route is fine before registration.
  } finally {
    setAuthToken(null);
  }
}

function findAuthToken(value: unknown): string | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const record = value as Record<string, unknown>;
  const directToken =
    record['token'] ??
    record['access_token'] ??
    record['accessToken'] ??
    record['plainTextToken'];

  if (typeof directToken === 'string') {
    return directToken;
  }

  for (const nestedValue of Object.values(record)) {
    const nestedToken = findAuthToken(nestedValue);
    if (nestedToken) {
      return nestedToken;
    }
  }

  return null;
}

export async function registerUser(data: RegisterRequest): Promise<RegisterResponse> {
  await clearExistingSession();

  // CSRF handshake
  await axios.get(SANCTUM_CSRF_URL, { withCredentials: true });

  // Register
  const response = await apiClient.post<RegisterResponse>('auth/register', data);
  return response.data;
}

export async function loginUser(email: string, password: string): Promise<void> {
  await clearExistingSession();

  // CSRF handshake before login (required by Sanctum)
  await axios.get(SANCTUM_CSRF_URL, { withCredentials: true });

  const response = await apiClient.post<Record<string, unknown>>('auth/login', { email, password });

  const token = findAuthToken(response.data);

  if (token) {
    // Token-based auth: attach Bearer header to all future requests
    setAuthToken(token);
  } else {
    // Cookie-based auth: make sure no stale Bearer token overrides the new session
    setAuthToken(null);
  }
}
