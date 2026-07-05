import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type { PickedImage } from '@/api/media.api';
import { useTheme } from '@/hooks/use-theme';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 10 * 1024 * 1024;

export type LocalPhoto = PickedImage & {
  id: string;
};

function guessMimeType(uri: string): string {
  const lower = uri.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  return 'image/jpeg';
}

function guessFileName(uri: string, index: number): string {
  const parts = uri.split('/');
  const last = parts[parts.length - 1] ?? `photo-${index + 1}.jpg`;
  return last.includes('.') ? last : `photo-${index + 1}.jpg`;
}

type PhotoshootItemPickerProps = {
  photos: LocalPhoto[];
  onChange: (photos: LocalPhoto[]) => void;
  onError: (message: string) => void;
  disabled?: boolean;
  multiple?: boolean;
};

export function PhotoshootItemPicker({
  photos,
  onChange,
  onError,
  disabled = false,
  multiple = true,
}: PhotoshootItemPickerProps) {
  const { colors } = useTheme();
  const [existingCount] = useState(photos.length);

  async function handlePickPhotos() {
    onError('');

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      onError('Photo library permission is required');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: multiple,
      quality: 0.9,
    });

    if (result.canceled || result.assets.length === 0) {
      return;
    }

    const nextPhotos: LocalPhoto[] = [];

    for (let index = 0; index < result.assets.length; index++) {
      const asset = result.assets[index];
      const mimeType = asset.mimeType ?? guessMimeType(asset.uri);

      if (!ALLOWED_TYPES.includes(mimeType)) {
        onError('Use JPEG, PNG, or WebP for all photos');
        return;
      }

      if (asset.fileSize && asset.fileSize > MAX_BYTES) {
        onError('Each image must be 10 MB or smaller');
        return;
      }

      nextPhotos.push({
        id: `${Date.now()}-${index}`,
        uri: asset.uri,
        name:
          asset.fileName ??
          guessFileName(asset.uri, existingCount + photos.length + index),
        type: mimeType,
        file:
          Platform.OS === 'web' ? (asset.file as File | undefined) : undefined,
      });
    }

    onChange(multiple ? [...photos, ...nextPhotos] : nextPhotos);
  }

  function removePhoto(id: string) {
    onChange(photos.filter((photo) => photo.id !== id));
  }

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Add photos"
        disabled={disabled}
        onPress={() => void handlePickPhotos()}
        style={({ pressed }) => [
          styles.addPhotosButton,
          {
            borderColor: colors.border,
            backgroundColor: colors.surface,
            opacity: pressed || disabled ? 0.85 : 1,
          },
        ]}
      >
        <Ionicons name="images-outline" size={22} color={colors.tint} />
        <Text style={[styles.addPhotosText, { color: colors.text }]}>
          {photos.length > 0 ? 'Add more photos' : 'Choose photos'}
        </Text>
      </Pressable>

      <View style={styles.photoGrid}>
        {photos.map((photo, index) => (
          <View
            key={photo.id}
            style={[styles.photoTile, { borderColor: colors.border }]}
          >
            <Image
              source={{ uri: photo.uri }}
              style={styles.photoPreview}
              contentFit="cover"
            />
            <Text style={[styles.photoIndex, { color: colors.textSecondary }]}>
              Photo {index + 1}
            </Text>
            <Pressable onPress={() => removePhoto(photo.id)} disabled={disabled}>
              <Text style={[styles.removePhoto, { color: colors.error }]}>
                Remove
              </Text>
            </Pressable>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  addPhotosButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 14,
  },
  addPhotosText: {
    fontSize: 16,
    fontWeight: '600',
  },
  photoGrid: {
    gap: 12,
  },
  photoTile: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  photoPreview: {
    width: '100%',
    height: 180,
    borderRadius: 8,
  },
  photoIndex: {
    fontSize: 13,
    fontWeight: '600',
  },
  removePhoto: {
    fontSize: 14,
    fontWeight: '600',
  },
});
