import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { createTextItemApi } from '@/api/section-items.api';
import { ProjectAdminGate } from '@/components/admin/project-admin-gate';
import { SaveFormLayout } from '@/components/admin/save-form-layout';
import {
  TextItemFields,
  type TextItemFieldsValue,
} from '@/components/admin/text-item-fields';
import { validateRequiredText } from '@/lib/form-validation';
import { invalidateProjectsList } from '@/stores/list-invalidation-store';
import { getErrorMessage } from '@/types/api';

export default function CreateTextItemScreen() {
  const { id, sectionId } = useLocalSearchParams<{
    id: string;
    sectionId: string;
  }>();
  const router = useRouter();
  const [fields, setFields] = useState<TextItemFieldsValue>({
    textContent: '',
    label: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  async function handleSave() {
    if (!id || !sectionId) return;
    setFormError(null);
    setSubmitAttempted(true);

    const contentError = validateRequiredText(fields.textContent, 'Text content');
    if (contentError) {
      setFormError(contentError);
      return;
    }

    setIsSaving(true);
    try {
      await createTextItemApi(id, sectionId, {
        textContent: fields.textContent.trim(),
        label: fields.label.trim() || undefined,
      });
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
        saveLabel="Add text item"
        isSaving={isSaving}
        error={formError}
        onSave={() => void handleSave()}
      >
        <TextItemFields
          value={fields}
          onChange={setFields}
          showValidation={submitAttempted}
          editable={!isSaving}
        />
      </SaveFormLayout>
    </ProjectAdminGate>
  );
}
