'use client';

import { createClient, type InsForgeClient } from '@insforge/sdk';
import { getPublicInsforgeEnv } from './client';

let browserClient: InsForgeClient | null = null;

/**
 * Lazily creates the official InsForge browser SDK client.
 * The SDK keeps the access token in memory and relies on the InsForge
 * httpOnly refresh cookie; no auth token is written to localStorage.
 */
export function getInsforgeBrowserClient(): InsForgeClient {
  if (browserClient) return browserClient;

  const { baseUrl, anonKey } = getPublicInsforgeEnv();
  browserClient = createClient({
    baseUrl,
    anonKey,
    auth: { detectOAuthCallback: true },
  });

  return browserClient;
}
