import { Redirect } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getMeApi } from '@/api/auth.api';
import { updateMeApi } from '@/api/users.api';
import { ProfileImagePicker } from '@/components/media/profile-image-picker';
import { LogoutButton } from '@/components/auth/logout-button';
import { SaveFormLayout } from '@/components/admin/save-form-layout';
import { UserAvatar } from '@/components/user/user-avatar';
import { PlaceholderScreen } from '@/components/ui/placeholder-screen';
import {
  AdminFormField,
  adminFormStyles,
  adminInputStyle,
} from '@/components/admin/admin-form-field';
import { useTheme } from '@/hooks/use-theme';
import { getUserDisplayName } from '@/lib/user-display';
import { getProfileHref } from '@/lib/profile-navigation';
import { selectIsAuthenticated, useAuthStore } from '@/stores/auth-store';
import { getErrorMessage } from '@/types/api';
import type { FileMeta } from '@/types/user';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const setSession = useAuthStore((state) => state.setSession);

  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [profilePicture, setProfilePicture] = useState<FileMeta | null>(
    user?.profilePicture ?? null,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isAuthenticated || !user) {
    return (
      <PlaceholderScreen
        title="Sign in required"
        subtitle="Log in to view your profile."
        iconName="person-outline"
        denied
      />
    );
  }

  if (user.role === 'STAFF') {
    const staffHref = getProfileHref(user);
    if (staffHref) {
      return <Redirect href={staffHref} />;
    }
  }

  const name = getUserDisplayName(user);
  const pictureChanged =
    profilePicture?.mediaId !== user.profilePicture?.mediaId;
  const nameChanged = displayName.trim() !== (user.displayName ?? '');
  const hasChanges = pictureChanged || nameChanged;

  async function handleSave() {
    if (!hasChanges) {
      return;
    }

    setError(null);
    setIsSaving(true);
    try {
      await updateMeApi({
        displayName: displayName.trim() || undefined,
        profilePicture: profilePicture ?? undefined,
      });

      if (accessToken) {
        const refreshed = await getMeApi();
        setSession(accessToken, refreshed);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <SaveFormLayout
      isSaving={isSaving}
      isReady={hasChanges}
      saveLabel="Save profile"
      error={error}
      onSave={() => void handleSave()}
    >
      <View style={[styles.hero, { paddingTop: insets.top > 0 ? 0 : 8 }]}>
        <UserAvatar
          displayName={displayName.trim() || name}
          profilePicture={profilePicture}
          size={88}
        />
        <Text style={[styles.name, { color: colors.text }]}>{name}</Text>
        <Text style={[styles.role, { color: colors.textSecondary }]}>
          {user.role}
        </Text>
      </View>

      <View
        style={[
          styles.readOnlyBox,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.readOnlyLabel, { color: colors.textSecondary }]}>
          Username
        </Text>
        <Text style={[styles.readOnlyValue, { color: colors.text }]}>
          {user.username}
        </Text>
        <Text style={[styles.readOnlyLabel, { color: colors.textSecondary }]}>
          Email
        </Text>
        <Text style={[styles.readOnlyValue, { color: colors.text }]}>
          {user.email}
        </Text>
      </View>

      <AdminFormField label="Display name" hint="Shown in the header and across the app.">
        <TextInput
          style={[adminFormStyles.input, adminInputStyle(colors)]}
          value={displayName}
          onChangeText={setDisplayName}
          placeholder={user.username}
          placeholderTextColor={colors.textSecondary}
          editable={!isSaving}
        />
      </AdminFormField>

      <AdminFormField label="Profile photo" hint="Optional. Shown in the header when set.">
        <ProfileImagePicker value={profilePicture} onChange={setProfilePicture} />
      </AdminFormField>

      {!hasChanges ? (
        <Text style={[styles.hint, { color: colors.textSecondary }]}>
          Update your display name or photo, then save.
        </Text>
      ) : null}

      <View style={styles.logoutSection}>
        <LogoutButton />
      </View>
    </SaveFormLayout>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
  },
  role: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  readOnlyBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    gap: 4,
  },
  readOnlyLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginTop: 8,
  },
  readOnlyValue: {
    fontSize: 16,
  },
  hint: {
    fontSize: 14,
    lineHeight: 20,
  },
  logoutSection: {
    marginTop: 24,
  },
});
