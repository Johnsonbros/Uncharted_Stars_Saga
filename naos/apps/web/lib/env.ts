import { z } from "zod";

const EnvSchema = z.object({
  // Database (required for runtime, but provide build-time default)
  DATABASE_URL: z.string().min(1).default("postgresql://localhost:5432/naos"),
  NAOS_PROJECTS_ROOT: z.string().default("../../projects"),

  // Stripe (provide build-time defaults - Replit will override)
  STRIPE_SECRET_KEY: z.string().default("sk_test_placeholder"),
  STRIPE_WEBHOOK_SECRET: z.string().default("whsec_placeholder"),
  STRIPE_PRICE_ID: z.string().default("price_placeholder"),
  STRIPE_SUCCESS_URL: z.string().url().default("http://localhost:3000/checkout/success"),
  STRIPE_CANCEL_URL: z.string().url().default("http://localhost:3000/checkout/cancel"),

  // Internal auth
  ENTITLEMENTS_INTERNAL_TOKEN: z.string().default("internal-token-placeholder"),
  SESSION_SECRET: z.string().min(32).default("default-session-secret-change-in-production-32chars"),
  APP_URL: z.string().url().default("http://localhost:3000"),
  REPLIT_OBJECT_STORAGE_BUCKET: z.string().optional()
});

export const env = EnvSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  NAOS_PROJECTS_ROOT: process.env.NAOS_PROJECTS_ROOT,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  STRIPE_PRICE_ID: process.env.STRIPE_PRICE_ID,
  STRIPE_SUCCESS_URL: process.env.STRIPE_SUCCESS_URL,
  STRIPE_CANCEL_URL: process.env.STRIPE_CANCEL_URL,
  ENTITLEMENTS_INTERNAL_TOKEN: process.env.ENTITLEMENTS_INTERNAL_TOKEN,
  SESSION_SECRET: process.env.SESSION_SECRET,
  APP_URL: process.env.APP_URL,
  REPLIT_OBJECT_STORAGE_BUCKET: process.env.REPLIT_OBJECT_STORAGE_BUCKET
});
