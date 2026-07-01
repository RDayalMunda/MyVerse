import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { type Href, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  activateUserApi,
  deactivateUserApi,
} from '@/api/users.api';
import { EmptyState } from '@/components/projects/project-card';
import { TagChipList } from '@/components/staff/tag-chip-list';
import { useStaff } from '@/hooks/use-staff';
import { useTheme } from '@/hooks/use-theme';
import { formatDateForDisplay } from '@/lib/date-format';
import {
  canManageUsers,
  canUpdateOwnStaffProfile,
  isOwnUser,
} from '@/lib/permissions';
import { genderLabel } from '@/lib/staff-validation';
import { mediaUrl } from '@/lib/media-url';
import { useAuthStore } from '@/stores/auth-store';
import { getErrorMessage } from '@/types/api';

function DetailRow({ label, value }: { label: string; value?: string | number | null }) {
  const { colors } = useTheme();
  if (value === undefined || value === null || value === '') return null;

  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.rowValue, { color: colors.text }]}>{String(value)}</Text>
    </View>
  );
}

export default function StaffDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();
  const user = useAuthStore((s) => s.user);
  const { staff, isLoading, error, refetch } = useStaff(id);
  const [actionLoading, setActionLoading] = useState(false);
  const skipFocusRefetchRef = useRef(true);

  useEffect(() => {
    skipFocusRefetchRef.current = true;
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      if (skipFocusRefetchRef.current) {
        skipFocusRefetchRef.current = false;
        return;
      }
      refetch(true);
    }, [refetch]),
  );

  const isAdmin = canManageUsers(user?.role);
  const isOwnProfile =
    staff && user && isOwnUser(user.id, staff.userId);
  const canSelfEdit =
    isOwnProfile && canUpdateOwnStaffProfile(user?.role);
  const targetUser = staff?.user;

  async function handleToggleActive() {
    if (!targetUser) return;

    const action = targetUser.isActive ? 'deactivate' : 'activate';
    Alert.alert(
      `${action === 'deactivate' ? 'Deactivate' : 'Activate'} account`,
      `Are you sure you want to ${action} this staff account?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action === 'deactivate' ? 'Deactivate' : 'Activate',
          style: action === 'deactivate' ? 'destructive' : 'default',
          onPress: () => {
            void (async () => {
              setActionLoading(true);
              try {
                if (action === 'deactivate') {
                  await deactivateUserApi(targetUser.id);
                } else {
                  await activateUserApi(targetUser.id);
                }
                refetch();
              } catch (err) {
                Alert.alert('Error', getErrorMessage(err));
              } finally {
                setActionLoading(false);
              }
            })();
          },
        },
      ],
    );
  }

  if (isLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.tint} />
      </View>
    );
  }

  if (error || !staff) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <EmptyState
          message={error ?? 'Staff profile not found'}
          actionLabel="Try again"
          onAction={refetch}
        />
      </View>
    );
  }

  const avatarUri = mediaUrl(staff.user?.profilePicture?.url);
  const title = staff.stageName ?? staff.user?.displayName ?? 'Staff member';

  return (
    <ScrollView
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + 24, backgroundColor: colors.background },
      ]}
    >
      <View style={styles.hero}>
        {avatarUri ? (
          <Image source={{ uri: avatarUri }} style={styles.avatar} contentFit="cover" />
        ) : (
          <View style={[styles.avatarPlaceholder, { backgroundColor: colors.surface }]}>
            <Text style={[styles.avatarInitial, { color: colors.tint }]}>
              {title.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        {staff.user?.displayName && staff.stageName ? (
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {staff.user.displayName}
          </Text>
        ) : null}
        {staff.location ? (
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {staff.location}
          </Text>
        ) : null}
      </View>

      <View style={styles.actions}>
        {canSelfEdit ? (
          <Pressable
            onPress={() => router.push('/staff/edit' as Href)}
            style={[styles.actionButton, { backgroundColor: colors.tint }]}
          >
            <Text style={styles.actionText}>Edit profile</Text>
          </Pressable>
        ) : null}
        {isAdmin && targetUser ? (
          <>
            <Pressable
              onPress={() =>
                router.push(`/staff/${id}/edit-account` as Href)
              }
              style={[styles.actionButton, { borderColor: colors.border, borderWidth: 1 }]}
            >
              <Text style={[styles.actionTextSecondary, { color: colors.text }]}>
                Edit account
              </Text>
            </Pressable>
            <Pressable
              disabled={actionLoading}
              onPress={() => void handleToggleActive()}
              style={[
                styles.actionButton,
                {
                  borderColor: targetUser.isActive ? colors.error : colors.tint,
                  borderWidth: 1,
                },
              ]}
            >
              {actionLoading ? (
                <ActivityIndicator color={colors.tint} />
              ) : (
                <Text
                  style={{
                    color: targetUser.isActive ? colors.error : colors.tint,
                    fontWeight: '600',
                  }}
                >
                  {targetUser.isActive ? 'Deactivate account' : 'Activate account'}
                </Text>
              )}
            </Pressable>
          </>
        ) : null}
      </View>

      {staff.bio ? (
        <Text style={[styles.bio, { color: colors.text }]}>{staff.bio}</Text>
      ) : null}

      <View style={[styles.section, { borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Details</Text>
        <DetailRow label="Gender" value={genderLabel(staff.gender)} />
        <DetailRow label="Date of birth" value={formatDateForDisplay(staff.dateOfBirth)} />
        <DetailRow label="Height" value={staff.heightCm ? `${staff.heightCm} cm` : null} />
        <DetailRow label="Weight" value={staff.weightG ? `${staff.weightG} g` : null} />
        <TagChipList label="Likes" tags={staff.likes ?? []} />
        <TagChipList label="Skills" tags={staff.skills ?? []} />
        {staff.gender === 'FEMALE' ? (
          <>
            <DetailRow label="Chest" value={staff.chestCm ? `${staff.chestCm} cm` : null} />
            <DetailRow label="Waist" value={staff.waistCm ? `${staff.waistCm} cm` : null} />
            <DetailRow label="Hips" value={staff.hipsCm ? `${staff.hipsCm} cm` : null} />
            <DetailRow label="Cup size" value={staff.cupSize} />
          </>
        ) : null}
        {staff.gender === 'MALE' ? (
          <>
            <DetailRow label="Length (limp)" value={staff.lengthLimpMm ? `${staff.lengthLimpMm} mm` : null} />
            <DetailRow label="Length (erect)" value={staff.lengthErectMm ? `${staff.lengthErectMm} mm` : null} />
            <DetailRow label="Girth" value={staff.girthMm ? `${staff.girthMm} mm` : null} />
            <DetailRow label="Load capacity" value={staff.loadCapacityMl ? `${staff.loadCapacityMl} ml` : null} />
          </>
        ) : null}
      </View>

      {(staff.socialLinks ?? []).length > 0 ? (
        <View style={[styles.section, { borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Social</Text>
          {staff.socialLinks.map((link, index) => (
            <DetailRow key={`${link.platform}-${index}`} label={link.platform} value={link.url} />
          ))}
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 16, gap: 16 },
  hero: { alignItems: 'center', gap: 8 },
  avatar: { width: 120, height: 120, borderRadius: 60 },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: { fontSize: 40, fontWeight: '700' },
  title: { fontSize: 26, fontWeight: '700', textAlign: 'center' },
  subtitle: { fontSize: 15, textAlign: 'center' },
  actions: { gap: 10 },
  actionButton: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  actionText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
  actionTextSecondary: { fontWeight: '600', fontSize: 16 },
  bio: { fontSize: 16, lineHeight: 24 },
  section: {
    borderTopWidth: 1,
    paddingTop: 16,
    gap: 10,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  row: { gap: 2 },
  rowLabel: { fontSize: 13, fontWeight: '600' },
  rowValue: { fontSize: 15 },
});
