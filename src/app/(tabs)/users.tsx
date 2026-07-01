import { PlaceholderScreen } from '@/components/ui/placeholder-screen';
import { canManageUsers } from '@/lib/permissions';
import { useAuthStore } from '@/stores/auth-store';

export default function UsersScreen() {
  const user = useAuthStore((state) => state.user);

  if (!canManageUsers(user?.role)) {
    return (
      <PlaceholderScreen
        title="Access denied"
        subtitle="You need admin permissions to manage users."
        iconName="shield-outline"
        denied
      />
    );
  }

  return (
    <PlaceholderScreen
      title="Users"
      subtitle="User management is coming soon."
      iconName="shield-outline"
    />
  );
}
