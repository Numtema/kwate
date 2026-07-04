import 'server-only';

export * from './admin-client';

import { insforgeAdmin } from './admin-client';
import type { DatabaseMetadata, InsforgeMetadata } from './types';

export function getInsforgeMetadata() {
  return insforgeAdmin.get<InsforgeMetadata>('/api/metadata');
}

export function getInsforgeDatabaseMetadata() {
  return insforgeAdmin.get<DatabaseMetadata>('/api/metadata/database');
}
