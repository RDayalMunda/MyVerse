import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BookSectionContent } from '@/components/projects/book-section-content';
import { ProjectAdminActions } from '@/components/projects/project-admin-actions';
import { EmptyState } from '@/components/projects/project-card';
import { ProjectDetailHeader } from '@/components/projects/project-detail-header';
import { PhotoshootSectionContent } from '@/components/projects/photoshoot-section-content';
import { SectionPicker } from '@/components/projects/section-picker';
import { useProject } from '@/hooks/use-project';
import { useSelectedSection } from '@/hooks/use-selected-section';
import { useTheme } from '@/hooks/use-theme';
import { canManageProjects } from '@/lib/permissions';
import { useAuthStore } from '@/stores/auth-store';

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const user = useAuthStore((state) => state.user);
  const isAdmin = canManageProjects(user?.role);
  const { project, isLoading, error, refetch } = useProject(id);
  const { sections, selectedSection, selectedSectionId, setSelectedSectionId } =
    useSelectedSection(project?.sections);

  if (isLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.tint} />
      </View>
    );
  }

  if (error || !project) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <EmptyState
          message={error ?? 'Project not found'}
          actionLabel="Try again"
          onAction={refetch}
        />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + 24 },
      ]}
    >
      <ProjectDetailHeader project={project} />

      {isAdmin ? (
        <ProjectAdminActions project={project} onUnpublished={refetch} />
      ) : null}

      {sections.length > 0 ? (
        <SectionPicker
          sections={sections}
          selectedSectionId={selectedSectionId}
          onSelectSectionId={setSelectedSectionId}
          showStatusBadge={isAdmin}
        />
      ) : (
        <Text style={[styles.emptySections, { color: colors.textSecondary }]}>
          No published sections yet.
        </Text>
      )}

      {project.type === 'BOOK' ? (
        <BookSectionContent
          key={selectedSectionId ?? 'book'}
          section={selectedSection}
        />
      ) : null}

      {project.type === 'PHOTOSHOOT' ? (
        <PhotoshootSectionContent
          key={selectedSectionId ?? 'photoshoot'}
          section={selectedSection}
        />
      ) : null}

      {project.type === 'SHOW' ? (
        <View style={[styles.comingSoon, { borderColor: colors.border }]}>
          <Text style={[styles.comingSoonText, { color: colors.textSecondary }]}>
            Video shows — coming in Slice 3
          </Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 20,
    gap: 20,
  },
  emptySections: {
    fontSize: 15,
    textAlign: 'center',
    paddingVertical: 16,
  },
  comingSoon: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  comingSoonText: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
