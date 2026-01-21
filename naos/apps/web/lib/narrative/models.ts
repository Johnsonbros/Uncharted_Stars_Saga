import { z } from "zod";

export const CanonStatusSchema = z.enum(["draft", "proposed", "canon"]);
export type CanonStatus = z.infer<typeof CanonStatusSchema>;

export const EventTypeSchema = z.enum([
  "scene",
  "reveal",
  "conflict",
  "resolution",
  "transition",
  "custom"
]);
export type EventType = z.infer<typeof EventTypeSchema>;

export const ImpactSchema = z.object({
  type: z.string(),
  targetId: z.string(),
  description: z.string().min(1)
});
export type Impact = z.infer<typeof ImpactSchema>;

export const EventSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.coerce.date(),
  type: EventTypeSchema,
  participants: z.array(z.string()).default([]),
  location: z.string(),
  description: z.string().min(1),
  dependencies: z.array(z.string().uuid()).default([]),
  impacts: z.array(ImpactSchema).default([]),
  canonStatus: CanonStatusSchema
});
export type Event = z.infer<typeof EventSchema>;

export const EventInputSchema = EventSchema.omit({ id: true }).extend({
  timestamp: z.coerce.date().optional(),
  canonStatus: CanonStatusSchema.optional()
});
export type EventInput = z.infer<typeof EventInputSchema>;

export const KnowledgeStateSchema = z.object({
  characterId: z.string(),
  eventId: z.string().uuid(),
  learnedAt: z.coerce.date(),
  certainty: z.enum(["known", "suspected", "rumored", "false"]),
  source: z.enum(["witnessed", "told", "inferred"])
});
export type KnowledgeState = z.infer<typeof KnowledgeStateSchema>;

export const PromiseTypeSchema = z.enum([
  "plot_thread",
  "mystery",
  "character_arc",
  "prophecy"
]);
export type PromiseType = z.infer<typeof PromiseTypeSchema>;

export const PromiseStatusSchema = z.enum(["pending", "fulfilled", "broken", "transformed"]);
export type PromiseStatus = z.infer<typeof PromiseStatusSchema>;

export const PromiseRecordSchema = z.object({
  id: z.string().uuid(),
  type: PromiseTypeSchema,
  establishedIn: z.string().uuid(),
  description: z.string().min(1),
  status: PromiseStatusSchema,
  fulfilledIn: z.string().uuid().optional()
});
export type PromiseRecord = z.infer<typeof PromiseRecordSchema>;
