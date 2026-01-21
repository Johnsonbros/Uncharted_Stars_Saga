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

export const KnowledgeCertaintySchema = z.enum(["known", "suspected", "rumored", "false"]);
export type KnowledgeCertainty = z.infer<typeof KnowledgeCertaintySchema>;

export const KnowledgeSourceSchema = z.enum(["witnessed", "told", "inferred"]);
export type KnowledgeSource = z.infer<typeof KnowledgeSourceSchema>;

export const KnowledgeEffectSchema = z.object({
  characterId: z.string(),
  learnedAt: z.coerce.date().optional(),
  certainty: KnowledgeCertaintySchema.default("known"),
  source: KnowledgeSourceSchema.default("witnessed")
});
export type KnowledgeEffect = z.infer<typeof KnowledgeEffectSchema>;

export const EventSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.coerce.date(),
  type: EventTypeSchema,
  participants: z.array(z.string()).default([]),
  location: z.string(),
  description: z.string().min(1),
  dependencies: z.array(z.string().uuid()).default([]),
  impacts: z.array(ImpactSchema).default([]),
  knowledgeEffects: z.array(KnowledgeEffectSchema).default([]),
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
  certainty: KnowledgeCertaintySchema,
  source: KnowledgeSourceSchema
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

export const PromiseIssueSchema = z.object({
  promiseId: z.string().uuid(),
  message: z.string().min(1)
});
export type PromiseIssue = z.infer<typeof PromiseIssueSchema>;

export const ListenerCognitionReportSchema = z.object({
  issues: z.array(z.string()).default([])
});
export type ListenerCognitionReport = z.infer<typeof ListenerCognitionReportSchema>;

export const CanonValidationReportSchema = z.object({
  passed: z.boolean(),
  continuity: z.object({
    dependencyIssues: z.array(z.object({ eventId: z.string(), missingDependencies: z.array(z.string()) })),
    cycleIssues: z.array(z.object({ cycle: z.array(z.string()) })),
    timestampIssues: z.array(z.string())
  }),
  promiseIssues: z.array(PromiseIssueSchema).default([]),
  listenerCognition: ListenerCognitionReportSchema
});
export type CanonValidationReport = z.infer<typeof CanonValidationReportSchema>;
