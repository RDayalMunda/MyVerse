import { useState } from 'react';
import { TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { uploadProjectImage } from '@/api/media.api';
import { createImageItemApi } from '@/api/section-items.api';
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
import { useTheme } from '@/hooks/use-theme';
import { invalidateProjectsList } from '@/stores/list-invalidation-store';
import { getErrorMessage } from '@/types/api';

export default function AddPhotoItemScreen() {
  const { id, sectionId } = useLocalSearchParams<{
    id: string;
    sectionId: string;
  }>();
  const router = useRouter();
  const { colors } = useTheme();
  const [photos, setPhotos] = useState<LocalPhoto[]>([]);
  const [label, setLabel] = useState('');
  const [pickerError, setPickerError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  async function handleSave() {
    if (!id || !sectionId) return;
    setFormError(null);
    setSubmitAttempted(true);

    if (photos.length === 0) {
      setFormError('Choose at least one photo');
      return;
    }

    setIsSaving(true);
    try {
      for (const photo of photos) {
        const fileMeta = await uploadProjectImage(photo);
        await createImageItemApi(id, sectionId, {
          file: fileMeta,
          label: label.trim() || undefined,
        });
      }
      invalidateProjectsList();
      router.back();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <ProjectAdminGate>
      <SaveFormLayout
        saveLabel="Upload photos"
        isSaving={isSaving}
        error={formError ?? (pickerError || null)}
        onSave={() => void handleSave()}
      >
        <AdminFormField label="Label" hint="Optional. Applied to each photo added here.">
          <TextInput
            style={[adminFormStyles.input, adminInputStyle(colors)]}
            value={label}
            onChangeText={setLabel}
            placeholder="Optional label"
            placeholderTextColor={colors.textSecondary}
            editable={!isSaving}
          />
        </AdminFormField>
        <PhotoshootItemPicker
          photos={photos}
          onChange={setPhotos}
          onError={setPickerError}
          disabled={isSaving}
        />
        {submitAttempted && photos.length === 0 && !formError ? (
          <AdminFormField label="" error="At least one photo is required">
            <></>
          </AdminFormField>
        ) : null}
      </SaveFormLayout>
    </ProjectAdminGate>
  );
}
