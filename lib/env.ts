import { z } from 'zod';

// ═══════════════════════════════════════════════════════════════
// Environment Variable Validation
// ═══════════════════════════════════════════════════════════════
// Import this file early in your app to catch missing env vars.
// Usage: import '@/lib/env' at the top of layout.tsx or a server component.

const envSchema = z.object({
  // Required
  ANTHROPIC_API_KEY: z
    .string()
    .min(1, 'ANTHROPIC_API_KEY is required — get one at console.anthropic.com')
    .startsWith('sk-ant-', 'ANTHROPIC_API_KEY should start with sk-ant-'),
  DATABASE_URL: z
    .string()
    .min(1, 'DATABASE_URL is required — provide a PostgreSQL connection string')
    .startsWith('postgresql', 'DATABASE_URL must be a PostgreSQL connection string'),
  ADMIN_SECRET: z
    .string()
    .min(8, 'ADMIN_SECRET must be at least 8 characters'),

  // Optional
  BLOB_READ_WRITE_TOKEN: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional().default('http://localhost:3000'),
  NEXT_PUBLIC_APP_NAME: z.string().optional().default('ColorLab AI'),
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missing = error.issues
        .map((i) => `  ✗ ${i.path.join('.')}: ${i.message}`)
        .join('\n');
      console.error(
        `\n❌ Environment validation failed:\n${missing}\n\n` +
        `Copy .env.example to .env.local and fill in required values.\n`
      );
    }
    // Don't crash during build — only warn
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Missing required environment variables');
    }
    return process.env as unknown as Env;
  }
}

export const env = validateEnv();
