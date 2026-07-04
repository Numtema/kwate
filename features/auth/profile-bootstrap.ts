import type { InsForgeClient } from '@insforge/sdk';
import type { AuthUser } from '@/lib/insforge/auth-types';
import { getAuthDisplayName } from './adapters';

/**
 * Best-effort synchronization between InsForge Auth and KWATE's app-owned
 * profiles table. Authentication must never fail only because the Step 3
 * migration has not yet been applied.
 */
export async function ensureKwateProfile(client: InsForgeClient, user: AuthUser) {
  try {
    const { data, error } = await client.database
      .from('profiles')
      .select('id,user_id')
      .eq('user_id', user.id)
      .limit(1);

    if (error || (Array.isArray(data) && data.length > 0)) return;

    await client.database.from('profiles').insert([
      {
        user_id: user.id,
        display_name: getAuthDisplayName(user).slice(0, 80),
        avatar_url: user.profile && typeof user.profile.avatar_url === 'string'
          ? user.profile.avatar_url
          : null,
      },
    ]);
  } catch {
    // Non-blocking by design. Schema connectivity is validated in Step 5.
  }
}
