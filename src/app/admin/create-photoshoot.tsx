import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { CreatePhotoshootWizard } from '@/components/admin/create-photoshoot-wizard';
import { PlaceholderScreen } from '@/components/ui/placeholder-screen';
import { useTheme } from '@/hooks/use-theme';
import { canManageProjects } from '@/lib/permissions';
import { useAuthStore } from '@/stores/auth-store';

export default function CreatePhotoshootScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const user = useAuthStore((state) => state.user);

  if (!canManageProjects(user?.role)) {
    return (
      <View style={[styles.denied, { backgroundColor: colors.background }]}>
        <PlaceholderScreen
          title="Access denied"
          subtitle="You need admin permissions to create projects."
          iconName="hammer-outline"
          denied
        />
        <Pressable onPress={() => router.back()} style={styles.backLink}>
          <Text style={{ color: colors.tint, fontWeight: '600' }}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  return <CreatePhotoshootWizard />;
}

const styles = StyleSheet.create({
  denied: {
    flex: 1,
  },
  backLink: {
    alignItems: 'center',
    paddingBottom: 32,
  },
});
