import { z } from "zod";

const EnvSchema = z.object({
  DATABASE_URL: z.string().min(1),
  NAOS_PROJECTS_ROOT: z.string().default("../../projects"),
  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().min(1),
  STRIPE_PRICE_ID: z.string().min(1),
  STRIPE_SUCCESS_URL: z.string().url(),
  STRIPE_CANCEL_URL: z.string().url(),
  ENTITLEMENTS_INTERNAL_TOKEN: z.string().min(1)
});

export const env = EnvSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  NAOS_PROJECTS_ROOT: process.env.NAOS_PROJECTS_ROOT,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  STRIPE_PRICE_ID: process.env.STRIPE_PRICE_ID,
  STRIPE_SUCCESS_URL: process.env.STRIPE_SUCCESS_URL,
  STRIPE_CANCEL_URL: process.env.STRIPE_CANCEL_URL,
  ENTITLEMENTS_INTERNAL_TOKEN: process.env.ENTITLEMENTS_INTERNAL_TOKEN
});
