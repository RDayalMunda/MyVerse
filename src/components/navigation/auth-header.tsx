import { Pressable, StyleSheet, Text, View } from 'react-native';
import { type Href, useRouter } from 'expo-router';

import { useTheme } from '@/hooks/use-theme';
import { selectIsAuthenticated, useAuthStore } from '@/stores/auth-store';

export function AuthHeaderActions() {
  const router = useRouter();
  const { colors } = useTheme();
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  if (isAuthenticated && user) {
    return (
      <View style={styles.container}>
        <View style={styles.userBadge}>
          <Text style={[styles.username, { color: colors.text }]}>
            {user.displayName ?? user.username}
          </Text>
          <Text style={[styles.role, { color: colors.textSecondary }]}>
            {user.role}
          </Text>
        </View>
        <Pressable
          onPress={() => {
            logout();
            router.replace('/(tabs)' as Href);
          }}
          style={({ pressed }) => [
            styles.button,
            { borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Text style={[styles.buttonText, { color: colors.text }]}>Log out</Text>
        </Pressable>
      </View>
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
  userBadge: {
    alignItems: 'flex-end',
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
