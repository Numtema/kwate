export type OAuthProvider =
  | 'google'
  | 'github'
  | 'discord'
  | 'linkedin'
  | 'facebook'
  | 'instagram'
  | 'tiktok'
  | 'apple'
  | 'x'
  | 'spotify'
  | 'microsoft'
  | string;

export type PublicAuthConfig = {
  oAuthProviders: OAuthProvider[];
  customOAuthProviders: string[];
  requireEmailVerification: boolean;
  passwordMinLength: number;
  requireNumber: boolean;
  requireLowercase: boolean;
  requireUppercase: boolean;
  requireSpecialChar: boolean;
  verifyEmailMethod: 'code' | 'link';
  resetPasswordMethod: 'code' | 'link';
  disableSignup: boolean;
};

export type AuthProfile = Record<string, unknown> & {
  name?: string;
  avatar_url?: string | null;
};

export type AuthUser = {
  id: string;
  email: string;
  profile: AuthProfile | null;
  metadata?: Record<string, unknown> | null;
  emailVerified?: boolean;
  providers?: string[];
  createdAt?: string;
  updatedAt?: string;
  name?: string;
};

export type AuthStatus = 'loading' | 'authenticated' | 'anonymous' | 'configuration_error';

export type AuthActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string; code?: string };

export const DEFAULT_PUBLIC_AUTH_CONFIG: PublicAuthConfig = {
  oAuthProviders: [],
  customOAuthProviders: [],
  requireEmailVerification: true,
  passwordMinLength: 8,
  requireNumber: false,
  requireLowercase: false,
  requireUppercase: false,
  requireSpecialChar: false,
  verifyEmailMethod: 'code',
  resetPasswordMethod: 'code',
  disableSignup: false,
};
