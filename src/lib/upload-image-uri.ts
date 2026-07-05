import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';

function extensionForMime(mimeType: string): string {
  switch (mimeType) {
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    default:
      return 'jpg';
  }
}

/** Android sometimes returns `file:/path` instead of `file:///path`. */
function normalizeFileScheme(uri: string): string {
  if (uri.startsWith('file:///')) {
    return uri;
  }
  if (uri.startsWith('file:/')) {
    const path = uri.slice('file:/'.length).replace(/^\/+/, '');
    return `file:///${path}`;
  }
  return uri;
}

function needsCacheCopy(uri: string): boolean {
  if (uri.startsWith('content://') || uri.startsWith('ph://')) {
    return true;
  }
  return !normalizeFileScheme(uri).startsWith('file:///');
}

/**
 * Returns a readable `file://` URI for native uploads via `expo-file-system` File.upload().
 * Copies to cache only when the picker URI is not already a normalized file path.
 */
export async function resolveNativeUploadUri(
  uri: string,
  mimeType: string,
): Promise<string> {
  if (Platform.OS === 'web') {
    return uri;
  }

  const normalized = normalizeFileScheme(uri);

  if (!needsCacheCopy(uri)) {
    return normalized;
  }

  if (!FileSystem.cacheDirectory) {
    return normalized;
  }

  const dest = `${FileSystem.cacheDirectory}upload-${Date.now()}.${extensionForMime(mimeType)}`;
  await FileSystem.copyAsync({ from: uri, to: dest });
  return dest;
}
