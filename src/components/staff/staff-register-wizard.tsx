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
import {
  emptyStaffProfileInput,
  StaffProfileFields,
} from '@/components/staff/staff-profile-fields';
import { FormFieldWrap } from '@/components/ui/form-field';
import { useTheme } from '@/hooks/use-theme';
import { invalidateStaffList } from '@/stores/list-invalidation-store';
import { resetNavigationTo } from '@/lib/auth-navigation';
import { toApiDateValue } from '@/lib/date-format';
import {
  FIELD_HINTS,
  hasFieldErrors,
  validateAccountFields,
} from '@/lib/form-validation';
import { validateStaffProfileBody } from '@/lib/staff-validation';
import { useAuthStore } from '@/stores/auth-store';
import { getErrorMessage } from '@/types/api';
import type { RegisterStaffRequest, StaffProfileInput } from '@/types/staff';
import type { FileMeta } from '@/types/user';

type WizardStep = 1 | 2 | 3 | 4;

const STEP_LABELS = ['Account', 'Photo', 'Profile', 'Review'];

export function StaffRegisterWizard() {
  const router = useRouter();
  const { colors } = useTheme();
  const registerStaff = useAuthStore((s) => s.registerStaff);
  const isLoading = useAuthStore((s) => s.isLoading);

  const [step, setStep] = useState<WizardStep>(1);
  const [error, setError] = useState<string | null>(null);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [profilePicture, setProfilePicture] = useState<FileMeta | null>(null);
  const [profile, setProfile] = useState<StaffProfileInput>(emptyStaffProfileInput());

  const accountErrors = useMemo(
    () =>
      validateAccountFields(
        { email, username, password, displayName },
        { requireDisplayName: true },
      ),
    [email, username, password, displayName],
  );

  function canProceed(): boolean {
    switch (step) {
      case 1:
        return !hasFieldErrors(accountErrors);
      case 2:
        return Boolean(profilePicture);
      case 3:
        return validateStaffProfileBody(profile, {
          requireStageName: true,
          requireBio: true,
        }) === null;
      case 4:
        return true;
      default:
        return false;
    }
  }

  function validateStep(): string | null {
    if (step === 1) {
      if (hasFieldErrors(accountErrors)) {
        return 'Fix the highlighted account fields before continuing.';
      }
    }
    if (step === 2 && !profilePicture) {
      return 'Profile photo is required';
    }
    if (step === 3) {
      return validateStaffProfileBody(profile, {
        requireStageName: true,
        requireBio: true,
      });
    }
    return null;
  }

  async function handleNext() {
    setError(null);
    setSubmitAttempted(true);

    const validationError = validateStep();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (step < 4) {
      setSubmitAttempted(false);
      setStep((s) => (s + 1) as WizardStep);
      return;
    }

    if (!profilePicture) {
      setError('Profile photo is required');
      return;
    }

    const body: RegisterStaffRequest = {
      email: email.trim(),
      username: username.trim(),
      password,
      displayName: displayName.trim(),
      profilePicture,
      stageName: profile.stageName!.trim(),
      bio: profile.bio!.trim(),
      gender: profile.gender,
      heightCm: profile.heightCm,
      weightG: profile.weightG,
      likes: profile.likes,
      location: profile.location?.trim() || undefined,
      skills: profile.skills?.length ? profile.skills : undefined,
      dateOfBirth: toApiDateValue(profile.dateOfBirth),
      socialLinks: profile.socialLinks?.length ? profile.socialLinks : undefined,
      chestCm: profile.chestCm,
      waistCm: profile.waistCm,
      hipsCm: profile.hipsCm,
      cupSize: profile.cupSize,
      lengthLimpMm: profile.lengthLimpMm,
      lengthErectMm: profile.lengthErectMm,
      girthMm: profile.girthMm,
      loadCapacityMl: profile.loadCapacityMl,
    };

    try {
      await registerStaff(body);
      invalidateStaffList();
      resetNavigationTo('/(tabs)/staff' as Href);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  function handleBack() {
    setError(null);
    setSubmitAttempted(false);
    if (step > 1) {
      setStep((s) => (s - 1) as WizardStep);
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
            displayNameRequired
            editable={!isLoading}
          />
        ) : null}

        {step === 2 ? (
          <FormFieldWrap
            label="Profile photo *"
            hint={FIELD_HINTS.profilePhoto}
            error={submitAttempted && !profilePicture ? 'Profile photo is required' : undefined}
            showError={submitAttempted && !profilePicture}
          >
            <ProfileImagePicker value={profilePicture} onChange={setProfilePicture} />
          </FormFieldWrap>
        ) : null}

        {step === 3 ? (
          <StaffProfileFields
            value={profile}
            onChange={setProfile}
            requireStageName
            requireBio
            showValidation={submitAttempted}
          />
        ) : null}

        {step === 4 ? (
          <View style={styles.review}>
            <Text style={[styles.reviewTitle, { color: colors.text }]}>Review</Text>
            <Text style={{ color: colors.textSecondary }}>Email: {email}</Text>
            <Text style={{ color: colors.textSecondary }}>Username: {username}</Text>
            <Text style={{ color: colors.textSecondary }}>Stage name: {profile.stageName}</Text>
            <Text style={{ color: colors.textSecondary }}>Photo: {profilePicture ? 'Uploaded' : 'Missing'}</Text>
          </View>
        ) : null}

        {error ? (
          <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
        ) : null}
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <Text style={{ color: colors.text, fontWeight: '600' }}>
            {step === 1 ? 'Cancel' : 'Back'}
          </Text>
        </Pressable>
        <Pressable
          disabled={!canProceed() || isLoading}
          onPress={() => void handleNext()}
          style={[
            styles.nextButton,
            {
              backgroundColor: canProceed() && !isLoading ? colors.tint : colors.border,
            },
          ]}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.nextText}>{step === 4 ? 'Register' : 'Next'}</Text>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  stepItem: { alignItems: 'center', gap: 4, flex: 1 },
  stepDot: { width: 8, height: 8, borderRadius: 4 },
  stepLabel: { fontSize: 11, fontWeight: '600' },
  content: { padding: 16, flexGrow: 1 },
  review: { gap: 8 },
  reviewTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  error: { marginTop: 12, fontSize: 14 },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
  },
  backButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  nextButton: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    paddingVertical: 14,
  },
  nextText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
});
