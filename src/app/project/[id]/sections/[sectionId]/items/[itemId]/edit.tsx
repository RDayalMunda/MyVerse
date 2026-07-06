import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { uploadProjectImage } from '@/api/media.api';
import { updateSectionItemApi } from '@/api/section-items.api';
import {
  AdminFormField,
  adminFormStyles,
  adminInputStyle,
} from '@/components/admin/admin-form-field';
import {
  PhotoshootItemPicker,
  type LocalPhoto,
} from '@/components/admin/photoshoot-item-picker';
import { ProjectAdminGate } from '@/components/admin/project-admin-gate';
import { SaveFormLayout } from '@/components/admin/save-form-layout';
import {
  TextItemFields,
  type TextItemFieldsValue,
} from '@/components/admin/text-item-fields';
import { EmptyState } from '@/components/projects/project-card';
import { useProjectOnFocus } from '@/hooks/use-project-on-focus';
import { useTheme } from '@/hooks/use-theme';
import { validateRequiredText } from '@/lib/form-validation';
import { runSaveAction, SaveFeedbackPattern } from '@/lib/save-feedback';
import { mediaUrl } from '@/lib/media-url';
import { invalidateProjectsList } from '@/stores/list-invalidation-store';
import { getErrorMessage } from '@/types/api';

export default function EditSectionItemScreen() {
  const { id, sectionId, itemId } = useLocalSearchParams<{
    id: string;
    sectionId: string;
    itemId: string;
  }>();
  const router = useRouter();
  const { colors } = useTheme();
  const { project, isLoading, error, refetch } = useProjectOnFocus(id);

  const section = project?.sections?.find((s) => s.id === sectionId);
  const item = section?.items?.find((i) => i.id === itemId);

  const [textFields, setTextFields] = useState<TextItemFieldsValue>({
    textContent: '',
    label: '',
  });
  const [imageLabel, setImageLabel] = useState('');
  const [replacementPhotos, setReplacementPhotos] = useState<LocalPhoto[]>([]);
  const [pickerError, setPickerError] = useState('');
  const [initialized, setInitialized] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  useEffect(() => {
    if (!item || initialized) return;
    if (item.kind === 'TEXT') {
      setTextFields({
        textContent: item.textContent ?? '',
        label: item.label ?? '',
      });
    } else if (item.kind === 'IMAGE') {
      setImageLabel(item.label ?? '');
    }
    setInitialized(true);
  }, [item, initialized]);

  async function handleSave() {
    if (!id || !sectionId || !itemId || !item) return;
    setFormError(null);
    setSubmitAttempted(true);

    setIsSaving(true);
    try {
      if (item.kind === 'TEXT') {
        const contentError = validateRequiredText(
          textFields.textContent,
          'Text content',
        );
        if (contentError) {
          setFormError(contentError);
          setIsSaving(false);
          return;
        }
      }

      // SaveFeedbackPattern.NavigateBack — see docs/UX.md
      await runSaveAction({
        pattern: SaveFeedbackPattern.NavigateBack,
        successMessage: 'Item saved',
        action: async () => {
          if (item.kind === 'TEXT') {
            await updateSectionItemApi(id, sectionId, itemId, {
              textContent: textFields.textContent.trim(),
              label: textFields.label.trim() || undefined,
            });
          } else if (item.kind === 'IMAGE') {
            const body: {
              label?: string;
              file?: Awaited<ReturnType<typeof uploadProjectImage>>;
            } = {
              label: imageLabel.trim() || undefined,
            };
            if (replacementPhotos.length > 0) {
              body.file = await uploadProjectImage(replacementPhotos[0]);
            }
            await updateSectionItemApi(id, sectionId, itemId, body);
          }
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
      ) : !item ? (
        <View style={[styles.centered, { backgroundColor: colors.background }]}>
          <EmptyState message="Item not found" />
        </View>
      ) : item.kind === 'VIDEO' ? (
        <View style={[styles.centered, { backgroundColor: colors.background }]}>
          <EmptyState message="Video items cannot be edited yet." />
        </View>
      ) : (
        <SaveFormLayout
          isSaving={isSaving}
          isReady={initialized}
          error={formError ?? (pickerError || null)}
          onSave={() => void handleSave()}
        >
          {item.kind === 'TEXT' ? (
            <TextItemFields
              value={textFields}
              onChange={setTextFields}
              showValidation={submitAttempted}
              editable={!isSaving}
            />
          ) : (
            <>
              {item.file?.url ? (
                <AdminFormField label="Current photo">
                  <Image
                    source={{ uri: mediaUrl(item.file.url) }}
                    style={styles.currentPhoto}
                    contentFit="cover"
                  />
                </AdminFormField>
              ) : null}
              <AdminFormField label="Label" hint="Optional photo label.">
                <TextInput
                  style={[adminFormStyles.input, adminInputStyle(colors)]}
                  value={imageLabel}
                  onChangeText={setImageLabel}
                  placeholder="Optional label"
                  placeholderTextColor={colors.textSecondary}
                  editable={!isSaving}
                />
              </AdminFormField>
              <AdminFormField
                label="Replace photo"
                hint="Optional. Pick a new image to replace the current one."
              >
                <PhotoshootItemPicker
                  photos={replacementPhotos}
                  onChange={setReplacementPhotos}
                  onError={setPickerError}
                  disabled={isSaving}
                  multiple={false}
                />
              </AdminFormField>
            </>
          )}
        </SaveFormLayout>
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
  currentPhoto: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
});
