import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL?.replace(/\/$/, '');
  const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY;
  let backend: { ok: boolean; status?: number; error?: string } = { ok: false, error: 'InsForge non configuré' };

  if (baseUrl && anonKey) {
    try {
      const response = await fetch(`${baseUrl}/api/health`, { headers: { 'X-API-Key': anonKey }, cache: 'no-store' });
      backend = { ok: response.ok, status: response.status };
    } catch (error) {
      backend = { ok: false, error: error instanceof Error ? error.message : 'Backend inaccessible' };
    }
  }

  return NextResponse.json({
    ok: backend.ok,
    service: 'kwate-web',
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? 'unknown',
    backend,
    timestamp: new Date().toISOString(),
  }, { status: backend.ok ? 200 : 503 });
}
