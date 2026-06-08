import axios from 'axios';
import { apiClient, SANCTUM_CSRF_URL } from '@/services/api';
import type { RegisterRequest, RegisterResponse } from '../types/registration.types';

export async function registerUser(data: RegisterRequest): Promise<RegisterResponse> {
  // CSRF handshake 
  await axios.get(SANCTUM_CSRF_URL, { withCredentials: true });

  // Register
  const response = await apiClient.post<RegisterResponse>('auth/register', data);
  return response.data;
}
