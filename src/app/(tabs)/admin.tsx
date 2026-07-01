import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  EmptyState,
  ProjectCard,
  ProjectCardSkeleton,
} from '@/components/projects/project-card';
import { PlaceholderScreen } from '@/components/ui/placeholder-screen';
import { useProjects } from '@/hooks/use-projects';
import { useTheme } from '@/hooks/use-theme';
import { canManageProjects } from '@/lib/permissions';
import { useAuthStore } from '@/stores/auth-store';

export default function AdminScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const user = useAuthStore((state) => state.user);
  const { projects, isLoading, error, refetch } = useProjects();

  if (!canManageProjects(user?.role)) {
    return (
      <PlaceholderScreen
        title="Access denied"
        subtitle="You need admin permissions to manage projects."
        iconName="hammer-outline"
        denied
      />
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + 16 },
        ]}
        data={projects}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor={colors.tint}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={[styles.heading, { color: colors.text }]}>Admin</Text>
            <Text style={[styles.subheading, { color: colors.textSecondary }]}>
              View all projects including drafts
            </Text>
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.skeletons}>
              <ProjectCardSkeleton />
              <ProjectCardSkeleton />
            </View>
          ) : error ? (
            <EmptyState
              message={error}
              actionLabel="Try again"
              onAction={refetch}
            />
          ) : (
            <EmptyState message="No projects yet." />
          )
        }
        renderItem={({ item }) => (
          <ProjectCard project={item} showStatus />
        )}
      />
      {isLoading && projects.length > 0 ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator color={colors.tint} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    gap: 8,
    marginBottom: 12,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
  },
  subheading: {
    fontSize: 15,
  },
  list: {
    padding: 16,
    gap: 12,
  },
  skeletons: {
    gap: 12,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
});
