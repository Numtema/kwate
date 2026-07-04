import type { AuthActionResult } from '@/lib/insforge/auth-types';

export type InsforgeAuthErrorLike = {
  error?: string;
  code?: string;
  message?: string;
  statusCode?: number;
  nextActions?: string;
};

const FRIENDLY_MESSAGES: Record<string, string> = {
  INVALID_CREDENTIALS: 'Email ou mot de passe incorrect.',
  EMAIL_NOT_VERIFIED: 'Veuillez vérifier votre adresse email avant de vous connecter.',
  USER_ALREADY_EXISTS: 'Un compte existe déjà avec cette adresse email.',
  SIGNUP_DISABLED: 'Les nouvelles inscriptions sont temporairement désactivées.',
  INVALID_INPUT: 'Certaines informations sont invalides.',
  INVALID_OTP: 'Le code saisi est incorrect ou a expiré.',
  TOKEN_EXPIRED: 'Ce lien ou ce code a expiré. Demandez-en un nouveau.',
  RATE_LIMITED: 'Trop de tentatives. Réessayez dans quelques instants.',
  NETWORK_ERROR: 'Connexion au service impossible. Vérifiez votre réseau.',
};

export function authFailure(error: unknown, fallback: string): AuthActionResult<never> {
  const value = (error ?? {}) as InsforgeAuthErrorLike;
  const code = value.error ?? value.code ?? 'AUTH_ERROR';

  return {
    ok: false,
    code,
    error: FRIENDLY_MESSAGES[code] ?? value.message ?? fallback,
  };
}
