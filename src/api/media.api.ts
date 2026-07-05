import { File as ExpoFile, UploadType } from 'expo-file-system';
import { Platform } from 'react-native';

import { uploadFormData } from '@/api/client';
import { API_URL } from '@/constants/config';
import { resolveNativeUploadUri } from '@/lib/upload-image-uri';
import { ApiError, type ApiResponse } from '@/types/api';
import type { FileMeta } from '@/types/user';

export type PickedImage = {
  uri: string;
  name: string;
  type: string;
  file?: globalThis.File;
};

function parseUploadResponse<T>(body: string, status: number): T {
  let payload: ApiResponse<T> & {
    meta?: { message?: string; statusCode?: number; errors?: unknown };
  };

  try {
    payload = JSON.parse(body) as typeof payload;
  } catch {
    throw new ApiError('Invalid response from server', status);
  }

  if (status < 200 || status >= 300 || payload.success === false) {
    const statusCode = payload.meta?.statusCode ?? status ?? 500;
    const message = payload.meta?.message ?? 'Upload failed';
    throw new ApiError(message, statusCode, payload.meta?.errors);
  }

  return payload.data;
}

async function uploadImageMultipart(
  path: string,
  image: PickedImage,
): Promise<FileMeta> {
  if (Platform.OS === 'web' && image.file) {
    const formData = new FormData();
    formData.append('file', image.file, image.name);
    return uploadFormData<FileMeta>(path, formData, { token: null });
  }

  const uri = await resolveNativeUploadUri(image.uri, image.type);
  const file = new ExpoFile(uri);

  const result = await file.upload(`${API_URL}${path}`, {
    uploadType: UploadType.MULTIPART,
    fieldName: 'file',
    mimeType: image.type,
    headers: { Accept: 'application/json' },
  });

  return parseUploadResponse<FileMeta>(result.body, result.status);
}

export async function uploadProfileImage(
  image: PickedImage,
): Promise<FileMeta> {
  return uploadImageMultipart('/media/upload', image);
}

export async function uploadProjectImage(
  image: PickedImage,
): Promise<FileMeta> {
  return uploadImageMultipart('/media/upload/image', image);
}
