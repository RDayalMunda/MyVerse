import type { User, UserRole } from '@/types/user';

export function canReadStaff(_role?: UserRole | null): boolean {
  return true;
}

/** Guest-only: self-register creates a new account. */
export function canJoinAsStaff(user?: User | null): boolean {
  return !user;
}

/** FAB on Staff tab: guests (join) and admins (create). Hidden for STAFF/PUBLIC. */
export function shouldShowStaffCreateFab(user?: User | null): boolean {
  if (!user) {
    return true;
  }
  return user.role === 'ADMIN';
}

export function canManageUsers(role?: UserRole | null): boolean {
  return role === 'ADMIN';
}

export function canCreateStaffAsAdmin(role?: UserRole | null): boolean {
  return canManageUsers(role);
}

export function canManageProjects(role?: UserRole | null): boolean {
  return role === 'ADMIN';
}

export function canUpdateOwnStaffProfile(role?: UserRole | null): boolean {
  return role === 'STAFF';
}

export function isOwnUser(
  userId?: string | null,
  profileUserId?: string | null,
): boolean {
  return Boolean(userId && profileUserId && userId === profileUserId);
}
