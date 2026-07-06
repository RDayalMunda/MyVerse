import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { type Href, useLocalSearchParams, useRouter } from 'expo-router';

import {
  deleteSectionApi,
  publishSectionApi,
  unpublishSectionApi,
  updateSectionApi,
} from '@/api/sections.api';
import { ProjectAdminGate } from '@/components/admin/project-admin-gate';
import { SaveFormLayout } from '@/components/admin/save-form-layout';
import {
  SectionFields,
  type SectionFieldsValue,
} from '@/components/admin/section-fields';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { EmptyState } from '@/components/projects/project-card';
import { useProjectOnFocus } from '@/hooks/use-project-on-focus';
import { useTheme } from '@/hooks/use-theme';
import { validateRequiredText } from '@/lib/form-validation';
import { runSaveAction, SaveFeedbackPattern } from '@/lib/save-feedback';
import { invalidateProjectsList } from '@/stores/list-invalidation-store';
import { getErrorMessage } from '@/types/api';

export default function EditSectionScreen() {
  const { id, sectionId } = useLocalSearchParams<{
    id: string;
    sectionId: string;
  }>();
  const router = useRouter();
  const { colors } = useTheme();
  const { project, isLoading, error, refetch } = useProjectOnFocus(id);

  const section = project?.sections?.find((s) => s.id === sectionId);

  const [fields, setFields] = useState<SectionFieldsValue>({
    label: '',
    description: '',
  });
  const [initialized, setInitialized] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [dialog, setDialog] = useState<'delete' | 'error' | null>(null);
  const [dialogMessage, setDialogMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!section || initialized) return;
    setFields({
      label: section.label,
      description: section.description ?? '',
    });
    setInitialized(true);
  }, [section, initialized]);

  async function handleSave() {
    if (!id || !sectionId) return;
    setFormError(null);
    setSubmitAttempted(true);

    const labelError = validateRequiredText(fields.label, 'Section label');
    if (labelError) {
      setFormError(labelError);
      return;
    }

    setIsSaving(true);
    try {
      // SaveFeedbackPattern.NavigateBack — see docs/UX.md
      await runSaveAction({
        pattern: SaveFeedbackPattern.NavigateBack,
        successMessage: 'Section updated',
        action: async () => {
          await updateSectionApi(id, sectionId, {
            label: fields.label.trim(),
            description: fields.description.trim() || undefined,
          });
          invalidateProjectsList();
          refetch();
        },
        onSuccess: () => {
          router.back();
        },
      });
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  }

  async function handlePublishToggle() {
    if (!id || !sectionId || !section) return;
    setActionLoading(true);
    setFormError(null);
    const isPublished = section.status === 'PUBLISHED';
    try {
      // SaveFeedbackPattern.StayOnPage — see docs/UX.md
      await runSaveAction({
        pattern: SaveFeedbackPattern.StayOnPage,
        successMessage: isPublished ? 'Section unpublished' : 'Section published',
        action: async () => {
          if (isPublished) {
            await unpublishSectionApi(id, sectionId);
          } else {
            await publishSectionApi(id, sectionId);
          }
          invalidateProjectsList();
          refetch();
        },
      });
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDelete() {
    if (!id || !sectionId) return;
    setDialog(null);
    setActionLoading(true);
    try {
      await deleteSectionApi(id, sectionId);
      invalidateProjectsList();
      router.replace(`/project/${id}/sections` as Href);
    } catch (err) {
      setDialogMessage(getErrorMessage(err));
      setDialog('error');
    } finally {
      setActionLoading(false);
    }
  }

  const canPublish = section?.status !== 'PUBLISHED';
  const canUnpublish = section?.status === 'PUBLISHED';

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
      ) : !section ? (
        <View style={[styles.centered, { backgroundColor: colors.background }]}>
          <EmptyState message="Section not found" />
        </View>
      ) : (
        <>
          <SaveFormLayout
            isSaving={isSaving || actionLoading}
            isReady={initialized}
            error={formError}
            onSave={() => void handleSave()}
          >
            <SectionFields
              value={fields}
              onChange={setFields}
              showValidation={submitAttempted}
              editable={!isSaving && !actionLoading}
            />

            <View style={styles.actions}>
              <Pressable
                disabled={actionLoading || isSaving}
                onPress={() =>
                  router.push(
                    `/project/${id}/sections/${sectionId}/items` as Href,
                  )
                }
                style={[styles.actionButton, { backgroundColor: colors.tint }]}
              >
                <Text style={styles.actionText}>Manage items</Text>
              </Pressable>

              {canPublish ? (
                <Pressable
                  disabled={actionLoading || isSaving}
                  onPress={() => void handlePublishToggle()}
                  style={[
                    styles.actionButton,
                    { borderColor: colors.border, borderWidth: 1 },
                  ]}
                >
                  <Text style={[styles.outlineText, { color: colors.text }]}>
                    Publish section
                  </Text>
                </Pressable>
              ) : null}

              {canUnpublish ? (
                <Pressable
                  disabled={actionLoading || isSaving}
                  onPress={() => void handlePublishToggle()}
                  style={[
                    styles.actionButton,
                    { borderColor: colors.error, borderWidth: 1 },
                  ]}
                >
                  <Text style={[styles.outlineText, { color: colors.error }]}>
                    Unpublish section
                  </Text>
                </Pressable>
              ) : null}

              <Pressable
                disabled={actionLoading || isSaving}
                onPress={() => setDialog('delete')}
                style={[
                  styles.actionButton,
                  { borderColor: colors.error, borderWidth: 1 },
                ]}
              >
                <Text style={[styles.outlineText, { color: colors.error }]}>
                  Delete section
                </Text>
              </Pressable>
            </View>
          </SaveFormLayout>

          <ConfirmDialog
            visible={dialog === 'delete'}
            title="Delete section"
            message="This deletes the section and all items inside it. This cannot be undone."
            onDismiss={() => setDialog(null)}
            actions={[
              { label: 'Cancel', variant: 'cancel', onPress: () => setDialog(null) },
              {
                label: 'Delete',
                variant: 'destructive',
                onPress: () => void handleDelete(),
              },
            ]}
          />

          <ConfirmDialog
            visible={dialog === 'error'}
            title="Error"
            message={dialogMessage ?? 'Something went wrong'}
            onDismiss={() => setDialog(null)}
            actions={[
              { label: 'OK', variant: 'default', onPress: () => setDialog(null) },
            ]}
          />
        </>
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
  actions: {
    gap: 10,
    marginTop: 8,
  },
  actionButton: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  outlineText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
