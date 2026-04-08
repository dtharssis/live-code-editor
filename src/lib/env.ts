import { z } from 'zod';

const envSchema = z.object({
  // Auth
  NEXTAUTH_URL:           z.string().url().optional(),
  NEXTAUTH_SECRET:        z.string().min(1).optional(),
  GOOGLE_CLIENT_ID:       z.string().min(1).optional(),
  GOOGLE_CLIENT_SECRET:   z.string().min(1).optional(),

  // Database
  DATABASE_URL:           z.string().min(1).optional(),

  // AI
  OPENAI_API_KEY:         z.string().optional(),
  ANTHROPIC_API_KEY:      z.string().optional(),
  AI_MODEL:               z.string().default('gpt-4o'),

  // Billing
  STRIPE_SECRET_KEY:      z.string().optional(),
  STRIPE_WEBHOOK_SECRET:  z.string().optional(),
});

function parseEnv() {
  const result = envSchema.safeParse(process.env);
  if (!result.success && process.env.NODE_ENV === 'production') {
    throw new Error('[env] Invalid environment configuration: ' + result.error.message);
  }
  return (result.data ?? {}) as z.infer<typeof envSchema>;
}

export const env = parseEnv();
