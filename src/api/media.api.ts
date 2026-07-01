import { uploadFormData } from '@/api/client';
import type { FileMeta } from '@/types/user';

export type PickedImage = {
  uri: string;
  name: string;
  type: string;
  file?: File;
};

export async function uploadProfileImage(
  image: PickedImage,
): Promise<FileMeta> {
  const formData = new FormData();

  if (image.file) {
    formData.append('file', image.file, image.name);
  } else {
    formData.append('file', {
      uri: image.uri,
      name: image.name,
      type: image.type,
    } as unknown as Blob);
  }

  return uploadFormData<FileMeta>('/media/upload', formData, {
    token: null,
  });
}
