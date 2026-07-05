import type { ReactNode } from 'react';

import { PlaceholderScreen } from '@/components/ui/placeholder-screen';
import { canManageProjects } from '@/lib/permissions';
import { useAuthStore } from '@/stores/auth-store';

type ProjectAdminGateProps = {
  children: ReactNode;
};

export function ProjectAdminGate({ children }: ProjectAdminGateProps) {
  const user = useAuthStore((state) => state.user);

  if (!canManageProjects(user?.role)) {
    return (
      <PlaceholderScreen
        title="Access denied"
        subtitle="You need admin permissions to manage projects."
        iconName="lock-closed-outline"
        denied
      />
    );
  }

  return children;
}
