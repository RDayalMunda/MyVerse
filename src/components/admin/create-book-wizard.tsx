import { useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { type Href, useRouter } from 'expo-router';

import { createTextItemApi } from '@/api/section-items.api';
import { createSectionApi, publishSectionApi } from '@/api/sections.api';
import { createBookApi, publishProjectApi } from '@/api/projects.api';
import { useTheme } from '@/hooks/use-theme';
import { FIELD_HINTS, validateRequiredText } from '@/lib/form-validation';
import { invalidateProjectsList } from '@/stores/list-invalidation-store';
import { getErrorMessage } from '@/types/api';

type WizardStep = 1 | 2 | 3 | 4;

const STEP_LABELS = ['Book', 'Section', 'Content', 'Publish'];

export function CreateBookWizard() {
  const router = useRouter();
  const { colors } = useTheme();

  const [step, setStep] = useState<WizardStep>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [projectId, setProjectId] = useState<string | null>(null);
  const [sectionId, setSectionId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [summary, setSummary] = useState('');
  const [sectionLabel, setSectionLabel] = useState('');
  const [sectionDescription, setSectionDescription] = useState('');
  const [textContent, setTextContent] = useState('');
  const [textItemCreated, setTextItemCreated] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  function canProceed(): boolean {
    switch (step) {
      case 1:
        return title.trim().length > 0;
      case 2:
        return sectionLabel.trim().length > 0;
      case 3:
        return textContent.trim().length > 0;
      case 4:
        return Boolean(projectId && sectionId);
      default:
        return false;
    }
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
        const project = await createBookApi({
          title: title.trim(),
          description: description.trim() || undefined,
          summary: summary.trim() || undefined,
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
      const contentError = validateRequiredText(textContent, 'Text content');
      if (contentError) {
        setError(contentError);
        return;
      }

      if (textItemCreated) {
        setStep(4);
        setSubmitAttempted(false);
        return;
      }

      setIsLoading(true);
      try {
        await createTextItemApi(projectId, sectionId, {
          textContent: textContent.trim(),
        });
        setTextItemCreated(true);
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
          <Text style={[styles.stepTitle, { color: colors.text }]}>Book details</Text>
          <Field label="Title *" hint={FIELD_HINTS.bookTitle} colors={colors}>
            <TextInput
              style={[
                styles.input,
                inputStyle(colors, submitAttempted && !title.trim()),
              ]}
              value={title}
              onChangeText={setTitle}
              placeholder="My First Book"
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
          <Field label="Summary" hint="Optional. Longer summary for the book detail page." colors={colors}>
            <TextInput
              style={[styles.input, styles.multiline, inputStyle(colors)]}
              value={summary}
              onChangeText={setSummary}
              placeholder="Longer summary (optional)"
              placeholderTextColor={colors.textSecondary}
              multiline
              editable={!isLoading}
            />
          </Field>
        </View>
      ) : null}

      {step === 2 ? (
        <View style={styles.step}>
          <Text style={[styles.stepTitle, { color: colors.text }]}>First section</Text>
          <Field label="Label *" hint={FIELD_HINTS.sectionLabel} colors={colors}>
            <TextInput
              style={[
                styles.input,
                inputStyle(colors, submitAttempted && !sectionLabel.trim()),
              ]}
              value={sectionLabel}
              onChangeText={setSectionLabel}
              placeholder="Chapter 1"
              placeholderTextColor={colors.textSecondary}
              editable={!isLoading}
            />
            {submitAttempted && !sectionLabel.trim() ? (
              <Text style={[styles.fieldError, { color: colors.error }]}>
                Section label is required
              </Text>
            ) : null}
          </Field>
          <Field label="Description" hint="Optional section description." colors={colors}>
            <TextInput
              style={[styles.input, styles.multiline, inputStyle(colors)]}
              value={sectionDescription}
              onChangeText={setSectionDescription}
              placeholder="Optional section description"
              placeholderTextColor={colors.textSecondary}
              multiline
              editable={!isLoading}
            />
          </Field>
        </View>
      ) : null}

      {step === 3 ? (
        <View style={styles.step}>
          <Text style={[styles.stepTitle, { color: colors.text }]}>Chapter content</Text>
          <Field label="Text *" hint={FIELD_HINTS.textContent} colors={colors}>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                inputStyle(colors, submitAttempted && !textContent.trim()),
              ]}
              value={textContent}
              onChangeText={setTextContent}
              placeholder="Write your chapter here..."
              placeholderTextColor={colors.textSecondary}
              multiline
              editable={!isLoading}
            />
            {submitAttempted && !textContent.trim() ? (
              <Text style={[styles.fieldError, { color: colors.error }]}>
                Text content is required
              </Text>
            ) : null}
          </Field>
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
            <Text style={[styles.reviewPreview, { color: colors.text }]} numberOfLines={4}>
              {textContent}
            </Text>
          </View>
          <Text style={[styles.publishNote, { color: colors.textSecondary }]}>
            Publishing the section first, then the project. After publish, you will see the
            live reader view.
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
              {step === 4 ? 'Publish' : 'Next'}
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
  textArea: {
    minHeight: 160,
    textAlignVertical: 'top',
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
  reviewPreview: {
    fontSize: 15,
    lineHeight: 22,
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
