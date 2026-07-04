'use client';

import { getInsforgeBrowserClient } from './sdk-browser';
import type { AuthActionResult, AuthUser, PublicAuthConfig } from './auth-types';
import { authFailure } from '@/features/auth/errors';
import { normalizeAuthUser, normalizePublicAuthConfig } from '@/features/auth/adapters';
import { ensureKwateProfile } from '@/features/auth/profile-bootstrap';

export async function getPublicAuthConfig(): Promise<AuthActionResult<PublicAuthConfig>> {
  try {
    const client = getInsforgeBrowserClient();
    const { data, error } = await client.auth.getPublicAuthConfig();
    if (error) return authFailure(error, 'Impossible de charger la configuration d’authentification.');
    return { ok: true, data: normalizePublicAuthConfig(data) };
  } catch (error) {
    return authFailure(error, 'Configuration InsForge manquante.');
  }
}

export async function getCurrentAuthUser(): Promise<AuthActionResult<AuthUser | null>> {
  try {
    const client = getInsforgeBrowserClient();
    const { data, error } = await client.auth.getCurrentUser();
    if (error) return authFailure(error, 'Impossible de restaurer la session.');

    const user = normalizeAuthUser(data?.user);
    if (user) await ensureKwateProfile(client, user);
    return { ok: true, data: user };
  } catch (error) {
    return authFailure(error, 'Configuration InsForge manquante.');
  }
}

export async function signInWithPassword(input: {
  email: string;
  password: string;
}): Promise<AuthActionResult<AuthUser>> {
  try {
    const client = getInsforgeBrowserClient();
    const { data, error } = await client.auth.signInWithPassword(input);
    if (error) return authFailure(error, 'Connexion impossible.');

    const user = normalizeAuthUser(data?.user);
    if (!user) return { ok: false, code: 'INVALID_AUTH_RESPONSE', error: 'Réponse de connexion invalide.' };

    await ensureKwateProfile(client, user);
    return { ok: true, data: user };
  } catch (error) {
    return authFailure(error, 'Connexion impossible.');
  }
}

export async function signUpWithPassword(input: {
  name: string;
  email: string;
  password: string;
  redirectTo?: string;
}): Promise<AuthActionResult<{ user: AuthUser | null; requireEmailVerification: boolean }>> {
  try {
    const client = getInsforgeBrowserClient();
    const { data, error } = await client.auth.signUp(input);
    if (error) return authFailure(error, 'Création du compte impossible.');

    const user = normalizeAuthUser(data?.user);
    const requireEmailVerification = Boolean(data?.requireEmailVerification);

    if (user && data?.accessToken) await ensureKwateProfile(client, user);

    return { ok: true, data: { user, requireEmailVerification } };
  } catch (error) {
    return authFailure(error, 'Création du compte impossible.');
  }
}

export async function signOutCurrentUser(): Promise<AuthActionResult> {
  try {
    const client = getInsforgeBrowserClient();
    const { error } = await client.auth.signOut();
    if (error) return authFailure(error, 'Déconnexion impossible.');
    return { ok: true, data: undefined };
  } catch (error) {
    return authFailure(error, 'Déconnexion impossible.');
  }
}

export async function verifyEmailCode(input: {
  email: string;
  otp: string;
}): Promise<AuthActionResult<AuthUser>> {
  try {
    const client = getInsforgeBrowserClient();
    const { data, error } = await client.auth.verifyEmail(input);
    if (error) return authFailure(error, 'Vérification impossible.');

    const user = normalizeAuthUser(data?.user);
    if (!user) return { ok: false, code: 'INVALID_AUTH_RESPONSE', error: 'Réponse de vérification invalide.' };

    await ensureKwateProfile(client, user);
    return { ok: true, data: user };
  } catch (error) {
    return authFailure(error, 'Vérification impossible.');
  }
}

export async function resendVerificationEmail(input: {
  email: string;
  redirectTo?: string;
}): Promise<AuthActionResult<{ message: string }>> {
  try {
    const client = getInsforgeBrowserClient();
    const { data, error } = await client.auth.resendVerificationEmail(input);
    if (error) return authFailure(error, 'Envoi du code impossible.');
    return { ok: true, data: { message: data?.message ?? 'Email de vérification envoyé.' } };
  } catch (error) {
    return authFailure(error, 'Envoi du code impossible.');
  }
}

export async function sendResetPasswordEmail(input: {
  email: string;
  redirectTo?: string;
}): Promise<AuthActionResult<{ message: string }>> {
  try {
    const client = getInsforgeBrowserClient();
    const { data, error } = await client.auth.sendResetPasswordEmail(input);
    if (error) return authFailure(error, 'Envoi de l’email impossible.');
    return { ok: true, data: { message: data?.message ?? 'Email de réinitialisation envoyé.' } };
  } catch (error) {
    return authFailure(error, 'Envoi de l’email impossible.');
  }
}

export async function resetPasswordWithCode(input: {
  email: string;
  code: string;
  newPassword: string;
}): Promise<AuthActionResult<{ message: string }>> {
  try {
    const client = getInsforgeBrowserClient();
    const exchange = await client.auth.exchangeResetPasswordToken({
      email: input.email,
      code: input.code,
    });
    if (exchange.error) return authFailure(exchange.error, 'Code invalide ou expiré.');
    if (!exchange.data?.token) return { ok: false, code: 'RESET_TOKEN_MISSING', error: 'Jeton de réinitialisation manquant.' };

    const reset = await client.auth.resetPassword({
      newPassword: input.newPassword,
      otp: exchange.data.token,
    });
    if (reset.error) return authFailure(reset.error, 'Réinitialisation impossible.');

    return { ok: true, data: { message: reset.data?.message ?? 'Mot de passe modifié.' } };
  } catch (error) {
    return authFailure(error, 'Réinitialisation impossible.');
  }
}

export async function resetPasswordWithToken(input: {
  token: string;
  newPassword: string;
}): Promise<AuthActionResult<{ message: string }>> {
  try {
    const client = getInsforgeBrowserClient();
    const { data, error } = await client.auth.resetPassword({
      newPassword: input.newPassword,
      otp: input.token,
    });
    if (error) return authFailure(error, 'Réinitialisation impossible.');
    return { ok: true, data: { message: data?.message ?? 'Mot de passe modifié.' } };
  } catch (error) {
    return authFailure(error, 'Réinitialisation impossible.');
  }
}
