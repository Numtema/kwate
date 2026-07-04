import { z } from 'zod';

export const emailSchema = z.string().trim().email('Adresse email invalide.').max(320);

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Mot de passe requis.').max(128),
});

export const signUpSchema = z.object({
  name: z.string().trim().min(2, 'Le nom doit contenir au moins 2 caractères.').max(80),
  email: emailSchema,
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères.').max(128),
});

export const verifyEmailSchema = z.object({
  email: emailSchema,
  otp: z.string().trim().regex(/^\d{6}$/, 'Le code doit contenir 6 chiffres.'),
});

export const sendResetPasswordSchema = z.object({
  email: emailSchema,
});

export const codeResetPasswordSchema = z.object({
  email: emailSchema,
  code: z.string().trim().regex(/^\d{6}$/, 'Le code doit contenir 6 chiffres.'),
  newPassword: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères.').max(128),
});

export const tokenResetPasswordSchema = z.object({
  token: z.string().min(1, 'Jeton de réinitialisation manquant.'),
  newPassword: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères.').max(128),
});

export function firstZodError(error: z.ZodError) {
  return error.issues[0]?.message ?? 'Données invalides.';
}
