import { z } from 'zod';

export const createPostSchema = z.object({
  type: z.enum(['service', 'echange', 'vente']),
  title: z.string().trim().min(5, 'Le titre doit contenir au moins 5 caractères.').max(140),
  description: z.string().trim().min(20, 'La description doit contenir au moins 20 caractères.').max(5000),
  priceLabel: z.string().trim().max(120).nullable().optional(),
  zone: z.string().trim().min(2, 'Indiquez une zone.').max(120),
});

export const reportPostSchema = z.object({
  postId: z.string().uuid(),
  reason: z.enum(['spam', 'fraud', 'prohibited', 'abuse', 'duplicate', 'other']),
  details: z.string().trim().max(1000).optional(),
});
