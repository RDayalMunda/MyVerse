export type PaginatedMeta = {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
};

export type ApiResponse<T> = {
  success: boolean;
  data: T;
  meta?: PaginatedMeta;
};

export type ApiErrorMeta = {
  message: string;
  statusCode: number;
  errors?: unknown;
};

export class ApiError extends Error {
  statusCode: number;
  errors?: unknown;

  constructor(message: string, statusCode: number, errors?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Something went wrong';
}

export function getLoginErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.statusCode === 401) {
      return 'Invalid email or password';
    }
    if (error.statusCode === 403) {
      return 'Account deactivated';
    }
    return error.message;
  }
  if (error instanceof TypeError) {
    return 'Unable to reach server';
  }
  return getErrorMessage(error);
}
