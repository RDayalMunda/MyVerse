import { request } from '@/api/client';
import type { AdminCreateStaffRequest } from '@/types/staff';
import type { ProjectVisibility } from '@/types/project';
import type { FileMeta, User } from '@/types/user';

export type AdminUpdateUserRequest = {
  email?: string;
  username?: string;
  displayName?: string;
  profilePicture?: FileMeta;
};

export type UpdateMeRequest = {
  displayName?: string;
  profilePicture?: FileMeta;
  nsfwEnabled?: boolean;
  defaultVisibility?: ProjectVisibility;
};

export async function createStaffUserApi(
  body: AdminCreateStaffRequest,
): Promise<User> {
  return request<User>('/users', {
    method: 'POST',
    body,
  });
}

export async function updateUserApi(
  id: string,
  body: AdminUpdateUserRequest,
): Promise<User> {
  return request<User>(`/users/${id}`, {
    method: 'PATCH',
    body,
  });
}

export async function updateMeApi(body: UpdateMeRequest): Promise<User> {
  return request<User>('/users/me', {
    method: 'PATCH',
    body,
  });
}

export async function activateUserApi(id: string): Promise<User> {
  return request<User>(`/users/${id}/activate`, { method: 'PATCH' });
}

export async function deactivateUserApi(id: string): Promise<User> {
  return request<User>(`/users/${id}/deactivate`, { method: 'PATCH' });
}
