import { z } from "zod";

const EnvSchema = z.object({
  DATABASE_URL: z.string().min(1),
  NAOS_PROJECTS_ROOT: z.string().default("../../projects")
});

export const env = EnvSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  NAOS_PROJECTS_ROOT: process.env.NAOS_PROJECTS_ROOT
});
