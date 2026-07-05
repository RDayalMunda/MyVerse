import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { mediaUrl } from '@/lib/media-url';
import { userInitials } from '@/lib/user-display';
import type { FileMeta } from '@/types/user';

type UserAvatarProps = {
  displayName: string;
  profilePicture?: FileMeta | null;
  size?: number;
};

export function UserAvatar({
  displayName,
  profilePicture,
  size = 36,
}: UserAvatarProps) {
  const { colors } = useTheme();
  const avatarUri = mediaUrl(profilePicture?.url);
  const radius = size / 2;

  if (avatarUri) {
    return (
      <Image
        source={{ uri: avatarUri }}
        style={[styles.avatar, { width: size, height: size, borderRadius: radius }]}
        contentFit="cover"
        accessibilityLabel={`${displayName} profile photo`}
      />
    );
  }

  return (
    <View
      style={[
        styles.placeholder,
        {
          width: size,
          height: size,
          borderRadius: radius,
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
      accessibilityLabel={`${displayName} initials`}
    >
      <Text
        style={[
          styles.initials,
          { color: colors.tint, fontSize: size <= 32 ? 13 : 14 },
        ]}
      >
        {userInitials(displayName)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    flexShrink: 0,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    flexShrink: 0,
  },
  initials: {
    fontWeight: '700',
  },
});
