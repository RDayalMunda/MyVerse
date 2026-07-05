import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  deleteSectionItemApi,
  reorderSectionItemsApi,
} from '@/api/section-items.api';
import { ProjectAdminGate } from '@/components/admin/project-admin-gate';
import { ReorderButtons } from '@/components/admin/reorder-buttons';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { EmptyState } from '@/components/projects/project-card';
import {
  sortedItems,
  useProjectOnFocus,
} from '@/hooks/use-project-on-focus';
import { useTheme } from '@/hooks/use-theme';
import { mediaUrl } from '@/lib/media-url';
import { idsInOrder, moveItemDown, moveItemUp } from '@/lib/reorder';
import { invalidateProjectsList } from '@/stores/list-invalidation-store';
import { getErrorMessage } from '@/types/api';
import type { SectionItem } from '@/types/project';

const PHOTOSHOOT_MAX_IMAGES_PER_SECTION = 120;

export default function SectionItemsScreen() {
  const { id, sectionId } = useLocalSearchParams<{
    id: string;
    sectionId: string;
  }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { project, isLoading, error, refetch } = useProjectOnFocus(id);

  const section = project?.sections?.find((s) => s.id === sectionId);
  const sorted = sortedItems(section?.items);
  const [items, setItems] = useState<SectionItem[]>([]);
  const [reorderLoading, setReorderLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SectionItem | null>(null);

  useEffect(() => {
    setItems(sorted);
  }, [section?.items]);

  const isBook = project?.type === 'BOOK';
  const isPhotoshoot = project?.type === 'PHOTOSHOOT';
  const atPhotoLimit =
    isPhotoshoot && items.length >= PHOTOSHOOT_MAX_IMAGES_PER_SECTION;

  async function persistReorder(nextItems: SectionItem[]) {
    if (!id || !sectionId) return;
    setListError(null);
    setReorderLoading(true);
    try {
      await reorderSectionItemsApi(id, sectionId, idsInOrder(nextItems));
      setItems(nextItems);
      invalidateProjectsList();
      refetch();
    } catch (err) {
      setListError(getErrorMessage(err));
    } finally {
      setReorderLoading(false);
    }
  }

  async function handleDelete(item: SectionItem) {
    if (!id || !sectionId) return;
    setDeleteTarget(null);
    setDeleteLoading(true);
    setListError(null);
    try {
      await deleteSectionItemApi(id, sectionId, item.id);
      invalidateProjectsList();
      refetch();
    } catch (err) {
      setListError(getErrorMessage(err));
    } finally {
      setDeleteLoading(false);
    }
  }

  function handleMoveUp(index: number) {
    const next = moveItemUp(items, index);
    if (next) void persistReorder(next);
  }

  function handleMoveDown(index: number) {
    const next = moveItemDown(items, index);
    if (next) void persistReorder(next);
  }

  function handleAddItem() {
    if (!id || !sectionId) return;
    if (isBook) {
      router.push(
        `/project/${id}/sections/${sectionId}/items/create` as Href,
      );
    } else if (isPhotoshoot) {
      router.push(
        `/project/${id}/sections/${sectionId}/items/add-photo` as Href,
      );
    }
  }

  function renderItemPreview(item: SectionItem) {
    if (item.kind === 'TEXT') {
      return (
        <Text
          style={[styles.previewText, { color: colors.textSecondary }]}
          numberOfLines={3}
        >
          {item.textContent ?? 'Empty text item'}
        </Text>
      );
    }

    if (item.kind === 'IMAGE' && item.file?.url) {
      return (
        <Image
          source={{ uri: mediaUrl(item.file.url) }}
          style={styles.thumbnail}
          contentFit="cover"
        />
      );
    }

    return (
      <Text style={[styles.previewText, { color: colors.textSecondary }]}>
        {item.kind} item
      </Text>
    );
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
        ) : !section ? (
          <View style={styles.centered}>
            <EmptyState message="Section not found" />
          </View>
        ) : (
          <>
            <FlatList
              contentContainerStyle={[
                styles.list,
                { paddingBottom: insets.bottom + 80 },
              ]}
              data={items}
              keyExtractor={(item) => item.id}
              ListHeaderComponent={
                <View style={styles.header}>
                  <Text style={[styles.heading, { color: colors.text }]}>
                    Items
                  </Text>
                  <Text style={[styles.subheading, { color: colors.textSecondary }]}>
                    {section.label}
                  </Text>
                  {listError ? (
                    <Text style={[styles.error, { color: colors.error }]}>
                      {listError}
                    </Text>
                  ) : null}
                </View>
              }
              ListEmptyComponent={
                <EmptyState
                  message={
                    isBook
                      ? 'No text items yet.'
                      : 'No photos in this session yet.'
                  }
                />
              }
              renderItem={({ item, index }) => (
                <View
                  style={[
                    styles.row,
                    { borderColor: colors.border, backgroundColor: colors.surface },
                  ]}
                >
                  <Pressable
                    onPress={() =>
                      router.push(
                        `/project/${id}/sections/${sectionId}/items/${item.id}/edit` as Href,
                      )
                    }
                    style={styles.rowMain}
                  >
                    {item.label ? (
                      <Text style={[styles.rowLabel, { color: colors.text }]}>
                        {item.label}
                      </Text>
                    ) : (
                      <Text style={[styles.rowLabel, { color: colors.text }]}>
                        {item.kind === 'TEXT' ? 'Text block' : 'Photo'}{' '}
                        {index + 1}
                      </Text>
                    )}
                    {renderItemPreview(item)}
                  </Pressable>
                  <View style={styles.rowActions}>
                    <ReorderButtons
                      canMoveUp={index > 0}
                      canMoveDown={index < items.length - 1}
                      onMoveUp={() => handleMoveUp(index)}
                      onMoveDown={() => handleMoveDown(index)}
                      disabled={reorderLoading || deleteLoading}
                    />
                    <Pressable
                      disabled={deleteLoading || reorderLoading}
                      onPress={() => setDeleteTarget(item)}
                      style={styles.deleteButton}
                    >
                      <Text style={[styles.deleteText, { color: colors.error }]}>
                        Delete
                      </Text>
                    </Pressable>
                  </View>
                </View>
              )}
            />
            {(isBook || isPhotoshoot) && !atPhotoLimit ? (
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
                  onPress={handleAddItem}
                  style={[styles.addButton, { backgroundColor: colors.tint }]}
                >
                  <Text style={styles.addText}>
                    {isBook ? 'Add text item' : 'Add photo'}
                  </Text>
                </Pressable>
              </View>
            ) : null}
            {atPhotoLimit ? (
              <Text
                style={[
                  styles.limitNote,
                  { color: colors.textSecondary, paddingBottom: insets.bottom + 16 },
                ]}
              >
                Maximum {PHOTOSHOOT_MAX_IMAGES_PER_SECTION} photos per section.
              </Text>
            ) : null}
          </>
        )}

        <ConfirmDialog
          visible={Boolean(deleteTarget)}
          title="Delete item"
          message="This removes the item from the section."
          onDismiss={() => setDeleteTarget(null)}
          actions={[
            {
              label: 'Cancel',
              variant: 'cancel',
              onPress: () => setDeleteTarget(null),
            },
            {
              label: 'Delete',
              variant: 'destructive',
              onPress: () => {
                if (deleteTarget) void handleDelete(deleteTarget);
              },
            },
          ]}
        />
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
    gap: 6,
    marginBottom: 12,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
  },
  subheading: {
    fontSize: 14,
  },
  error: {
    fontSize: 14,
  },
  list: {
    padding: 16,
  },
  row: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    gap: 12,
    marginBottom: 10,
  },
  rowMain: {
    gap: 8,
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  previewText: {
    fontSize: 14,
    lineHeight: 20,
  },
  thumbnail: {
    width: '100%',
    height: 120,
    borderRadius: 8,
  },
  rowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  deleteButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  deleteText: {
    fontSize: 14,
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
  limitNote: {
    textAlign: 'center',
    fontSize: 13,
    paddingHorizontal: 16,
  },
});
