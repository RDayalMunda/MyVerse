import { Pressable, StyleSheet, Text, View } from 'react-native';
import { type Href, useRouter } from 'expo-router';

import { UserAvatar } from '@/components/user/user-avatar';
import { useTheme } from '@/hooks/use-theme';
import { getProfileHref } from '@/lib/profile-navigation';
import { getUserDisplayName } from '@/lib/user-display';
import { selectIsAuthenticated, useAuthStore } from '@/stores/auth-store';

export function AuthHeaderActions() {
  const router = useRouter();
  const { colors } = useTheme();
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const user = useAuthStore((state) => state.user);

  if (isAuthenticated && user) {
    const displayName = getUserDisplayName(user);
    const profileHref = getProfileHref(user);

    function handleOpenProfile() {
      if (profileHref) {
        router.push(profileHref);
      }
    }

    return (
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
    );
  }

  return (
    <Pressable
      onPress={() => router.push('/login' as Href)}
      style={({ pressed }) => [
        styles.loginButton,
        { backgroundColor: colors.tint, opacity: pressed ? 0.85 : 1 },
      ]}
    >
      <Text style={styles.loginButtonText}>Log in</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
  loginButton: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});
