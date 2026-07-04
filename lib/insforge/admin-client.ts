import 'server-only';

import { errorFromResponse, type AppResult } from './errors';
import type {
  CreateTableInput,
  DatabaseMetadata,
  ExecuteMigrationInput,
  InsforgeMetadata,
  InsforgeRequestOptions,
  MigrationRecord,
  QueryParams,
  TableSchema,
} from './types';

const ADMIN_BASE_URL = process.env.INSFORGE_API_BASE_URL;
const ADMIN_TOKEN = process.env.INSFORGE_ADMIN_TOKEN;
const ADMIN_API_KEY = process.env.INSFORGE_API_KEY;

export type ServerInsforgeEnv = {
  baseUrl: string;
  adminToken?: string;
  apiKey?: string;
};

export function hasServerInsforgeConfig() {
  return Boolean(ADMIN_BASE_URL && (ADMIN_TOKEN || ADMIN_API_KEY));
}

export function getServerInsforgeEnv(): ServerInsforgeEnv {
  if (!ADMIN_BASE_URL) {
    throw new Error('Missing INSFORGE_API_BASE_URL');
  }

  if (!ADMIN_TOKEN && !ADMIN_API_KEY) {
    throw new Error('Missing INSFORGE_ADMIN_TOKEN or INSFORGE_API_KEY');
  }

  return {
    baseUrl: ADMIN_BASE_URL.replace(/\/$/, ''),
    adminToken: ADMIN_TOKEN || undefined,
    apiKey: ADMIN_API_KEY || undefined,
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

export async function insforgeAdminFetch<T>(
  path: string,
  options: InsforgeRequestOptions = {},
): Promise<AppResult<T>> {
  const env = getServerInsforgeEnv();
  const headers = new Headers(options.headers);

  headers.set('Accept', 'application/json');
  headers.set('Content-Type', 'application/json');

  if (env.adminToken) headers.set('Authorization', `Bearer ${env.adminToken}`);
  if (env.apiKey) headers.set('X-API-Key', env.apiKey);

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

export const insforgeAdmin = {
  get: <T>(path: string, options?: Omit<InsforgeRequestOptions, 'method' | 'body'>) =>
    insforgeAdminFetch<T>(path, { ...options, method: 'GET' }),

  post: <T>(path: string, body: unknown, options?: Omit<InsforgeRequestOptions, 'method' | 'body'>) =>
    insforgeAdminFetch<T>(path, { ...options, method: 'POST', body }),

  patch: <T>(path: string, body: unknown, options?: Omit<InsforgeRequestOptions, 'method' | 'body'>) =>
    insforgeAdminFetch<T>(path, { ...options, method: 'PATCH', body }),

  put: <T>(path: string, body: unknown, options?: Omit<InsforgeRequestOptions, 'method' | 'body'>) =>
    insforgeAdminFetch<T>(path, { ...options, method: 'PUT', body }),

  delete: <T>(path: string, body?: unknown, options?: Omit<InsforgeRequestOptions, 'method' | 'body'>) =>
    insforgeAdminFetch<T>(path, { ...options, method: 'DELETE', body }),
};

export const insforgeAdminOps = {
  metadata: () => insforgeAdmin.get<InsforgeMetadata>('/api/metadata'),
  databaseMetadata: () => insforgeAdmin.get<DatabaseMetadata>('/api/metadata/database'),
  listTables: () => insforgeAdmin.get<string[]>('/api/database/tables'),
  createTable: (input: CreateTableInput) =>
    insforgeAdmin.post<{ message: string; tableName?: string; table_name?: string }>(
      '/api/database/tables',
      input,
    ),
  getTableSchema: (tableName: string) =>
    insforgeAdmin.get<TableSchema>(`/api/database/tables/${encodeURIComponent(tableName)}/schema`),
  updateTableSchema: (tableName: string, input: unknown) =>
    insforgeAdmin.patch<{ message: string; tableName: string; operations: string[] }>(
      `/api/database/tables/${encodeURIComponent(tableName)}/schema`,
      input,
    ),
  deleteTable: (tableName: string) =>
    insforgeAdmin.delete<{ message: string; tableName?: string; table_name?: string }>(
      `/api/database/tables/${encodeURIComponent(tableName)}`,
    ),
  listMigrations: () =>
    insforgeAdmin.get<{ migrations: MigrationRecord[] }>('/api/database/migrations'),
  executeMigration: (input: ExecuteMigrationInput) =>
    insforgeAdmin.post<MigrationRecord & { message: string }>('/api/database/migrations', input),
};
