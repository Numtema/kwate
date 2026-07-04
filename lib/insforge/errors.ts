export type AppError = {
  code: string;
  message: string;
  status?: number;
  nextAction?: string;
  details?: unknown;
};

export type AppResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: AppError };

export type InsforgeErrorResponse = {
  error?: string;
  code?: string;
  message?: string;
  statusCode?: number;
  nextAction?: string;
  nextActions?: string;
  details?: unknown;
};

export function isAppError(value: unknown): value is AppError {
  return Boolean(
    value &&
      typeof value === 'object' &&
      'code' in value &&
      'message' in value,
  );
}

export function toAppError(error: unknown, fallbackCode = 'UNKNOWN_ERROR'): AppError {
  if (isAppError(error)) return error;

  if (error instanceof Error) {
    return {
      code: fallbackCode,
      message: error.message,
    };
  }

  if (typeof error === 'string') {
    return {
      code: fallbackCode,
      message: error,
    };
  }

  return {
    code: fallbackCode,
    message: 'Unexpected error',
    details: error,
  };
}

export async function errorFromResponse(response: Response): Promise<AppError> {
  const json = (await response.json().catch(() => null)) as InsforgeErrorResponse | null;

  return {
    code: json?.error ?? json?.code ?? `HTTP_${response.status}`,
    message: json?.message ?? response.statusText ?? 'InsForge request failed',
    status: json?.statusCode ?? response.status,
    nextAction: json?.nextAction ?? json?.nextActions,
    details: json?.details ?? json,
  };
}

export function ok<T>(data: T): AppResult<T> {
  return { ok: true, data };
}

export function fail<T = never>(error: unknown, fallbackCode?: string): AppResult<T> {
  return { ok: false, error: toAppError(error, fallbackCode) };
}
