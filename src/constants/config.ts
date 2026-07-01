export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'https://redvalky.in/api/v1';

/** Origin without /api/v1 suffix — used for media image URLs */
export const API_ORIGIN = API_URL.replace(/\/api\/v1\/?$/, '');

export const ACCENT_COLOR = '#208AEF';
