import { errorFromResponse, type AppResult } from './errors';
import type { InsforgeRequestOptions, QueryParams } from './types';

const PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_INSFORGE_URL;
const PUBLIC_ANON_KEY = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY;

export type PublicInsforgeEnv = {
  baseUrl: string;
  anonKey: string;
};

export function hasPublicInsforgeConfig() {
  return Boolean(PUBLIC_BASE_URL && PUBLIC_ANON_KEY);
}

export function getPublicInsforgeEnv(): PublicInsforgeEnv {
  if (!PUBLIC_BASE_URL) {
    throw new Error('Missing NEXT_PUBLIC_INSFORGE_URL');
  }

  if (!PUBLIC_ANON_KEY) {
    throw new Error('Missing NEXT_PUBLIC_INSFORGE_ANON_KEY');
  }

  return {
    baseUrl: PUBLIC_BASE_URL.replace(/\/$/, ''),
    anonKey: PUBLIC_ANON_KEY,
  };
}

function withSearchParams(path: string, params?: QueryParams) {
  if (!params) return path;

  const urlSearchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== undefined) urlSearchParams.append(key, String(item));
      });
      continue;
    }

    urlSearchParams.set(key, value === null ? 'null' : String(value));
  }

  const query = urlSearchParams.toString();
  return query ? `${path}${path.includes('?') ? '&' : '?'}${query}` : path;
}

export async function insforgeFetch<T>(
  path: string,
  options: InsforgeRequestOptions = {},
): Promise<AppResult<T>> {
  const env = getPublicInsforgeEnv();
  const headers = new Headers(options.headers);

  headers.set('Accept', 'application/json');
  headers.set('Content-Type', 'application/json');
  headers.set('X-API-Key', options.apiKey ?? env.anonKey);

  if (options.token) {
    headers.set('Authorization', `Bearer ${options.token}`);
  }

  const response = await fetch(`${env.baseUrl}${withSearchParams(path, options.searchParams)}`, {
    method: options.method ?? (options.body === undefined ? 'GET' : 'POST'),
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    cache: options.cache ?? 'no-store',
  });

  if (!response.ok) {
    return { ok: false, error: await errorFromResponse(response) };
  }

  const data = (await response.json().catch(() => null)) as T;
  return { ok: true, data };
}

export const insforgeClient = {
  get: <T>(path: string, options?: Omit<InsforgeRequestOptions, 'method' | 'body'>) =>
    insforgeFetch<T>(path, { ...options, method: 'GET' }),

  post: <T>(path: string, body: unknown, options?: Omit<InsforgeRequestOptions, 'method' | 'body'>) =>
    insforgeFetch<T>(path, { ...options, method: 'POST', body }),

  patch: <T>(path: string, body: unknown, options?: Omit<InsforgeRequestOptions, 'method' | 'body'>) =>
    insforgeFetch<T>(path, { ...options, method: 'PATCH', body }),

  put: <T>(path: string, body: unknown, options?: Omit<InsforgeRequestOptions, 'method' | 'body'>) =>
    insforgeFetch<T>(path, { ...options, method: 'PUT', body }),

  delete: <T>(path: string, body?: unknown, options?: Omit<InsforgeRequestOptions, 'method' | 'body'>) =>
    insforgeFetch<T>(path, { ...options, method: 'DELETE', body }),
};
