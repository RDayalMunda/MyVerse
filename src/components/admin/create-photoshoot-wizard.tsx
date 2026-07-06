import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { type Href, useRouter } from 'expo-router';

import {
  uploadProjectImage,
  type PickedImage,
} from '@/api/media.api';
import { createImageItemApi } from '@/api/section-items.api';
import { createSectionApi, publishSectionApi } from '@/api/sections.api';
import { createPhotoshootApi, publishProjectApi } from '@/api/projects.api';
import {
  DEFAULT_PROJECT_ACCESS,
  ProjectAccessFields,
  type ProjectAccessFieldsValue,
} from '@/components/admin/project-access-fields';
import { useTheme } from '@/hooks/use-theme';
import { FIELD_HINTS, validateRequiredText } from '@/lib/form-validation';
import { invalidateProjectsList } from '@/stores/list-invalidation-store';
import { getErrorMessage } from '@/types/api';

type WizardStep = 1 | 2 | 3 | 4;

const STEP_LABELS = ['Photoshoot', 'Section', 'Photos', 'Publish'];

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 10 * 1024 * 1024;

type LocalPhoto = PickedImage & {
  id: string;
  uploaded?: boolean;
};

function guessMimeType(uri: string): string {
  const lower = uri.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  return 'image/jpeg';
}

function guessFileName(uri: string, index: number): string {
  const parts = uri.split('/');
  const last = parts[parts.length - 1] ?? `photo-${index + 1}.jpg`;
  return last.includes('.') ? last : `photo-${index + 1}.jpg`;
}

export function CreatePhotoshootWizard() {
  const router = useRouter();
  const { colors } = useTheme();

  const [step, setStep] = useState<WizardStep>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [projectId, setProjectId] = useState<string | null>(null);
  const [sectionId, setSectionId] = useState<string | null>(null);
  const [photoCount, setPhotoCount] = useState(0);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [theme, setTheme] = useState('');
  const [location, setLocation] = useState('');
  const [sectionLabel, setSectionLabel] = useState('');
  const [sectionDescription, setSectionDescription] = useState('');
  const [photos, setPhotos] = useState<LocalPhoto[]>([]);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [accessFields, setAccessFields] =
    useState<ProjectAccessFieldsValue>(DEFAULT_PROJECT_ACCESS);

  function canProceed(): boolean {
    switch (step) {
      case 1:
        return title.trim().length > 0;
      case 2:
        return sectionLabel.trim().length > 0;
      case 3:
        return photos.length > 0;
      case 4:
        return Boolean(projectId && sectionId && photoCount > 0);
      default:
        return false;
    }
  }

  async function handlePickPhotos() {
    setError(null);

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError('Photo library permission is required');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.9,
    });

    if (result.canceled || result.assets.length === 0) {
      return;
    }

    const nextPhotos: LocalPhoto[] = [];

    for (let index = 0; index < result.assets.length; index++) {
      const asset = result.assets[index];
      const mimeType = asset.mimeType ?? guessMimeType(asset.uri);

      if (!ALLOWED_TYPES.includes(mimeType)) {
        setError('Use JPEG, PNG, or WebP for all photos');
        return;
      }

      if (asset.fileSize && asset.fileSize > MAX_BYTES) {
        setError('Each image must be 10 MB or smaller');
        return;
      }

      nextPhotos.push({
        id: `${Date.now()}-${index}`,
        uri: asset.uri,
        name: asset.fileName ?? guessFileName(asset.uri, photos.length + index),
        type: mimeType,
        file: Platform.OS === 'web' ? (asset.file as File | undefined) : undefined,
      });
    }

    setPhotos((current) => [...current, ...nextPhotos]);
  }

  function removePhoto(id: string) {
    setPhotos((current) => {
      const photo = current.find((entry) => entry.id === id);
      if (photo?.uploaded) {
        return current;
      }
      return current.filter((entry) => entry.id !== id);
    });
  }

  async function handleNext() {
    setError(null);
    setSubmitAttempted(true);

    if (step === 1) {
      const titleError = validateRequiredText(title, 'Title');
      if (titleError) {
        setError(titleError);
        return;
      }
      setIsLoading(true);
      try {
        const project = await createPhotoshootApi({
          title: title.trim(),
          description: description.trim() || undefined,
          theme: theme.trim() || undefined,
          location: location.trim() || undefined,
          visibility: accessFields.visibility,
          isAdult: accessFields.isAdult,
        });
        setProjectId(project.id);
        setStep(2);
        setSubmitAttempted(false);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (step === 2 && projectId) {
      const labelError = validateRequiredText(sectionLabel, 'Section label');
      if (labelError) {
        setError(labelError);
        return;
      }
      setIsLoading(true);
      try {
        const section = await createSectionApi(projectId, {
          label: sectionLabel.trim(),
          description: sectionDescription.trim() || undefined,
        });
        setSectionId(section.id);
        setStep(3);
        setSubmitAttempted(false);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (step === 3 && projectId && sectionId) {
      if (photos.length === 0) {
        setError('Add at least one photo');
        return;
      }

      const pendingPhotos = photos.filter((photo) => !photo.uploaded);

      if (pendingPhotos.length === 0) {
        setPhotoCount(photos.length);
        setStep(4);
        setSubmitAttempted(false);
        return;
      }

      setIsLoading(true);
      try {
        for (const photo of pendingPhotos) {
          const fileMeta = await uploadProjectImage(photo);
          await createImageItemApi(projectId, sectionId, { file: fileMeta });
        }
        const uploadedIds = new Set(pendingPhotos.map((photo) => photo.id));
        setPhotos((current) =>
          current.map((photo) =>
            uploadedIds.has(photo.id) ? { ...photo, uploaded: true } : photo,
          ),
        );
        setPhotoCount(photos.length);
        setStep(4);
        setSubmitAttempted(false);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (step === 4 && projectId && sectionId) {
      setIsLoading(true);
      try {
        await publishSectionApi(projectId, sectionId);
        await publishProjectApi(projectId);
        invalidateProjectsList();
        // SaveFeedbackPattern.NavigateReplace — landing on project detail is feedback; see docs/UX.md
        router.replace(`/project/${projectId}` as Href);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    }
  }

  function handleBack() {
    setError(null);
    setSubmitAttempted(false);
    if (step > 1) {
      setStep((s) => (s - 1) as WizardStep);
    }
  }

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.progress}>
        {STEP_LABELS.map((label, index) => {
          const stepNum = (index + 1) as WizardStep;
          const isActive = step === stepNum;
          const isDone = step > stepNum;
          return (
            <View key={label} style={styles.progressItem}>
              <View
                style={[
                  styles.progressDot,
                  {
                    backgroundColor: isDone || isActive ? colors.tint : colors.border,
                  },
                ]}
              >
                <Text style={styles.progressDotText}>{stepNum}</Text>
              </View>
              <Text
                style={[
                  styles.progressLabel,
                  { color: isActive ? colors.text : colors.textSecondary },
                ]}
              >
                {label}
              </Text>
            </View>
          );
        })}
      </View>

      {error ? (
        <View style={[styles.errorBanner, { backgroundColor: colors.errorBackground }]}>
          <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
        </View>
      ) : null}

      {step === 1 ? (
        <View style={styles.step}>
          <Text style={[styles.stepTitle, { color: colors.text }]}>
            Photoshoot details
          </Text>
          <Field label="Title *" hint={FIELD_HINTS.bookTitle} colors={colors}>
            <TextInput
              style={[
                styles.input,
                inputStyle(colors, submitAttempted && !title.trim()),
              ]}
              value={title}
              onChangeText={setTitle}
              placeholder="Coastal Fashion Shoot"
              placeholderTextColor={colors.textSecondary}
              editable={!isLoading}
            />
            {submitAttempted && !title.trim() ? (
              <Text style={[styles.fieldError, { color: colors.error }]}>
                Title is required
              </Text>
            ) : null}
          </Field>
          <Field label="Description" hint="Optional. Short blurb for the catalog." colors={colors}>
            <TextInput
              style={[styles.input, styles.multiline, inputStyle(colors)]}
              value={description}
              onChangeText={setDescription}
              placeholder="Short blurb for the catalog"
              placeholderTextColor={colors.textSecondary}
              multiline
              editable={!isLoading}
            />
          </Field>
          <Field label="Theme" hint="Optional. e.g. Golden hour, Editorial." colors={colors}>
            <TextInput
              style={[styles.input, inputStyle(colors)]}
              value={theme}
              onChangeText={setTheme}
              placeholder="Golden hour"
              placeholderTextColor={colors.textSecondary}
              editable={!isLoading}
            />
          </Field>
          <Field label="Location" hint="Optional. Where the shoot took place." colors={colors}>
            <TextInput
              style={[styles.input, inputStyle(colors)]}
              value={location}
              onChangeText={setLocation}
              placeholder="Malibu Pier"
              placeholderTextColor={colors.textSecondary}
              editable={!isLoading}
            />
          </Field>
          <ProjectAccessFields value={accessFields} onChange={setAccessFields} />
        </View>
      ) : null}

      {step === 2 ? (
        <View style={styles.step}>
          <Text style={[styles.stepTitle, { color: colors.text }]}>First session</Text>
          <Field label="Label *" hint={FIELD_HINTS.sectionLabel} colors={colors}>
            <TextInput
              style={[
                styles.input,
                inputStyle(colors, submitAttempted && !sectionLabel.trim()),
              ]}
              value={sectionLabel}
              onChangeText={setSectionLabel}
              placeholder="Session 1"
              placeholderTextColor={colors.textSecondary}
              editable={!isLoading}
            />
            {submitAttempted && !sectionLabel.trim() ? (
              <Text style={[styles.fieldError, { color: colors.error }]}>
                Section label is required
              </Text>
            ) : null}
          </Field>
          <Field label="Description" hint="Optional session description." colors={colors}>
            <TextInput
              style={[styles.input, styles.multiline, inputStyle(colors)]}
              value={sectionDescription}
              onChangeText={setSectionDescription}
              placeholder="Golden hour set"
              placeholderTextColor={colors.textSecondary}
              multiline
              editable={!isLoading}
            />
          </Field>
        </View>
      ) : null}

      {step === 3 ? (
        <View style={styles.step}>
          <Text style={[styles.stepTitle, { color: colors.text }]}>Photos</Text>
          <Text style={[styles.stepHint, { color: colors.textSecondary }]}>
            Add one or more photos. Each photo becomes its own gallery item.
          </Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add photos"
            disabled={isLoading}
            onPress={() => void handlePickPhotos()}
            style={({ pressed }) => [
              styles.addPhotosButton,
              {
                borderColor: colors.border,
                backgroundColor: colors.surface,
                opacity: pressed || isLoading ? 0.85 : 1,
              },
            ]}
          >
            <Ionicons name="images-outline" size={22} color={colors.tint} />
            <Text style={[styles.addPhotosText, { color: colors.text }]}>
              {photos.length > 0 ? 'Add more photos' : 'Choose photos'}
            </Text>
          </Pressable>

          {submitAttempted && photos.length === 0 ? (
            <Text style={[styles.fieldError, { color: colors.error }]}>
              At least one photo is required
            </Text>
          ) : null}

          <View style={styles.photoGrid}>
            {photos.map((photo, index) => (
              <View
                key={photo.id}
                style={[styles.photoTile, { borderColor: colors.border }]}
              >
                <Image source={{ uri: photo.uri }} style={styles.photoPreview} contentFit="cover" />
                <Text style={[styles.photoIndex, { color: colors.textSecondary }]}>
                  Photo {index + 1}
                  {photo.uploaded ? ' · Uploaded' : ''}
                </Text>
                {photo.uploaded ? null : (
                  <Pressable onPress={() => removePhoto(photo.id)} disabled={isLoading}>
                    <Text style={[styles.removePhoto, { color: colors.error }]}>
                      Remove
                    </Text>
                  </Pressable>
                )}
              </View>
            ))}
          </View>

          {isLoading ? (
            <Text style={[styles.uploadStatus, { color: colors.textSecondary }]}>
              Uploading photos and creating gallery items…
            </Text>
          ) : null}
        </View>
      ) : null}

      {step === 4 ? (
        <View style={styles.step}>
          <Text style={[styles.stepTitle, { color: colors.text }]}>Ready to publish</Text>
          <View style={[styles.review, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.reviewTitle, { color: colors.text }]}>{title}</Text>
            <Text style={[styles.reviewMeta, { color: colors.textSecondary }]}>
              Section: {sectionLabel}
            </Text>
            <Text style={[styles.reviewMeta, { color: colors.textSecondary }]}>
              Photos: {photoCount}
            </Text>
            {theme ? (
              <Text style={[styles.reviewMeta, { color: colors.textSecondary }]}>
                Theme: {theme}
              </Text>
            ) : null}
            {location ? (
              <Text style={[styles.reviewMeta, { color: colors.textSecondary }]}>
                Location: {location}
              </Text>
            ) : null}
          </View>
          <Text style={[styles.publishNote, { color: colors.textSecondary }]}>
            Publishing the section first, then the project. After publish, you will see the
            gallery viewer.
          </Text>
        </View>
      ) : null}

      <View style={styles.actions}>
        {step > 1 ? (
          <Pressable
            style={({ pressed }) => [
              styles.secondaryButton,
              { borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={handleBack}
            disabled={isLoading}
          >
            <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Back</Text>
          </Pressable>
        ) : (
          <View style={styles.buttonSpacer} />
        )}
        <Pressable
          style={({ pressed }) => [
            styles.primaryButton,
            {
              backgroundColor: colors.tint,
              opacity: pressed || isLoading || !canProceed() ? 0.6 : 1,
            },
          ]}
          onPress={() => void handleNext()}
          disabled={isLoading || !canProceed()}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryButtonText}>
              {step === 4 ? 'Publish' : step === 3 ? 'Upload & continue' : 'Next'}
            </Text>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}

function Field({
  label,
  hint,
  colors,
  children,
}: {
  label: string;
  hint?: string;
  colors: ReturnType<typeof useTheme>['colors'];
  children: ReactNode;
}) {
  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      {children}
      {hint ? (
        <Text style={[styles.hint, { color: colors.textSecondary }]}>{hint}</Text>
      ) : null}
    </View>
  );
}

function inputStyle(
  colors: ReturnType<typeof useTheme>['colors'],
  hasError = false,
) {
  return {
    color: colors.text,
    borderColor: hasError ? colors.error : colors.border,
    backgroundColor: colors.background,
  };
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 20,
    maxWidth: 560,
    width: '100%',
    alignSelf: 'center',
  },
  progress: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressItem: {
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  progressDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressDotText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  errorBanner: {
    borderRadius: 10,
    padding: 12,
  },
  errorText: {
    fontSize: 14,
    fontWeight: '500',
  },
  step: {
    gap: 16,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  stepHint: {
    fontSize: 14,
    lineHeight: 20,
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  hint: {
    fontSize: 12,
    lineHeight: 17,
  },
  fieldError: {
    fontSize: 13,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  addPhotosButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 14,
  },
  addPhotosText: {
    fontSize: 16,
    fontWeight: '600',
  },
  photoGrid: {
    gap: 12,
  },
  photoTile: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  photoPreview: {
    width: '100%',
    height: 180,
    borderRadius: 8,
  },
  photoIndex: {
    fontSize: 13,
    fontWeight: '600',
  },
  removePhoto: {
    fontSize: 14,
    fontWeight: '600',
  },
  uploadStatus: {
    fontSize: 14,
    textAlign: 'center',
  },
  review: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  reviewTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  reviewMeta: {
    fontSize: 13,
  },
  publishNote: {
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  buttonSpacer: {
    flex: 1,
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
