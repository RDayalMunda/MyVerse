import { request } from '@/api/client';
import type { LoginResponse, RegisterPublicRequest, User } from '@/types/user';
import type { RegisterStaffRequest } from '@/types/staff';

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

export async function registerStaffApi(
  body: RegisterStaffRequest,
): Promise<LoginResponse> {
  return request<LoginResponse>('/auth/register/staff', {
    method: 'POST',
    body,
    token: null,
    skipAuthLogout: true,
  });
}

export async function registerPublicApi(
  body: RegisterPublicRequest,
): Promise<LoginResponse> {
  return request<LoginResponse>('/auth/register', {
    method: 'POST',
    body,
    token: null,
    skipAuthLogout: true,
  });
}
