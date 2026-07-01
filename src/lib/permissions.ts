import type { UserRole } from '@/types/user';

export function canReadStaff(_role?: UserRole | null): boolean {
  return true;
}

export function canManageUsers(role?: UserRole | null): boolean {
  return role === 'ADMIN';
}
