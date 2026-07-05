import { API_URL } from '@/constants/config';
import { ApiError, type ApiResponse } from '@/types/api';

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  token?: string | null;
  skipAuthLogout?: boolean;
};

let getAccessToken: (() => string | null) | null = null;
let onUnauthorized: (() => void) | null = null;

export function bindAuthHandlers(
  tokenGetter: () => string | null,
  unauthorizedHandler: () => void,
) {
  getAccessToken = tokenGetter;
  onUnauthorized = unauthorizedHandler;
}

export async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = 'GET', body, token, skipAuthLogout = false } = options;
  const accessToken = token !== undefined ? token : getAccessToken?.() ?? null;

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new TypeError('Unable to reach server');
  }

  const contentType = response.headers.get('content-type') ?? '';
  const isJson = contentType.includes('application/json');
  const payload = isJson
    ? ((await response.json()) as ApiResponse<T> & {
        meta?: { message?: string; statusCode?: number; errors?: unknown };
      })
    : null;

  if (!response.ok || payload?.success === false) {
    const statusCode =
      payload?.meta?.statusCode ?? response.status ?? 500;
    const message =
      payload?.meta?.message ??
      (response.statusText || 'Request failed');

    if (
      statusCode === 401 &&
      accessToken &&
      !skipAuthLogout &&
      onUnauthorized
    ) {
      onUnauthorized();
    }

    throw new ApiError(message, statusCode, payload?.meta?.errors);
  }

  if (!payload) {
    throw new ApiError('Invalid response from server', response.status);
  }

  return payload.data;
}

export async function requestWithMeta<T>(
  path: string,
  options: RequestOptions = {},
): Promise<{ data: T; meta?: ApiResponse<T>['meta'] }> {
  const { method = 'GET', body, token, skipAuthLogout = false } = options;
  const accessToken = token !== undefined ? token : getAccessToken?.() ?? null;

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new TypeError('Unable to reach server');
  }

  const contentType = response.headers.get('content-type') ?? '';
  const isJson = contentType.includes('application/json');
  const payload = isJson
    ? ((await response.json()) as ApiResponse<T>)
    : null;

  if (!response.ok || payload?.success === false) {
    const statusCode =
      (payload?.meta as { statusCode?: number } | undefined)?.statusCode ??
      response.status ??
      500;
    const message =
      (payload?.meta as { message?: string } | undefined)?.message ??
      (response.statusText || 'Request failed');

    if (
      statusCode === 401 &&
      accessToken &&
      !skipAuthLogout &&
      onUnauthorized
    ) {
      onUnauthorized();
    }

    throw new ApiError(
      message,
      statusCode,
      (payload?.meta as { errors?: unknown } | undefined)?.errors,
    );
  }

  if (!payload) {
    throw new ApiError('Invalid response from server', response.status);
  }

  return { data: payload.data, meta: payload.meta };
}

export async function uploadFormData<T>(
  path: string,
  formData: FormData,
  options: { token?: string | null; skipAuthLogout?: boolean } = {},
): Promise<T> {
  const { token, skipAuthLogout = false } = options;
  const accessToken = token !== undefined ? token : getAccessToken?.() ?? null;

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers,
      body: formData,
    });
  } catch (err) {
    const message =
      err instanceof Error && err.message
        ? err.message
        : 'Unable to reach server';
    throw new TypeError(message);
  }

  const contentType = response.headers.get('content-type') ?? '';
  const isJson = contentType.includes('application/json');
  const payload = isJson
    ? ((await response.json()) as ApiResponse<T> & {
        meta?: { message?: string; statusCode?: number; errors?: unknown };
      })
    : null;

  if (!response.ok || payload?.success === false) {
    const statusCode =
      payload?.meta?.statusCode ?? response.status ?? 500;
    const message =
      payload?.meta?.message ??
      (response.statusText || 'Upload failed');

    if (
      statusCode === 401 &&
      accessToken &&
      !skipAuthLogout &&
      onUnauthorized
    ) {
      onUnauthorized();
    }

    throw new ApiError(message, statusCode, payload?.meta?.errors);
  }

  if (!payload) {
    throw new ApiError('Invalid response from server', response.status);
  }

  return payload.data;
}
