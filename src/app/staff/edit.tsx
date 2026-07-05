import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { type Href, useRouter } from 'expo-router';

import { updateMyStaffProfileApi } from '@/api/staff.api';
import { getMeApi } from '@/api/auth.api';
import { updateMeApi } from '@/api/users.api';
import { ProfileImagePicker } from '@/components/media/profile-image-picker';
import {
  emptyStaffProfileInput,
  StaffProfileFields,
} from '@/components/staff/staff-profile-fields';
import { PlaceholderScreen } from '@/components/ui/placeholder-screen';
import { useTheme } from '@/hooks/use-theme';
import { invalidateStaffList } from '@/stores/list-invalidation-store';
import { toApiDateValue, toDateInputValue } from '@/lib/date-format';
import { canUpdateOwnStaffProfile } from '@/lib/permissions';
import { validateStaffProfileBody } from '@/lib/staff-validation';
import { useAuthStore } from '@/stores/auth-store';
import { getErrorMessage } from '@/types/api';
import type { StaffProfileInput } from '@/types/staff';
import type { FileMeta } from '@/types/user';

export default function StaffEditScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const user = useAuthStore((s) => s.user);
  const setSession = useAuthStore((s) => s.setSession);
  const mergeStaffProfileInSession = useAuthStore((s) => s.mergeStaffProfileInSession);
  const accessToken = useAuthStore((s) => s.accessToken);

  const [profile, setProfile] = useState<StaffProfileInput>(emptyStaffProfileInput());
  const [profilePicture, setProfilePicture] = useState<FileMeta | null>(
    user?.profilePicture ?? null,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  useEffect(() => {
    if (!canUpdateOwnStaffProfile(user?.role)) return;

    let cancelled = false;

    async function loadProfile() {
      const currentUser = user?.staffProfile
        ? user
        : await getMeApi().catch(() => null);

      if (cancelled || !currentUser?.staffProfile) return;

      if (accessToken && currentUser !== user) {
        setSession(accessToken, currentUser);
      }

      const sp = currentUser.staffProfile;
      setProfile({
        stageName: sp.stageName ?? '',
        bio: sp.bio ?? '',
        gender: sp.gender,
        heightCm: sp.heightCm,
        weightG: sp.weightG,
        likes: sp.likes ?? [],
        skills: sp.skills ?? [],
        socialLinks: sp.socialLinks ?? [],
        location: sp.location,
        dateOfBirth: toDateInputValue(sp.dateOfBirth),
        chestCm: sp.chestCm,
        waistCm: sp.waistCm,
        hipsCm: sp.hipsCm,
        cupSize: sp.cupSize,
        lengthLimpMm: sp.lengthLimpMm,
        lengthErectMm: sp.lengthErectMm,
        girthMm: sp.girthMm,
        loadCapacityMl: sp.loadCapacityMl,
      });
      setProfilePicture(currentUser.profilePicture ?? null);
      setInitialized(true);
    }

    if (!initialized) {
      void loadProfile();
    }

    return () => {
      cancelled = true;
    };
  }, [user, initialized, accessToken, setSession]);

  if (!canUpdateOwnStaffProfile(user?.role)) {
    return (
      <PlaceholderScreen
        title="Access denied"
        subtitle="Only staff members can edit their profile here."
        iconName="lock-closed-outline"
        denied
      />
    );
  }

  async function handleSave() {
    setError(null);
    setSubmitAttempted(true);
    const validationError = validateStaffProfileBody(profile, {
      requireStageName: true,
      requireBio: true,
    });
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSaving(true);
    try {
      const updatedProfile = await updateMyStaffProfileApi({
        ...profile,
        stageName: profile.stageName?.trim(),
        bio: profile.bio?.trim(),
        location: profile.location?.trim() || undefined,
        dateOfBirth: toApiDateValue(profile.dateOfBirth),
      });

      if (
        profilePicture &&
        profilePicture.mediaId !== user?.profilePicture?.mediaId
      ) {
        await updateMeApi({ profilePicture });
      }

      mergeStaffProfileInSession(updatedProfile);

      if (accessToken) {
        const refreshed = await getMeApi().catch(() => null);
        if (refreshed) {
          setSession(accessToken, refreshed);
        }
      }

      invalidateStaffList();
      router.replace(`/staff/${updatedProfile.id}` as Href);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  }

  const showOverlay = isSaving || !initialized;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <ProfileImagePicker
          value={profilePicture}
          onChange={setProfilePicture}
        />
        <StaffProfileFields
          value={profile}
          onChange={setProfile}
          requireStageName
          requireBio
          showValidation={submitAttempted}
        />
        {error ? (
          <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
        ) : null}
      </ScrollView>
      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <Pressable
          disabled={isSaving || !initialized}
          onPress={() => void handleSave()}
          style={[styles.saveButton, { backgroundColor: colors.tint }]}
        >
          {isSaving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveText}>Save changes</Text>
          )}
        </Pressable>
      </View>
      {showOverlay ? (
        <View style={[styles.overlay, { backgroundColor: `${colors.background}E6` }]}>
          <ActivityIndicator size="large" color={colors.tint} />
          <Text style={[styles.overlayText, { color: colors.text }]}>
            {isSaving ? 'Saving…' : 'Loading profile…'}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 16 },
  error: { fontSize: 14 },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  saveButton: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
  overlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    zIndex: 10,
  },
  overlayText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
