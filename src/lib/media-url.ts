import { API_ORIGIN } from '@/constants/config';

/** Resolve a media path or absolute URL to a fetchable image URL. */
export function mediaUrl(path?: string | null): string | undefined {
  if (!path) {
    return undefined;
  }
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${API_ORIGIN}${normalized}`;
}
