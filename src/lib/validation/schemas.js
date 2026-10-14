import { z } from "zod";
import { SUPPORTED_LOCALES } from "@/lib/constants";

/**
 * Shared zod validation schemas (typed data contracts) used by services
 * and route handlers. Protecting against mass assignment: only these fields
 * are accepted, so clients can never set roles, ownership, or internal flags.
 */

export const localeSchema = z.enum(SUPPORTED_LOCALES);

export function localized(content) {
  const shape = {};
  for (const locale of SUPPORTED_LOCALES) shape[locale] = content;
  return z.object(shape);
}

// ---------------------------------------------------------------------------
// Auth / admins
// ---------------------------------------------------------------------------

export const loginSchema = z.object({
  email: z.string().trim().email("A valid email address is required.").max(190),
  password: z.string().min(1, "Password is required.").max(512),
});

export const changeOwnPasswordSchema = z.object({
  currentPassword: z.string().min(1).max(512),
  newPassword: z
    .string()
    .min(12, "New password must be at least 12 characters.")
    .max(256),
});

export const adminCreateSchema = z.object({
  email: z.string().trim().email().max(190),
  name: z.string().trim().min(1).max(120),
  password: z.string().min(12).max(256),
  role: z.enum(["ADMIN", "OWNER"]).optional(),
});

export const adminUpdateSchema = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    isActive: z.boolean().optional(),
    role: z.enum(["ADMIN", "OWNER"]).optional(),
  })
  .strict();

export const adminResetPasswordSchema = z.object({
  newPassword: z.string().min(12, "Password must be at least 12 characters.").max(256),
});

// ---------------------------------------------------------------------------
// Catalog
// ---------------------------------------------------------------------------

export const categoryLocalesSchema = localized(
  z.object({
    title: z.string().trim().min(1).max(120),
    description: z.string().trim().max(500).optional().or(z.literal("")),
  })
);

export const categoryUpsertSchema = z
  .object({
    slug: z.string().regex(/^[a-z0-9-]+$/, "Slug may only contain lowercase letters, numbers and hyphens.").min(1).max(120),
    sortOrder: z.coerce.number().int().min(-10000).max(10000).default(0),
    isActive: z.boolean().default(true),
    locales: categoryLocalesSchema,
  })
  .strict();

export const useCasesSchema = z
  .array(
    z.object({
      title: z.string().trim().min(1).max(200),
      description: z.string().trim().max(2000).optional().or(z.literal("")),
    })
  )
  .max(20)
  .optional();

export const productLocalesSchema = localized(
  z.object({
    title: z.string().trim().min(1).max(200),
    tagline: z.string().trim().max(300).optional().or(z.literal("")),
    shortDescription: z.string().trim().max(600).optional().or(z.literal("")),
    description: z.string().trim().max(20000).optional().or(z.literal("")),
    targetAudience: z.string().trim().max(600).optional().or(z.literal("")),
    useCases: useCasesSchema,
    ctaText: z.string().trim().max(60).optional().or(z.literal("")),
    seoTitle: z.string().trim().max(200).optional().or(z.literal("")),
    seoDescription: z.string().trim().max(300).optional().or(z.literal("")),
  })
);

export const featuresSchema = localized(z.array(z.string().trim().min(1).max(500)).max(50));

export const productUpsertSchema = z
  .object({
    slug: z.string().regex(/^[a-z0-9-]+$/, "Slug may only contain lowercase letters, numbers and hyphens.").min(1).max(120),
    status: z.enum(["DRAFT", "UPCOMING", "AVAILABLE", "ARCHIVED"]).default("DRAFT"),
    categoryId: z.string().cuid().nullable().optional(),
    sortOrder: z.coerce.number().int().min(-10000).max(10000).default(0),
    locales: productLocalesSchema,
    features: featuresSchema.optional(),
  })
  .strict();

export const packageDataSchema = z
  .object({
    useCases: useCasesSchema,
    included: z.array(z.string().trim().min(1).max(500)).max(50).optional(),
  })
  .passthrough();

export const packageLocalesSchema = localized(
  z.object({
    title: z.string().trim().min(1).max(200),
    tagline: z.string().trim().max(300).optional().or(z.literal("")),
    description: z.string().trim().max(20000).optional().or(z.literal("")),
    priceLabel: z.string().trim().max(60).optional().or(z.literal("")),
    ctaText: z.string().trim().max(60).optional().or(z.literal("")),
    seoTitle: z.string().trim().max(200).optional().or(z.literal("")),
    seoDescription: z.string().trim().max(300).optional().or(z.literal("")),
    data: packageDataSchema.optional(),
  })
);

export const packageUpsertSchema = z
  .object({
    slug: z.string().regex(/^[a-z0-9-]+$/, "Slug may only contain lowercase letters, numbers and hyphens.").min(1).max(120),
    kind: z.enum(["PACKAGE", "MAINTENANCE"]).default("PACKAGE"),
    status: z.enum(["DRAFT", "AVAILABLE", "ARCHIVED"]).default("DRAFT"),
    productId: z.string().cuid().nullable().optional(),
    pricingModel: z.enum(["QUOTE", "FIXED"]).default("QUOTE"),
    billingPeriod: z.enum(["ONE_TIME", "MONTHLY", "YEARLY"]).default("ONE_TIME"),
    priceAmount: z.coerce.number().nonnegative().max(100000000).nullable().optional(),
    currency: z.string().trim().max(8).optional().or(z.literal("")),
    sortOrder: z.coerce.number().int().min(-10000).max(10000).default(0),
    locales: packageLocalesSchema,
    features: featuresSchema.optional(),
  })
  .strict();

// ---------------------------------------------------------------------------
// Content
// ---------------------------------------------------------------------------

export const pageLocalesSchema = localized(
  z.object({
    title: z.string().trim().max(300),
    subtitle: z.string().trim().max(600).optional().or(z.literal("")),
    body: z.string().trim().max(50000).optional().or(z.literal("")),
    seoTitle: z.string().trim().max(200).optional().or(z.literal("")),
    seoDescription: z.string().trim().max(300).optional().or(z.literal("")),
  })
);

export const pageUpsertSchema = z
  .object({
    key: z
      .string()
      .regex(/^[a-z0-9-]+$/, "Key may only contain lowercase letters, numbers and hyphens.")
      .min(1)
      .max(120),
    isActive: z.boolean().default(true),
    locales: pageLocalesSchema,
  })
  .strict();

export const settingPatchSchema = z
  .object({
    values: z.array(
      z.object({
        key: z.string().min(1).max(120),
        locale: z.string().min(1).max(10),
        value: z.unknown(),
      })
    ).max(50),
  })
  .strict();

// ---------------------------------------------------------------------------
// Inquiries
// ---------------------------------------------------------------------------

export const inquiryUpdateSchema = z
  .object({
    status: z.enum(["NEW", "READ", "IN_PROGRESS", "RESOLVED", "SPAM", "ARCHIVED"]).optional(),
    adminNote: z.string().trim().max(5000).optional(),
  })
  .strict();

export const inquiryReplySchema = z
  .object({
    subject: z.string().trim().min(1).max(300),
    body: z.string().trim().min(1).max(10000),
  })
  .strict();

// ---------------------------------------------------------------------------
// Public endpoints
// ---------------------------------------------------------------------------

export const contactSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required.").max(120),
    email: z.string().trim().email("A valid email is required.").max(190),
    company: z.string().trim().max(120).optional().or(z.literal("")),
    subject: z.string().trim().max(300).optional().or(z.literal("")),
    message: z.string().trim().min(5, "Message must be at least 5 characters.").max(4000),
    pageRef: z.string().trim().max(300).optional().or(z.literal("")),
    locale: localeSchema.optional(),
    /**
     * Spam honeypot. Hidden from real users; bots tend to fill every field.
     * Any non-empty value marks the submission as spam (silently dropped).
     */
    honeypot: z.string().max(200).optional().or(z.literal("")),
  })
  .strict();

export const analyticsSchema = z
  .object({
    name: z
      .string()
      .trim()
      .regex(/^[a-z0-9_.-]{1,64}$/, "Invalid event name.")
      .default("pageview"),
    path: z.string().trim().max(500).default("/"),
    referrer: z.string().trim().max(500).optional().or(z.literal("")),
    locale: localeSchema.optional(),
    device: z.enum(["mobile", "tablet", "desktop", "other"]).optional(),
    sessionId: z.string().trim().max(64).optional(),
    props: z
      .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
      .refine((obj) => Object.keys(obj).length <= 20, "At most 20 event properties.")
      .optional(),
  })
  .strict();