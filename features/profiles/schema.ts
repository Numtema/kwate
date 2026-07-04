import { z } from 'zod';

export const updateProfileSchema = z.object({
  displayName: z.string().trim().min(2).max(80),
  zone: z.string().trim().max(120).nullable().optional(),
  phone: z.string().trim().max(32).nullable().optional(),
  bio: z.string().trim().max(500).nullable().optional(),
  avatarUrl: z.string().url().nullable().optional(),
});
