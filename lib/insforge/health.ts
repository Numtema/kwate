import { insforgeClient } from './client';
import type { InsforgeHealth } from './types';

export function getInsforgeHealth() {
  return insforgeClient.get<InsforgeHealth>('/api/health');
}
