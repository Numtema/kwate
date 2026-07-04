'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { AuthActionResult, AuthStatus, AuthUser, PublicAuthConfig } from '@/lib/insforge/auth-types';
import { DEFAULT_PUBLIC_AUTH_CONFIG } from '@/lib/insforge/auth-types';
import {
  getCurrentAuthUser,
  getPublicAuthConfig,
  resendVerificationEmail as resendVerificationEmailRequest,
  resetPasswordWithCode,
  resetPasswordWithToken,
  sendResetPasswordEmail,
  signInWithPassword,
  signOutCurrentUser,
  signUpWithPassword,
  verifyEmailCode,
} from '@/lib/insforge/auth-client';
import { hasPublicInsforgeConfig } from '@/lib/insforge/client';

export type AuthContextValue = {
  user: AuthUser | null;
  status: AuthStatus;
  authConfig: PublicAuthConfig;
  configurationError: string | null;
  refreshUser: () => Promise<void>;
  signIn: (input: { email: string; password: string }) => Promise<AuthActionResult<AuthUser>>;
  signUp: (input: { name: string; email: string; password: string; redirectTo?: string }) => Promise<AuthActionResult<{ user: AuthUser | null; requireEmailVerification: boolean }>>;
  signOut: () => Promise<AuthActionResult>;
  verifyEmail: (input: { email: string; otp: string }) => Promise<AuthActionResult<AuthUser>>;
  resendVerification: (input: { email: string; redirectTo?: string }) => Promise<AuthActionResult<{ message: string }>>;
  requestPasswordReset: (input: { email: string; redirectTo?: string }) => Promise<AuthActionResult<{ message: string }>>;
  resetPasswordCode: (input: { email: string; code: string; newPassword: string }) => Promise<AuthActionResult<{ message: string }>>;
  resetPasswordToken: (input: { token: string; newPassword: string }) => Promise<AuthActionResult<{ message: string }>>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [authConfig, setAuthConfig] = useState<PublicAuthConfig>(DEFAULT_PUBLIC_AUTH_CONFIG);
  const [configurationError, setConfigurationError] = useState<string | null>(null);

  const refreshUser = useCallback(async () => {
    if (!hasPublicInsforgeConfig()) {
      setConfigurationError('Renseignez NEXT_PUBLIC_INSFORGE_URL et NEXT_PUBLIC_INSFORGE_ANON_KEY.');
      setStatus('configuration_error');
      return;
    }

    const result = await getCurrentAuthUser();
    if (!result.ok) {
      if (result.code === 'HTTP_401' || result.code === 'UNAUTHORIZED' || result.code === 'INVALID_TOKEN') {
        setUser(null);
        setStatus('anonymous');
        return;
      }

      setUser(null);
      setStatus('anonymous');
      return;
    }

    setUser(result.data);
    setStatus(result.data ? 'authenticated' : 'anonymous');
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      if (!hasPublicInsforgeConfig()) {
        if (!cancelled) {
          setConfigurationError('Configuration InsForge absente dans .env.local.');
          setStatus('configuration_error');
        }
        return;
      }

      const [configResult, userResult] = await Promise.all([
        getPublicAuthConfig(),
        getCurrentAuthUser(),
      ]);

      if (cancelled) return;

      if (configResult.ok) setAuthConfig(configResult.data);
      if (userResult.ok) {
        setUser(userResult.data);
        setStatus(userResult.data ? 'authenticated' : 'anonymous');
      } else {
        setUser(null);
        setStatus('anonymous');
      }
    }

    void bootstrap();
    return () => { cancelled = true; };
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    status,
    authConfig,
    configurationError,
    refreshUser,
    signIn: async (input) => {
      const result = await signInWithPassword(input);
      if (result.ok) {
        setUser(result.data);
        setStatus('authenticated');
      }
      return result;
    },
    signUp: async (input) => {
      const result = await signUpWithPassword(input);
      if (result.ok && result.data.user && !result.data.requireEmailVerification) {
        setUser(result.data.user);
        setStatus('authenticated');
      }
      return result;
    },
    signOut: async () => {
      const result = await signOutCurrentUser();
      if (result.ok) {
        setUser(null);
        setStatus('anonymous');
      }
      return result;
    },
    verifyEmail: async (input) => {
      const result = await verifyEmailCode(input);
      if (result.ok) {
        setUser(result.data);
        setStatus('authenticated');
      }
      return result;
    },
    resendVerification: resendVerificationEmailRequest,
    requestPasswordReset: sendResetPasswordEmail,
    resetPasswordCode: resetPasswordWithCode,
    resetPasswordToken: resetPasswordWithToken,
  }), [user, status, authConfig, configurationError, refreshUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
