import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { reorderSectionsApi } from '@/api/sections.api';
import { ProjectAdminGate } from '@/components/admin/project-admin-gate';
import { ReorderButtons } from '@/components/admin/reorder-buttons';
import { EmptyState } from '@/components/projects/project-card';
import {
  sortedSections,
  useProjectOnFocus,
} from '@/hooks/use-project-on-focus';
import { useTheme } from '@/hooks/use-theme';
import { idsInOrder, moveItemDown, moveItemUp } from '@/lib/reorder';
import { invalidateProjectsList } from '@/stores/list-invalidation-store';
import { getErrorMessage } from '@/types/api';
import type { Section } from '@/types/project';

export default function SectionsListScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { project, isLoading, error, refetch } = useProjectOnFocus(id);
  const [sections, setSections] = useState<Section[]>([]);
  const [reorderLoading, setReorderLoading] = useState(false);
  const [reorderError, setReorderError] = useState<string | null>(null);

  const sorted = sortedSections(project);

  useEffect(() => {
    setSections(sorted);
  }, [project?.sections]);

  const displaySections = sections;

  async function persistReorder(nextSections: Section[]) {
    if (!id) return;
    setReorderError(null);
    setReorderLoading(true);
    try {
      await reorderSectionsApi(id, idsInOrder(nextSections));
      setSections(nextSections);
      invalidateProjectsList();
      refetch();
    } catch (err) {
      setReorderError(getErrorMessage(err));
    } finally {
      setReorderLoading(false);
    }
  }

  function handleMoveUp(index: number) {
    const next = moveItemUp(displaySections, index);
    if (next) void persistReorder(next);
  }

  function handleMoveDown(index: number) {
    const next = moveItemDown(displaySections, index);
    if (next) void persistReorder(next);
  }

  return (
    <ProjectAdminGate>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {isLoading && !project ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={colors.tint} />
          </View>
        ) : error || !project ? (
          <View style={styles.centered}>
            <EmptyState
              message={error ?? 'Project not found'}
              actionLabel="Try again"
              onAction={refetch}
            />
          </View>
        ) : (
          <>
            <FlatList
              contentContainerStyle={[
                styles.list,
                { paddingBottom: insets.bottom + 80 },
              ]}
              data={displaySections}
              keyExtractor={(item) => item.id}
              ListHeaderComponent={
                <View style={styles.header}>
                  <Text style={[styles.heading, { color: colors.text }]}>
                    Sections
                  </Text>
                  <Text style={[styles.subheading, { color: colors.textSecondary }]}>
                    Reorder with the arrows. Tap a section to edit it.
                  </Text>
                  {reorderError ? (
                    <Text style={[styles.error, { color: colors.error }]}>
                      {reorderError}
                    </Text>
                  ) : null}
                </View>
              }
              ListEmptyComponent={
                <EmptyState message="No sections yet. Add your first section." />
              }
              renderItem={({ item, index }) => (
                <Pressable
                  onPress={() =>
                    router.push(
                      `/project/${id}/sections/${item.id}/edit` as Href,
                    )
                  }
                  style={({ pressed }) => [
                    styles.row,
                    {
                      borderColor: colors.border,
                      backgroundColor: colors.surface,
                      opacity: pressed ? 0.85 : 1,
                    },
                  ]}
                >
                  <View style={styles.rowMain}>
                    <Text style={[styles.rowLabel, { color: colors.text }]}>
                      {item.label}
                    </Text>
                    <View
                      style={[styles.statusBadge, { borderColor: colors.border }]}
                    >
                      <Text
                        style={[styles.statusText, { color: colors.textSecondary }]}
                      >
                        {item.status}
                      </Text>
                    </View>
                  </View>
                  <ReorderButtons
                    canMoveUp={index > 0}
                    canMoveDown={index < displaySections.length - 1}
                    onMoveUp={() => handleMoveUp(index)}
                    onMoveDown={() => handleMoveDown(index)}
                    disabled={reorderLoading}
                  />
                </Pressable>
              )}
            />
            <View
              style={[
                styles.footer,
                {
                  borderTopColor: colors.border,
                  paddingBottom: insets.bottom + 16,
                  backgroundColor: colors.background,
                },
              ]}
            >
              <Pressable
                onPress={() => router.push(`/project/${id}/sections/create` as Href)}
                style={[styles.addButton, { backgroundColor: colors.tint }]}
              >
                <Text style={styles.addText}>Add section</Text>
              </Pressable>
            </View>
          </>
        )}
      </View>
    </ProjectAdminGate>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    gap: 8,
    marginBottom: 12,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
  },
  subheading: {
    fontSize: 14,
    lineHeight: 20,
  },
  error: {
    fontSize: 14,
  },
  list: {
    padding: 16,
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    gap: 12,
    marginBottom: 10,
  },
  rowMain: {
    flex: 1,
    gap: 6,
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    padding: 16,
  },
  addButton: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  addText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
