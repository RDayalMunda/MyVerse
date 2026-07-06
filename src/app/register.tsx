import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { type Href } from 'expo-router';

import { PublicRegisterWizard } from '@/components/auth/public-register-wizard';
import { useTheme } from '@/hooks/use-theme';
import { resetNavigationTo } from '@/lib/auth-navigation';
import { canRegisterPublic } from '@/lib/permissions';
import { useAuthStore } from '@/stores/auth-store';

export default function RegisterScreen() {
  const { colors } = useTheme();
  const user = useAuthStore((state) => state.user);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  useEffect(() => {
    if (!isHydrated || canRegisterPublic(user)) {
      return;
    }
    resetNavigationTo('/(tabs)' as Href);
  }, [isHydrated, user]);

  if (!isHydrated) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator color={colors.tint} />
      </View>
    );
  }

  if (!canRegisterPublic(user)) {
    return null;
  }

  return <PublicRegisterWizard />;
}
