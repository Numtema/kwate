import type { AuthUser, PublicAuthConfig } from '@/lib/insforge/auth-types';
import { DEFAULT_PUBLIC_AUTH_CONFIG } from '@/lib/insforge/auth-types';

export function normalizeAuthUser(user: unknown): AuthUser | null {
  if (!user || typeof user !== 'object') return null;

  const value = user as Record<string, unknown>;
  if (typeof value.id !== 'string' || typeof value.email !== 'string') return null;

  return {
    id: value.id,
    email: value.email,
    profile: value.profile && typeof value.profile === 'object'
      ? (value.profile as AuthUser['profile'])
      : null,
    metadata: value.metadata && typeof value.metadata === 'object'
      ? (value.metadata as Record<string, unknown>)
      : null,
    emailVerified: typeof value.emailVerified === 'boolean' ? value.emailVerified : undefined,
    providers: Array.isArray(value.providers) ? value.providers.filter((item): item is string => typeof item === 'string') : undefined,
    createdAt: typeof value.createdAt === 'string' ? value.createdAt : undefined,
    updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : undefined,
    name: typeof value.name === 'string' ? value.name : undefined,
  };
}

export function getAuthDisplayName(user: AuthUser | null) {
  if (!user) return 'Utilisateur KWATE';

  const profileName = user.profile && typeof user.profile.name === 'string'
    ? user.profile.name
    : null;

  return profileName ?? user.name ?? user.email.split('@')[0] ?? user.email;
}

export function getAuthAvatar(user: AuthUser | null) {
  if (!user?.profile || typeof user.profile.avatar_url !== 'string') return null;
  return user.profile.avatar_url;
}

export function normalizePublicAuthConfig(config: unknown): PublicAuthConfig {
  if (!config || typeof config !== 'object') return DEFAULT_PUBLIC_AUTH_CONFIG;

  const value = config as Record<string, unknown>;
  const providers = Array.isArray(value.oAuthProviders) ? value.oAuthProviders : [];
  const customProviders = Array.isArray(value.customOAuthProviders) ? value.customOAuthProviders : [];

  return {
    ...DEFAULT_PUBLIC_AUTH_CONFIG,
    oAuthProviders: providers.filter((item): item is string => typeof item === 'string'),
    customOAuthProviders: customProviders.filter((item): item is string => typeof item === 'string'),
    requireEmailVerification: typeof value.requireEmailVerification === 'boolean'
      ? value.requireEmailVerification
      : DEFAULT_PUBLIC_AUTH_CONFIG.requireEmailVerification,
    passwordMinLength: typeof value.passwordMinLength === 'number'
      ? value.passwordMinLength
      : DEFAULT_PUBLIC_AUTH_CONFIG.passwordMinLength,
    requireNumber: Boolean(value.requireNumber),
    requireLowercase: Boolean(value.requireLowercase),
    requireUppercase: Boolean(value.requireUppercase),
    requireSpecialChar: Boolean(value.requireSpecialChar),
    verifyEmailMethod: value.verifyEmailMethod === 'link' ? 'link' : 'code',
    resetPasswordMethod: value.resetPasswordMethod === 'link' ? 'link' : 'code',
    disableSignup: Boolean(value.disableSignup),
  };
}
