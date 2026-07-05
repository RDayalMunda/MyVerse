import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { type Href, useRouter } from 'expo-router';

import {
  FullscreenImageViewer,
  useImageGallery,
} from '@/components/media/fullscreen-image-viewer';
import { useTheme } from '@/hooks/use-theme';
import { mediaUrl } from '@/lib/media-url';
import type { StaffListItem } from '@/types/staff';

type StaffCardProps = {
  staff: StaffListItem;
  onPress?: () => void;
};

export function StaffCard({ staff, onPress }: StaffCardProps) {
  const { colors } = useTheme();
  const router = useRouter();
  const { openGallery, galleryProps } = useImageGallery();
  const avatarUri = mediaUrl(staff.user?.profilePicture?.url);
  const displayName = staff.stageName ?? staff.user?.displayName ?? 'Staff member';

  function handleAvatarPress() {
    if (!avatarUri) {
      return;
    }
    openGallery([{ uri: avatarUri, label: displayName }]);
  }

  function handlePress() {
    if (onPress) {
      onPress();
      return;
    }
    router.push(`/staff/${staff.id}` as Href);
  }

  return (
    <>
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            opacity: pressed ? 0.85 : 1,
          },
        ]}
      >
        {avatarUri ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="View profile photo"
            onPress={handleAvatarPress}
          >
            <Image source={{ uri: avatarUri }} style={styles.avatar} contentFit="cover" />
          </Pressable>
        ) : (
          <View style={[styles.avatarPlaceholder, { backgroundColor: colors.background }]}>
            <Text style={[styles.avatarInitial, { color: colors.tint }]}>
              {displayName.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <View style={styles.content}>
          <Text style={[styles.name, { color: colors.text }]}>{displayName}</Text>
          {staff.location ? (
            <Text style={[styles.location, { color: colors.textSecondary }]}>
              {staff.location}
            </Text>
          ) : null}
          {staff.bio ? (
            <Text
              style={[styles.bio, { color: colors.textSecondary }]}
              numberOfLines={2}
            >
              {staff.bio}
            </Text>
          ) : null}
        </View>
      </Pressable>
      <FullscreenImageViewer {...galleryProps} />
    </>
  );
}

export function StaffCardSkeleton() {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.card,
        styles.skeleton,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  skeleton: {
    height: 88,
    opacity: 0.6,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 22,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
  },
  location: {
    fontSize: 13,
  },
  bio: {
    fontSize: 14,
    lineHeight: 19,
  },
});
