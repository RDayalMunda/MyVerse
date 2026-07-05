import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { updateBookApi, updatePhotoshootApi } from '@/api/projects.api';
import {
  ProjectBookFields,
  type ProjectBookFieldsValue,
} from '@/components/admin/project-book-fields';
import {
  ProjectPhotoshootFields,
  type ProjectPhotoshootFieldsValue,
} from '@/components/admin/project-photoshoot-fields';
import { ProjectAdminGate } from '@/components/admin/project-admin-gate';
import { SaveFormLayout } from '@/components/admin/save-form-layout';
import { EmptyState } from '@/components/projects/project-card';
import { useProjectOnFocus } from '@/hooks/use-project-on-focus';
import { useTheme } from '@/hooks/use-theme';
import { validateRequiredText } from '@/lib/form-validation';
import { invalidateProjectsList } from '@/stores/list-invalidation-store';
import { getErrorMessage } from '@/types/api';

export default function EditProjectScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const { project, isLoading, error, refetch } = useProjectOnFocus(id);

  const [bookFields, setBookFields] = useState<ProjectBookFieldsValue>({
    title: '',
    description: '',
    summary: '',
  });
  const [photoshootFields, setPhotoshootFields] =
    useState<ProjectPhotoshootFieldsValue>({
      title: '',
      description: '',
      theme: '',
      location: '',
    });
  const [initialized, setInitialized] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  useEffect(() => {
    if (!project || initialized) return;

    if (project.type === 'BOOK') {
      setBookFields({
        title: project.title,
        description: project.description ?? '',
        summary: project.bookDetails?.summary ?? '',
      });
    } else if (project.type === 'PHOTOSHOOT') {
      setPhotoshootFields({
        title: project.title,
        description: project.description ?? '',
        theme: project.photoshootDetails?.theme ?? '',
        location: project.photoshootDetails?.location ?? '',
      });
    }
    setInitialized(true);
  }, [project, initialized]);

  async function handleSave() {
    if (!project) return;
    setFormError(null);
    setSubmitAttempted(true);

    const title =
      project.type === 'BOOK' ? bookFields.title : photoshootFields.title;
    const titleError = validateRequiredText(title, 'Title');
    if (titleError) {
      setFormError(titleError);
      return;
    }

    setIsSaving(true);
    try {
      if (project.type === 'BOOK') {
        await updateBookApi(project.id, {
          title: bookFields.title.trim(),
          description: bookFields.description.trim() || undefined,
          summary: bookFields.summary.trim() || undefined,
        });
      } else if (project.type === 'PHOTOSHOOT') {
        await updatePhotoshootApi(project.id, {
          title: photoshootFields.title.trim(),
          description: photoshootFields.description.trim() || undefined,
          theme: photoshootFields.theme.trim() || undefined,
          location: photoshootFields.location.trim() || undefined,
        });
      }
      invalidateProjectsList();
      refetch();
      router.back();
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
      ) : project.type === 'SHOW' ? (
        <View style={[styles.centered, { backgroundColor: colors.background }]}>
          <EmptyState message="Show projects cannot be edited yet." />
        </View>
      ) : (
        <SaveFormLayout
          isSaving={isSaving}
          isReady={initialized}
          error={formError}
          onSave={() => void handleSave()}
        >
          {project.type === 'BOOK' ? (
            <ProjectBookFields
              value={bookFields}
              onChange={setBookFields}
              showValidation={submitAttempted}
              editable={!isSaving}
            />
          ) : (
            <ProjectPhotoshootFields
              value={photoshootFields}
              onChange={setPhotoshootFields}
              showValidation={submitAttempted}
              editable={!isSaving}
            />
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
});
