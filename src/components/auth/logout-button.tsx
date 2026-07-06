import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { type Href } from 'expo-router';

import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useTheme } from '@/hooks/use-theme';
import { resetNavigationTo } from '@/lib/auth-navigation';
import { useAuthStore } from '@/stores/auth-store';

export function LogoutButton() {
  const { colors } = useTheme();
  const logout = useAuthStore((state) => state.logout);
  const [dialogVisible, setDialogVisible] = useState(false);

  function handleLogout() {
    setDialogVisible(false);
    logout();
    resetNavigationTo('/(tabs)' as Href);
  }

  return (
    <>
      <Pressable
        onPress={() => setDialogVisible(true)}
        style={({ pressed }) => [
          styles.button,
          { borderColor: colors.error, opacity: pressed ? 0.7 : 1 },
        ]}
      >
        <Text style={[styles.buttonText, { color: colors.error }]}>Log out</Text>
      </Pressable>

      <ConfirmDialog
        visible={dialogVisible}
        title="Log out"
        message="Are you sure you want to log out?"
        onDismiss={() => setDialogVisible(false)}
        actions={[
          {
            label: 'Cancel',
            variant: 'cancel',
            onPress: () => setDialogVisible(false),
          },
          {
            label: 'Log out',
            variant: 'destructive',
            onPress: handleLogout,
          },
        ]}
      />
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
