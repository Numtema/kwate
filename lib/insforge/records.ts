import { insforgeClient } from './client';
import type { InsforgeRequestOptions, RecordId } from './types';

export type RegisteredTableName =
  | 'profiles'
  | 'categories'
  | 'posts'
  | 'post_media'
  | 'audit_events'
  | 'saved_posts'
  | 'reports'
  | 'conversations'
  | 'conversation_members'
  | 'messages'
  | 'billing_entitlements'
  | 'contact_unlocks'
  | string;

export type SortDirection = 'asc' | 'desc';
export type RecordOrder = `${string}.${SortDirection}`;

export type RecordFilterOperator =
  | 'eq'
  | 'neq'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'like'
  | 'ilike'
  | 'is'
  | 'in';

export type RecordFilter = {
  field: string;
  operator: RecordFilterOperator;
  value: string | number | boolean | null;
};

export type QueryRecordsInput = {
  tableName: RegisteredTableName;
  limit?: number;
  offset?: number;
  order?: RecordOrder;
  select?: string[];
  filters?: RecordFilter[];
};

export type CreateRecordsInput<TRecord extends object> = {
  tableName: RegisteredTableName;
  records: TRecord[];
  returnRepresentation?: boolean;
};

export type UpdateRecordsInput<TPatch extends object> = {
  tableName: RegisteredTableName;
  filters: RecordFilter[];
  patch: TPatch;
  returnRepresentation?: boolean;
};

export type DeleteRecordsInput = {
  tableName: RegisteredTableName;
  filters: RecordFilter[];
  returnRepresentation?: boolean;
  hardDeleteApproved?: boolean;
};

function assertSafeLimit(limit: number | undefined) {
  if (limit === undefined) return 100;
  if (limit < 1) return 1;
  if (limit > 1000) return 1000;
  return limit;
}

function encodeFilter(filter: RecordFilter) {
  return `${filter.operator}.${String(filter.value)}`;
}

function buildRecordsQuery(input: QueryRecordsInput) {
  const params = new URLSearchParams();

  params.set('limit', String(assertSafeLimit(input.limit)));
  params.set('offset', String(input.offset ?? 0));

  if (input.order) params.set('order', input.order);
  if (input.select?.length) params.set('select', input.select.join(','));

  for (const filter of input.filters ?? []) {
    params.set(filter.field, encodeFilter(filter));
  }

  return params.toString();
}

function preferHeaders(returnRepresentation?: boolean): HeadersInit | undefined {
  return returnRepresentation ? { Prefer: 'return=representation' } : undefined;
}

function assertHasFilters(filters: RecordFilter[] | undefined, operation: string) {
  if (!filters?.length) {
    throw new Error(`${operation} requires at least one strict filter`);
  }
}

export function queryRecords<TRecord>(input: QueryRecordsInput, options?: Omit<InsforgeRequestOptions, 'method' | 'body'>) {
  const query = buildRecordsQuery(input);
  return insforgeClient.get<TRecord[]>(`/api/database/records/${encodeURIComponent(input.tableName)}?${query}`, options);
}

export function createRecords<TRecord extends object>(
  input: CreateRecordsInput<TRecord>,
  options?: Omit<InsforgeRequestOptions, 'method' | 'body'>,
) {
  if (!Array.isArray(input.records) || input.records.length === 0) {
    throw new Error('createRecords requires a non-empty array body');
  }

  return insforgeClient.post<TRecord[]>(
    `/api/database/records/${encodeURIComponent(input.tableName)}`,
    input.records,
    {
      ...options,
      headers: {
        ...preferHeaders(input.returnRepresentation),
        ...options?.headers,
      },
    },
  );
}

export function updateRecords<TPatch extends object, TRecord = unknown>(
  input: UpdateRecordsInput<TPatch>,
  options?: Omit<InsforgeRequestOptions, 'method' | 'body'>,
) {
  assertHasFilters(input.filters, 'updateRecords');
  const query = buildRecordsQuery({ tableName: input.tableName, filters: input.filters });

  return insforgeClient.patch<TRecord[]>(
    `/api/database/records/${encodeURIComponent(input.tableName)}?${query}`,
    input.patch,
    {
      ...options,
      headers: {
        ...preferHeaders(input.returnRepresentation),
        ...options?.headers,
      },
    },
  );
}

export function deleteRecords<TRecord = unknown>(
  input: DeleteRecordsInput,
  options?: Omit<InsforgeRequestOptions, 'method' | 'body'>,
) {
  assertHasFilters(input.filters, 'deleteRecords');

  if (!input.hardDeleteApproved) {
    throw new Error('Hard delete is blocked. Use soft delete via deleted_at or pass explicit approval.');
  }

  const query = buildRecordsQuery({ tableName: input.tableName, filters: input.filters });

  return insforgeClient.delete<TRecord[]>(
    `/api/database/records/${encodeURIComponent(input.tableName)}?${query}`,
    undefined,
    {
      ...options,
      headers: {
        ...preferHeaders(input.returnRepresentation),
        ...options?.headers,
      },
    },
  );
}

export function createRecordsClient(tableName: RegisteredTableName) {
  return {
    list: <TRecord>(input?: Omit<QueryRecordsInput, 'tableName'>, options?: Omit<InsforgeRequestOptions, 'method' | 'body'>) =>
      queryRecords<TRecord>({ tableName, ...input }, options),

    getById: <TRecord>(id: RecordId, options?: Omit<InsforgeRequestOptions, 'method' | 'body'>) =>
      queryRecords<TRecord>(
        {
          tableName,
          limit: 1,
          filters: [{ field: 'id', operator: 'eq', value: String(id) }],
        },
        options,
      ),

    create: <TRecord extends object>(
      records: TRecord[],
      options?: Omit<InsforgeRequestOptions, 'method' | 'body'>,
    ) => createRecords<TRecord>({ tableName, records, returnRepresentation: true }, options),

    updateWhere: <TPatch extends object, TRecord = unknown>(
      filters: RecordFilter[],
      patch: TPatch,
      options?: Omit<InsforgeRequestOptions, 'method' | 'body'>,
    ) => updateRecords<TPatch, TRecord>({ tableName, filters, patch, returnRepresentation: true }, options),

    softDeleteById: <TRecord = unknown>(id: RecordId, options?: Omit<InsforgeRequestOptions, 'method' | 'body'>) =>
      updateRecords<{ deleted_at: string }, TRecord>(
        {
          tableName,
          filters: [{ field: 'id', operator: 'eq', value: String(id) }],
          patch: { deleted_at: new Date().toISOString() },
          returnRepresentation: true,
        },
        options,
      ),
  };
}

export const kwateRecords = {
  profiles: createRecordsClient('profiles'),
  categories: createRecordsClient('categories'),
  posts: createRecordsClient('posts'),
  postMedia: createRecordsClient('post_media'),
  auditEvents: createRecordsClient('audit_events'),
  savedPosts: createRecordsClient('saved_posts'),
  reports: createRecordsClient('reports'),
  conversations: createRecordsClient('conversations'),
  conversationMembers: createRecordsClient('conversation_members'),
  messages: createRecordsClient('messages'),
  billingEntitlements: createRecordsClient('billing_entitlements'),
  contactUnlocks: createRecordsClient('contact_unlocks'),
};
