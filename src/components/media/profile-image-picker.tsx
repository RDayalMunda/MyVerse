import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { uploadProfileImage, type PickedImage } from '@/api/media.api';
import { useTheme } from '@/hooks/use-theme';
import { FIELD_HINTS } from '@/lib/form-validation';
import { mediaUrl } from '@/lib/media-url';
import { getErrorMessage } from '@/types/api';
import type { FileMeta } from '@/types/user';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 5 * 1024 * 1024;

type ProfileImagePickerProps = {
  value?: FileMeta | null;
  onChange: (meta: FileMeta | null) => void;
  label?: string;
};

function guessMimeType(uri: string): string {
  const lower = uri.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  return 'image/jpeg';
}

function guessFileName(uri: string): string {
  const parts = uri.split('/');
  const last = parts[parts.length - 1] ?? 'profile.jpg';
  return last.includes('.') ? last : 'profile.jpg';
}

export function ProfileImagePicker({
  value,
  onChange,
  label = 'Profile photo',
}: ProfileImagePickerProps) {
  const { colors } = useTheme();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePick() {
    setError(null);

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError('Photo library permission is required');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (result.canceled || !result.assets[0]) {
      return;
    }

    const asset = result.assets[0];
    const mimeType = asset.mimeType ?? guessMimeType(asset.uri);

    if (!ALLOWED_TYPES.includes(mimeType)) {
      setError('Use JPEG, PNG, or WebP');
      return;
    }

    if (asset.fileSize && asset.fileSize > MAX_BYTES) {
      setError('Image must be 5 MB or smaller');
      return;
    }

    const picked: PickedImage = {
      uri: asset.uri,
      name: asset.fileName ?? guessFileName(asset.uri),
      type: mimeType,
      file: Platform.OS === 'web' ? (asset.file as File | undefined) : undefined,
    };

    setIsUploading(true);
    try {
      const meta = await uploadProfileImage(picked);
      onChange(meta);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsUploading(false);
    }
  }

  const previewUri = value ? mediaUrl(value.url) : undefined;

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Choose profile photo"
        disabled={isUploading}
        onPress={() => void handlePick()}
        style={({ pressed }) => [
          styles.picker,
          {
            borderColor: colors.border,
            backgroundColor: colors.surface,
            opacity: pressed || isUploading ? 0.85 : 1,
          },
        ]}
      >
        {previewUri ? (
          <Image source={{ uri: previewUri }} style={styles.preview} contentFit="cover" />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="camera-outline" size={32} color={colors.textSecondary} />
            <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
              Tap to choose photo
            </Text>
          </View>
        )}
        {isUploading ? (
          <View style={styles.uploadOverlay}>
            <ActivityIndicator color="#FFFFFF" />
          </View>
        ) : null}
      </Pressable>
      {value ? (
        <Pressable onPress={() => onChange(null)}>
          <Text style={[styles.remove, { color: colors.error }]}>Remove photo</Text>
        </Pressable>
      ) : null}
      {error ? (
        <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
      ) : (
        <Text style={[styles.hint, { color: colors.textSecondary }]}>
          {FIELD_HINTS.profilePhoto}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
  },
  picker: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  preview: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 12,
  },
  placeholderText: {
    fontSize: 12,
    textAlign: 'center',
  },
  uploadOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  remove: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  error: {
    fontSize: 13,
    textAlign: 'center',
  },
  hint: {
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
  },
});
