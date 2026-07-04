export type ISODateString = string;
export type UUID = string;

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export type RecordId = string | number;

export type QueryValue = string | number | boolean | null | undefined;
export type QueryParams = Record<string, QueryValue | QueryValue[]>;

export type RequestMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

export type InsforgeRequestOptions = {
  method?: RequestMethod;
  body?: unknown;
  token?: string;
  apiKey?: string;
  headers?: HeadersInit;
  searchParams?: QueryParams;
  cache?: RequestCache;
};

export type InsforgeMetadata = {
  name: string;
  version: string;
  environment: string;
  database?: {
    host: string;
    port: number;
    database: string;
    ssl: boolean;
  };
  uptime?: number;
  timestamp: ISODateString;
};

export type InsforgeHealth = {
  status: string;
  service?: string;
  timestamp: ISODateString;
};

export type DatabaseTableMetadata = {
  name: string;
  recordCount: number;
};

export type DatabaseMetadata = {
  tables: DatabaseTableMetadata[];
  totalTables: number;
  totalRecords: number;
  databaseSize?: string;
  lastUpdated?: ISODateString;
};

export type InsforgeColumnType =
  | 'string'
  | 'datetime'
  | 'integer'
  | 'float'
  | 'boolean'
  | 'uuid'
  | 'json'
  | 'file';

export type ForeignKeyAction = 'CASCADE' | 'SET NULL' | 'NO ACTION' | 'RESTRICT';

export type CreateTableColumn = {
  name: string;
  type: InsforgeColumnType;
  nullable: boolean;
  unique?: boolean;
  defaultValue?: string;
  foreignKey?: {
    table: string;
    column: string;
    onDelete?: ForeignKeyAction;
  };
};

export type CreateTableInput = {
  tableName: string;
  columns: CreateTableColumn[];
  rlsEnabled?: boolean;
};

export type TableSchema = {
  tableName?: string;
  table_name?: string;
  columns: Array<{
    name: string;
    type: string;
    nullable: boolean;
    unique: boolean;
    default: string | null;
    isPrimaryKey: boolean;
    foreignKey: null | {
      table: string;
      column: string;
      on_delete: string;
    };
  }>;
};

export type MigrationRecord = {
  version: string;
  name: string;
  statements: string[];
  createdAt: ISODateString;
};

export type ExecuteMigrationInput = {
  version: string;
  name: string;
  sql: string;
};

export type KwateProfile = {
  id: UUID;
  user_id: UUID;
  display_name: string;
  avatar_url: string | null;
  zone: string | null;
  phone: string | null;
  phone_verified: boolean;
  rating_average: number | null;
  rating_count: number;
  is_blocked: boolean;
  created_at: ISODateString;
  updated_at: ISODateString;
  deleted_at: ISODateString | null;
};

export type KwatePublicProfile = Pick<
  KwateProfile,
  | 'id'
  | 'user_id'
  | 'display_name'
  | 'avatar_url'
  | 'zone'
  | 'phone_verified'
  | 'rating_average'
  | 'rating_count'
  | 'created_at'
  | 'updated_at'
>;

export type KwateCategory = {
  id: UUID;
  slug: 'service' | 'echange' | 'vente' | string;
  name: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
  enabled: boolean;
  created_at: ISODateString;
  updated_at: ISODateString;
};

export type KwatePostStatus = 'draft' | 'active' | 'paused' | 'sold' | 'blocked' | 'deleted';
export type KwatePostType = 'service' | 'echange' | 'vente';

export type KwatePost = {
  id: UUID;
  owner_id: UUID;
  category_id: UUID;
  type: KwatePostType;
  title: string;
  description: string;
  price_label: string | null;
  zone: string;
  status: KwatePostStatus;
  contact_locked: boolean;
  published_at: ISODateString | null;
  created_at: ISODateString;
  updated_at: ISODateString;
  deleted_at: ISODateString | null;
};

export type KwatePostMedia = {
  id: UUID;
  post_id: UUID;
  owner_id: UUID;
  bucket: string;
  object_key: string;
  public_url: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  width: number | null;
  height: number | null;
  sort_order: number;
  created_at: ISODateString;
};

export type KwateAuditAction =
  | 'auth.signup'
  | 'auth.login'
  | 'auth.logout'
  | 'profile.updated'
  | 'post.created'
  | 'post.updated'
  | 'post.deleted_soft'
  | 'post.reported'
  | 'message.sent'
  | 'pass.checkout_started'
  | 'pass.activated'
  | 'payment.webhook_received'
  | 'admin.post_blocked'
  | 'admin.user_blocked';

export type KwateAuditEvent = {
  id: UUID;
  actor_user_id: UUID | null;
  action: KwateAuditAction | string;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Record<string, JsonValue>;
  request_id: string | null;
  ip_hash: string | null;
  user_agent: string | null;
  created_at: ISODateString;
};
