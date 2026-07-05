import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { type Href, useRouter } from 'expo-router';

import { UserAvatar } from '@/components/user/user-avatar';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useTheme } from '@/hooks/use-theme';
import { resetNavigationTo } from '@/lib/auth-navigation';
import { getProfileHref } from '@/lib/profile-navigation';
import { getUserDisplayName } from '@/lib/user-display';
import { selectIsAuthenticated, useAuthStore } from '@/stores/auth-store';

export function AuthHeaderActions() {
  const router = useRouter();
  const { colors } = useTheme();
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [logoutDialogVisible, setLogoutDialogVisible] = useState(false);

  function handleLogout() {
    setLogoutDialogVisible(false);
    logout();
    resetNavigationTo('/(tabs)' as Href);
  }

  if (isAuthenticated && user) {
    const displayName = getUserDisplayName(user);
    const profileHref = getProfileHref(user);

    function handleOpenProfile() {
      if (profileHref) {
        router.push(profileHref);
      }
    }

    return (
      <>
        <View style={styles.container}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open profile"
            onPress={handleOpenProfile}
            style={({ pressed }) => [
              styles.profileButton,
              { opacity: pressed ? 0.75 : 1 },
            ]}
          >
            <UserAvatar
              displayName={displayName}
              profilePicture={user.profilePicture}
              size={36}
            />
            <View style={styles.userBadge}>
              <Text
                style={[styles.username, { color: colors.text }]}
                numberOfLines={1}
              >
                {displayName}
              </Text>
              <Text style={[styles.role, { color: colors.textSecondary }]}>
                {user.role}
              </Text>
            </View>
          </Pressable>
          <Pressable
            onPress={() => setLogoutDialogVisible(true)}
            style={({ pressed }) => [
              styles.button,
              { borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Text style={[styles.buttonText, { color: colors.text }]}>Log out</Text>
          </Pressable>
        </View>

        <ConfirmDialog
          visible={logoutDialogVisible}
          title="Log out"
          message="Are you sure you want to log out?"
          onDismiss={() => setLogoutDialogVisible(false)}
          actions={[
            {
              label: 'Cancel',
              variant: 'cancel',
              onPress: () => setLogoutDialogVisible(false),
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

  return (
    <Pressable
      onPress={() => router.push('/login' as Href)}
      style={({ pressed }) => [
        styles.button,
        styles.primaryButton,
        { backgroundColor: colors.tint, opacity: pressed ? 0.85 : 1 },
      ]}
    >
      <Text style={[styles.buttonText, styles.primaryButtonText]}>Log in</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginRight: 4,
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexShrink: 1,
  },
  userBadge: {
    alignItems: 'flex-start',
    maxWidth: 120,
  },
  username: {
    fontSize: 13,
    fontWeight: '600',
  },
  role: {
    fontSize: 11,
    fontWeight: '500',
  },
  button: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  primaryButton: {
    borderWidth: 0,
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  primaryButtonText: {
    color: '#FFFFFF',
  },
});
