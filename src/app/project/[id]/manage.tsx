import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { publishProjectApi } from '@/api/projects.api';
import { ManageNavRow } from '@/components/admin/manage-nav-row';
import { ProjectAdminGate } from '@/components/admin/project-admin-gate';
import { EmptyState } from '@/components/projects/project-card';
import { useProjectOnFocus } from '@/hooks/use-project-on-focus';
import { useTheme } from '@/hooks/use-theme';
import { invalidateProjectsList } from '@/stores/list-invalidation-store';
import { getErrorMessage } from '@/types/api';
import { useState } from 'react';

const TYPE_LABELS = {
  BOOK: 'Book',
  PHOTOSHOOT: 'Photoshoot',
  SHOW: 'Show',
} as const;

export default function ManageProjectScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { project, isLoading, error, refetch } = useProjectOnFocus(id);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);

  const canPublish =
    project?.status === 'DRAFT' || project?.status === 'UNPUBLISHED';

  async function handlePublish() {
    if (!project) return;
    setPublishError(null);
    setIsPublishing(true);
    try {
      await publishProjectApi(project.id);
      invalidateProjectsList();
      refetch();
    } catch (err) {
      setPublishError(getErrorMessage(err));
    } finally {
      setIsPublishing(false);
    }
  }

  return (
    <ProjectAdminGate>
      {isLoading && !project ? (
        <View style={[styles.centered, { backgroundColor: colors.background }]}>
          <ActivityIndicator size="large" color={colors.tint} />
        </View>
      ) : error || !project ? (
        <View style={[styles.centered, { backgroundColor: colors.background }]}>
          <EmptyState
            message={error ?? 'Project not found'}
            actionLabel="Try again"
            onAction={refetch}
          />
        </View>
      ) : (
        <ScrollView
          style={{ backgroundColor: colors.background }}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + 24 },
          ]}
        >
          <View
            style={[
              styles.summary,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.summaryType, { color: colors.tint }]}>
              {TYPE_LABELS[project.type]}
            </Text>
            <Text style={[styles.summaryTitle, { color: colors.text }]}>
              {project.title}
            </Text>
            <Text style={[styles.summaryStatus, { color: colors.textSecondary }]}>
              Status: {project.status}
            </Text>
          </View>

          <View style={styles.nav}>
            <ManageNavRow
              label="Edit project details"
              description="Title, description, and type-specific fields"
              onPress={() => router.push(`/project/${id}/edit` as Href)}
            />
            <ManageNavRow
              label="Manage sections"
              description="Add, edit, reorder, and publish sections"
              onPress={() => router.push(`/project/${id}/sections` as Href)}
            />
          </View>

          {canPublish ? (
            <View style={styles.publishBlock}>
              <Text style={[styles.publishHint, { color: colors.textSecondary }]}>
                Publish the project when it should appear on the catalog. Sections
                must be published separately for their content to be visible.
              </Text>
              {publishError ? (
                <Text style={[styles.publishError, { color: colors.error }]}>
                  {publishError}
                </Text>
              ) : null}
              <Pressable
                disabled={isPublishing}
                onPress={() => void handlePublish()}
                style={[styles.publishButton, { backgroundColor: colors.tint }]}
              >
                {isPublishing ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.publishText}>Publish project</Text>
                )}
              </Pressable>
            </View>
          ) : null}
        </ScrollView>
      )}
    </ProjectAdminGate>
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
  summary: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  summaryType: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  summaryTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  summaryStatus: {
    fontSize: 14,
  },
  nav: {
    gap: 12,
  },
  publishBlock: {
    gap: 12,
  },
  publishHint: {
    fontSize: 14,
    lineHeight: 20,
  },
  publishError: {
    fontSize: 14,
  },
  publishButton: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  publishText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
