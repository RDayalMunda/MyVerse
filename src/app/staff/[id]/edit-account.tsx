import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { updateUserApi } from '@/api/users.api';
import { ProfileImagePicker } from '@/components/media/profile-image-picker';
import { EmptyState } from '@/components/projects/project-card';
import { FormField, FormFieldWrap } from '@/components/ui/form-field';
import { PlaceholderScreen } from '@/components/ui/placeholder-screen';
import { useStaff } from '@/hooks/use-staff';
import { useTheme } from '@/hooks/use-theme';
import { canManageUsers } from '@/lib/permissions';
import {
  FIELD_HINTS,
  hasFieldErrors,
  shouldShowFieldError,
  validateEmail,
  validateUsername,
} from '@/lib/form-validation';
import { runSaveAction, SaveFeedbackPattern } from '@/lib/save-feedback';
import { useAuthStore } from '@/stores/auth-store';
import { getErrorMessage } from '@/types/api';
import type { FileMeta } from '@/types/user';

export default function StaffEditAccountScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const user = useAuthStore((s) => s.user);
  const { staff, isLoading: staffLoading, error: staffError } = useStaff(id);

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [profilePicture, setProfilePicture] = useState<FileMeta | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const fieldErrors = useMemo(
    () => ({
      email: validateEmail(email) ?? undefined,
      username: validateUsername(username) ?? undefined,
    }),
    [email, username],
  );

  useEffect(() => {
    if (!staff?.user || initialized) return;
    setEmail(staff.user.email);
    setUsername(staff.user.username);
    setDisplayName(staff.user.displayName ?? '');
    setProfilePicture(staff.user.profilePicture ?? null);
    setInitialized(true);
  }, [staff, initialized]);

  if (!canManageUsers(user?.role)) {
    return (
      <PlaceholderScreen
        title="Access denied"
        subtitle="Admin permissions required."
        iconName="shield-outline"
        denied
      />
    );
  }

  if (staffLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.tint} />
      </View>
    );
  }

  if (staffError || !staff?.user) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <EmptyState message={staffError ?? 'User not found'} />
      </View>
    );
  }

  async function handleSave() {
    setError(null);
    setSubmitAttempted(true);

    const emailError = validateEmail(email);
    const usernameError = validateUsername(username);
    if (emailError || usernameError) {
      setError('Fix the highlighted fields before saving.');
      return;
    }

    setIsSaving(true);
    try {
      // SaveFeedbackPattern.NavigateBack — see docs/UX.md
      await runSaveAction({
        pattern: SaveFeedbackPattern.NavigateBack,
        successMessage: 'Account updated',
        action: async () => {
          await updateUserApi(staff!.user!.id, {
            email: email.trim(),
            username: username.trim(),
            displayName: displayName.trim() || undefined,
            profilePicture: profilePicture ?? undefined,
          });
        },
        onSuccess: () => {
          router.back();
        },
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={[styles.note, { color: colors.textSecondary }]}>
          Account fields only. Staff profile body (stage name, bio, measurements) can only be edited by the staff member via Edit profile.
        </Text>
        <FormFieldWrap label="Profile photo" hint={FIELD_HINTS.profilePhoto}>
          <ProfileImagePicker value={profilePicture} onChange={setProfilePicture} />
        </FormFieldWrap>
        <FormField
          label="Email *"
          hint={FIELD_HINTS.email}
          error={fieldErrors.email}
          showError={shouldShowFieldError(email, fieldErrors.email, submitAttempted)}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="you@example.com"
        />
        <FormField
          label="Username *"
          hint={FIELD_HINTS.username}
          error={fieldErrors.username}
          showError={shouldShowFieldError(username, fieldErrors.username, submitAttempted)}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          placeholder="johndoe"
        />
        <FormField
          label="Display name"
          hint={FIELD_HINTS.displayNameOptional}
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="John Doe"
        />
        {error ? (
          <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
        ) : null}
      </ScrollView>
      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <Pressable
          disabled={isSaving || hasFieldErrors(fieldErrors)}
          onPress={() => void handleSave()}
          style={[
            styles.saveButton,
            {
              backgroundColor:
                isSaving || hasFieldErrors(fieldErrors) ? colors.border : colors.tint,
            },
          ]}
        >
          {isSaving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveText}>Save account</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 16, gap: 16 },
  note: { fontSize: 13, lineHeight: 18, marginBottom: 4 },
  error: { fontSize: 14 },
  footer: { padding: 16, borderTopWidth: 1 },
  saveButton: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
});
