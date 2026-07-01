import { CreateFab, type CreateFabOption } from '@/components/ui/create-fab';
import { shouldShowStaffCreateFab } from '@/lib/permissions';
import { useAuthStore } from '@/stores/auth-store';
import type { Href } from 'expo-router';

const JOIN_STAFF_OPTION: CreateFabOption = {
  id: 'join',
  label: 'Join as staff',
  description: 'Create your staff profile and account',
  icon: 'person-add-outline',
  href: '/staff/register' as Href,
};

const CREATE_STAFF_OPTION: CreateFabOption = {
  id: 'create',
  label: 'Create staff',
  description: 'Admin: create a staff account',
  icon: 'shield-checkmark-outline',
  href: '/staff/create' as Href,
};

export function StaffCreateFab() {
  const user = useAuthStore((state) => state.user);

  if (!shouldShowStaffCreateFab(user)) {
    return null;
  }

  const options = user?.role === 'ADMIN'
    ? [CREATE_STAFF_OPTION]
    : [JOIN_STAFF_OPTION];

  return (
    <CreateFab
      accessibilityLabel="Staff actions"
      sheetTitle="Staff"
      sheetSubtitle={
        user?.role === 'ADMIN'
          ? 'Create a staff account'
          : 'Join the staff directory'
      }
      options={options}
    />
  );
}
