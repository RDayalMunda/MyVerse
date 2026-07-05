import type { Href } from 'expo-router';

import type { User } from '@/types/user';

export function getProfileHref(user: User | null | undefined): Href | null {
  if (!user) {
    return null;
  }

  if (user.role === 'STAFF') {
    const profileId = user.staffProfile?.id;
    return (profileId ? `/staff/${profileId}` : '/staff/edit') as Href;
  }

  return '/profile' as Href;
}
