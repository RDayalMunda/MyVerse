import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { type Href } from 'expo-router';

import { StaffRegisterWizard } from '@/components/staff/staff-register-wizard';
import { useTheme } from '@/hooks/use-theme';
import { resetNavigationTo } from '@/lib/auth-navigation';
import { canJoinAsStaff } from '@/lib/permissions';
import { useAuthStore } from '@/stores/auth-store';

export default function StaffRegisterScreen() {
  const { colors } = useTheme();
  const user = useAuthStore((state) => state.user);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  useEffect(() => {
    if (!isHydrated || canJoinAsStaff(user)) {
      return;
    }
    resetNavigationTo('/(tabs)/staff' as Href);
  }, [isHydrated, user]);

  if (!isHydrated) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.tint} />
      </View>
    );
  }

  if (!canJoinAsStaff(user)) {
    return null;
  }

  return <StaffRegisterWizard />;
}
