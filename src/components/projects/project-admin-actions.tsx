import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import {
  deleteProjectApi,
  permanentDeleteProjectApi,
  unpublishProjectApi,
} from '@/api/projects.api';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useTheme } from '@/hooks/use-theme';
import { invalidateProjectsList } from '@/stores/list-invalidation-store';
import { getErrorMessage } from '@/types/api';
import type { ProjectDetail } from '@/types/project';

type DialogKind = 'unpublish' | 'delete' | 'permanentDelete' | 'error';

type ProjectAdminActionsProps = {
  project: ProjectDetail;
  onUnpublished: () => void;
};

export function ProjectAdminActions({
  project,
  onUnpublished,
}: ProjectAdminActionsProps) {
  const router = useRouter();
  const { colors } = useTheme();
  const [actionLoading, setActionLoading] = useState(false);
  const [dialog, setDialog] = useState<DialogKind | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canUnpublish = project.status === 'PUBLISHED';
  const canDelete = project.status !== 'DELETED';

  if (!canUnpublish && !canDelete) {
    return null;
  }

  function closeDialog() {
    setDialog(null);
  }

  function showError(err: unknown) {
    setErrorMessage(getErrorMessage(err));
    setDialog('error');
  }

  async function handleUnpublish() {
    closeDialog();
    setActionLoading(true);
    try {
      await unpublishProjectApi(project.id);
      invalidateProjectsList();
      onUnpublished();
    } catch (err) {
      showError(err);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleSoftDelete() {
    closeDialog();
    setActionLoading(true);
    try {
      await deleteProjectApi(project.id);
      invalidateProjectsList();
      router.back();
    } catch (err) {
      showError(err);
    } finally {
      setActionLoading(false);
    }
  }

  async function handlePermanentDelete() {
    closeDialog();
    setActionLoading(true);
    try {
      await permanentDeleteProjectApi(project.id);
      invalidateProjectsList();
      router.back();
    } catch (err) {
      showError(err);
    } finally {
      setActionLoading(false);
    }
  }

  function openPermanentDeleteDialog() {
    closeDialog();
    setDialog('permanentDelete');
  }

  return (
    <>
      <View style={styles.actions}>
        {canUnpublish ? (
          <Pressable
            disabled={actionLoading}
            onPress={() => setDialog('unpublish')}
            style={[
              styles.actionButton,
              { borderColor: colors.error, borderWidth: 1 },
            ]}
          >
            {actionLoading ? (
              <ActivityIndicator color={colors.error} />
            ) : (
              <Text style={[styles.actionText, { color: colors.error }]}>
                Unpublish project
              </Text>
            )}
          </Pressable>
        ) : null}

        {canDelete ? (
          <Pressable
            disabled={actionLoading}
            onPress={() => setDialog('delete')}
            style={[
              styles.actionButton,
              { borderColor: colors.error, borderWidth: 1 },
            ]}
          >
            {actionLoading ? (
              <ActivityIndicator color={colors.error} />
            ) : (
              <Text style={[styles.actionText, { color: colors.error }]}>
                Delete project
              </Text>
            )}
          </Pressable>
        ) : null}
      </View>

      <ConfirmDialog
        visible={dialog === 'unpublish'}
        title="Unpublish project"
        message="This will hide the project from the public catalog. Sections keep their statuses and you can publish again later."
        onDismiss={closeDialog}
        actions={[
          { label: 'Cancel', variant: 'cancel', onPress: closeDialog },
          {
            label: 'Unpublish',
            variant: 'destructive',
            onPress: () => void handleUnpublish(),
          },
        ]}
      />

      <ConfirmDialog
        visible={dialog === 'delete'}
        title="Delete project"
        message="Soft delete hides the project from lists but keeps sections, items, and media. You can permanently remove everything instead."
        onDismiss={closeDialog}
        actions={[
          { label: 'Cancel', variant: 'cancel', onPress: closeDialog },
          {
            label: 'Delete',
            variant: 'default',
            onPress: () => void handleSoftDelete(),
          },
          {
            label: 'Delete permanently',
            variant: 'destructive',
            onPress: openPermanentDeleteDialog,
          },
        ]}
      />

      <ConfirmDialog
        visible={dialog === 'permanentDelete'}
        title="Delete permanently"
        message="This cannot be undone. The project, all sections, section items, and unreferenced media will be removed."
        onDismiss={closeDialog}
        actions={[
          { label: 'Cancel', variant: 'cancel', onPress: closeDialog },
          {
            label: 'Delete permanently',
            variant: 'destructive',
            onPress: () => void handlePermanentDelete(),
          },
        ]}
      />

      <ConfirmDialog
        visible={dialog === 'error'}
        title="Error"
        message={errorMessage ?? 'Something went wrong'}
        onDismiss={closeDialog}
        actions={[{ label: 'OK', variant: 'default', onPress: closeDialog }]}
      />
    </>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: 10,
  },
  actionButton: {
    alignItems: 'center',
    borderRadius: 10,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  actionText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
