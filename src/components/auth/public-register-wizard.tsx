import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { type Href, useRouter } from 'expo-router';

import { AccountFormFields } from '@/components/auth/account-form-fields';
import { ProfileImagePicker } from '@/components/media/profile-image-picker';
import { FormFieldWrap } from '@/components/ui/form-field';
import { useTheme } from '@/hooks/use-theme';
import { resetNavigationTo } from '@/lib/auth-navigation';
import {
  FIELD_HINTS,
  hasFieldErrors,
  validateAccountFields,
} from '@/lib/form-validation';
import { useAuthStore } from '@/stores/auth-store';
import { getRegisterErrorMessage } from '@/types/api';
import type { FileMeta } from '@/types/user';

type WizardStep = 1 | 2;

const STEP_LABELS = ['Account', 'Photo'];

export function PublicRegisterWizard() {
  const router = useRouter();
  const { colors } = useTheme();
  const registerPublic = useAuthStore((s) => s.registerPublic);
  const isLoading = useAuthStore((s) => s.isLoading);

  const [step, setStep] = useState<WizardStep>(1);
  const [error, setError] = useState<string | null>(null);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [profilePicture, setProfilePicture] = useState<FileMeta | null>(null);

  const accountErrors = useMemo(
    () => validateAccountFields({ email, username, password, displayName }),
    [email, username, password, displayName],
  );

  function canProceed(): boolean {
    if (step === 1) {
      return !hasFieldErrors(accountErrors);
    }
    return true;
  }

  async function handleSubmit() {
    setError(null);
    setSubmitAttempted(true);

    if (step === 1) {
      if (hasFieldErrors(accountErrors)) {
        return;
      }
      setStep(2);
      setSubmitAttempted(false);
      return;
    }

    try {
      await registerPublic({
        email: email.trim(),
        username: username.trim(),
        password,
        displayName: displayName.trim() || undefined,
        profilePicture: profilePicture ?? undefined,
      });
      resetNavigationTo('/(tabs)' as Href);
    } catch (err) {
      setError(getRegisterErrorMessage(err));
    }
  }

  function handleBack() {
    setError(null);
    setSubmitAttempted(false);
    if (step > 1) {
      setStep(1);
    } else {
      router.back();
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.steps}>
        {STEP_LABELS.map((label, index) => (
          <View key={label} style={styles.stepItem}>
            <View
              style={[
                styles.stepDot,
                {
                  backgroundColor:
                    index + 1 <= step ? colors.tint : colors.border,
                },
              ]}
            />
            <Text
              style={[
                styles.stepLabel,
                {
                  color: index + 1 <= step ? colors.text : colors.textSecondary,
                },
              ]}
            >
              {label}
            </Text>
          </View>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {error ? (
          <View style={[styles.errorBanner, { backgroundColor: colors.errorBackground }]}>
            <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
          </View>
        ) : null}

        {step === 1 ? (
          <AccountFormFields
            email={email}
            username={username}
            password={password}
            displayName={displayName}
            onEmailChange={setEmail}
            onUsernameChange={setUsername}
            onPasswordChange={setPassword}
            onDisplayNameChange={setDisplayName}
            errors={accountErrors}
            submitAttempted={submitAttempted}
            editable={!isLoading}
          />
        ) : (
          <FormFieldWrap label="Profile photo" hint={FIELD_HINTS.profilePhoto}>
            <ProfileImagePicker
              value={profilePicture}
              onChange={setProfilePicture}
            />
            <Text style={[styles.optionalHint, { color: colors.textSecondary }]}>
              Optional. You can add or change your photo later from your profile.
            </Text>
          </FormFieldWrap>
        )}

        <View style={styles.links}>
          <Pressable onPress={() => router.push('/login' as Href)} disabled={isLoading}>
            <Text style={[styles.link, { color: colors.tint }]}>
              Already have an account? Sign in
            </Text>
          </Pressable>
          <Pressable
            onPress={() => router.push('/staff/register' as Href)}
            disabled={isLoading}
          >
            <Text style={[styles.link, { color: colors.tint }]}>Join as staff instead</Text>
          </Pressable>
        </View>
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <Pressable
          onPress={handleBack}
          disabled={isLoading}
          style={[styles.secondaryButton, { borderColor: colors.border }]}
        >
          <Text style={[styles.secondaryText, { color: colors.text }]}>
            {step === 1 ? 'Cancel' : 'Back'}
          </Text>
        </Pressable>
        <Pressable
          disabled={isLoading || !canProceed()}
          onPress={() => void handleSubmit()}
          style={[
            styles.primaryButton,
            {
              backgroundColor:
                isLoading || !canProceed() ? colors.border : colors.tint,
            },
          ]}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryText}>
              {step === 1 ? 'Continue' : 'Create account'}
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  steps: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  stepItem: { alignItems: 'center', gap: 6 },
  stepDot: { width: 10, height: 10, borderRadius: 5 },
  stepLabel: { fontSize: 12, fontWeight: '600' },
  content: { padding: 16, gap: 16 },
  errorBanner: { borderRadius: 10, padding: 12 },
  errorText: { fontSize: 14, fontWeight: '500' },
  optionalHint: { fontSize: 13, lineHeight: 18, marginTop: 8 },
  links: { gap: 8, marginTop: 8 },
  link: { textAlign: 'center', fontSize: 14, fontWeight: '500' },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryText: { fontSize: 16, fontWeight: '600' },
  primaryButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
