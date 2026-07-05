import { useState } from 'react';
import { type Href, useLocalSearchParams, useRouter } from 'expo-router';

import { createSectionApi } from '@/api/sections.api';
import { ProjectAdminGate } from '@/components/admin/project-admin-gate';
import { SaveFormLayout } from '@/components/admin/save-form-layout';
import {
  SectionFields,
  type SectionFieldsValue,
} from '@/components/admin/section-fields';
import { validateRequiredText } from '@/lib/form-validation';
import { invalidateProjectsList } from '@/stores/list-invalidation-store';
import { getErrorMessage } from '@/types/api';

export default function CreateSectionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [fields, setFields] = useState<SectionFieldsValue>({
    label: '',
    description: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  async function handleSave() {
    if (!id) return;
    setFormError(null);
    setSubmitAttempted(true);

    const labelError = validateRequiredText(fields.label, 'Section label');
    if (labelError) {
      setFormError(labelError);
      return;
    }

    setIsSaving(true);
    try {
      const section = await createSectionApi(id, {
        label: fields.label.trim(),
        description: fields.description.trim() || undefined,
      });
      invalidateProjectsList();
      router.replace(`/project/${id}/sections/${section.id}/edit` as Href);
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <ProjectAdminGate>
      <SaveFormLayout
        saveLabel="Create section"
        isSaving={isSaving}
        error={formError}
        onSave={() => void handleSave()}
      >
        <SectionFields
          value={fields}
          onChange={setFields}
          showValidation={submitAttempted}
          editable={!isSaving}
          descriptionHint="Optional session or chapter description."
        />
      </SaveFormLayout>
    </ProjectAdminGate>
  );
}
