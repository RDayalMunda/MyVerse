import { request } from '@/api/client';
import type { LoginResponse, User } from '@/types/user';

export async function loginApi(
  email: string,
  password: string,
): Promise<LoginResponse> {
  return request<LoginResponse>('/auth/login', {
    method: 'POST',
    body: { email, password },
    token: null,
    skipAuthLogout: true,
  });
}

export async function getMeApi(): Promise<User> {
  return request<User>('/auth/me', { skipAuthLogout: true });
}
