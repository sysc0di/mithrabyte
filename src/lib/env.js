import { z } from "zod";
import { SUPPORTED_LOCALES } from "@/lib/constants";

/**
 * Validated server environment configuration.
 * Never import this module from client components or public static pages.
 */

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  DATABASE_URL: z
    .string()
    .min(1, "DATABASE_URL is required (see .env.example)")
    .refine((v) => v.startsWith("postgresql://") || v.startsWith("postgres://"), {
      message: "DATABASE_URL must be a PostgreSQL connection string",
    }),

  ADMIN_INIT_EMAIL: z.string().email().optional(),
  ADMIN_INIT_PASSWORD: z.string().min(12).optional(),
  ADMIN_INIT_NAME: z.string().min(1).optional(),

  /** Reduce Argon2 cost outside production to speed up local workflows. */
  ARGON2_LOOSE_COST: z.string().optional(),

  ADMIN_SESSION_TTL_DAYS: z.coerce.number().int().min(1).max(365).default(30),
  CONTACT_RATE_LIMIT: z.coerce.number().int().min(1).max(1000).default(10),
  ANALYTICS_RATE_LIMIT: z.coerce.number().int().min(1).max(10000).default(120),

  /** Comma-separated list of locales used for localized content editing. */
  SUPPORTED_LOCALES: z.string().default(SUPPORTED_LOCALES.join(",")),

  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  NEXT_PUBLIC_GTM_ID: z.string().optional(),

  /** Optional contact-form email notifications. Absent => notifications skipped. */
  RESEND_API_KEY: z.string().optional(),
  INQUIRY_FROM_EMAIL: z.string().min(1).optional(),
  INQUIRY_NOTIFY_EMAIL: z.string().min(1).optional(),

  /** Hostinger-compatible SMTP settings, used for admin inquiry replies. */
  SMTP_HOST: z.string().min(1).optional(),
  SMTP_PORT: z.coerce.number().int().min(1).max(65535).default(587),
  SMTP_USER: z.string().min(1).optional(),
  SMTP_PASSWORD: z.string().min(1).optional(),
  SMTP_FROM_EMAIL: z.string().min(1).optional(),
  SMTP_FROM_NAME: z.string().min(1).optional(),
  SMTP_SECURE: z.enum(["true", "false"]).optional(),
});

function parseEnv() {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  return parsed.data;
}

/** Lazily parsed, cached environment. */
let cached;
export function getEnv() {
  if (!cached) cached = parseEnv();
  return cached;
}
