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
import { useProjects } from '@/hooks/use-projects';
import { useTheme } from '@/hooks/use-theme';

export default function ProjectsScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { projects, meta, isLoading, error, refetch } = useProjects();

  if (isLoading && projects.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={[styles.heading, { color: colors.text }]}>Projects</Text>
          <Text style={[styles.subheading, { color: colors.textSecondary }]}>
            Explore the MyVerse universe
          </Text>
        </View>
        <View style={styles.list}>
          <ProjectCardSkeleton />
          <ProjectCardSkeleton />
          <ProjectCardSkeleton />
        </View>
      </View>
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
          <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.tint} />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={[styles.heading, { color: colors.text }]}>Projects</Text>
            <Text style={[styles.subheading, { color: colors.textSecondary }]}>
              Explore the MyVerse universe
            </Text>
            {meta ? (
              <Text style={[styles.count, { color: colors.textSecondary }]}>
                {meta.total} project{meta.total === 1 ? '' : 's'}
              </Text>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          error ? (
            <EmptyState
              message={error}
              actionLabel="Try again"
              onAction={refetch}
            />
          ) : (
            <EmptyState message="No projects published yet." />
          )
        }
        renderItem={({ item }) => <ProjectCard project={item} />}
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
    gap: 4,
    marginBottom: 8,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
  },
  subheading: {
    fontSize: 15,
  },
  count: {
    fontSize: 13,
    marginTop: 4,
  },
  list: {
    padding: 16,
    gap: 12,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
});
