import {
  pgTable,
  text,
  timestamp,
  uuid,
  boolean,
  pgEnum,
  jsonb,
  primaryKey,
  integer,
  bigint
} from "drizzle-orm/pg-core";

export const canonStatus = pgEnum("canon_status", ["draft", "proposed", "canon"]);
export const knowledgeCertainty = pgEnum("knowledge_certainty", [
  "known",
  "suspected",
  "rumored",
  "false"
]);
export const knowledgeSource = pgEnum("knowledge_source", ["witnessed", "told", "inferred"]);
export const promiseType = pgEnum("promise_type", [
  "plot_thread",
  "mystery",
  "character_arc",
  "prophecy"
]);
export const promiseStatus = pgEnum("promise_status", [
  "pending",
  "fulfilled",
  "broken",
  "transformed"
]);

export const proposals = pgTable("proposals", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: text("project_id").notNull(),
  sceneId: text("scene_id").notNull(),
  scenePath: text("scene_path").notNull(),
  baseSha256: text("base_sha256"),
  proposedContent: text("proposed_content").notNull(),
  rationale: text("rationale").default(""),
  isApproved: boolean("is_approved").notNull().default(false),
  isApplied: boolean("is_applied").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  approvedAt: timestamp("approved_at", { withTimezone: true }),
  appliedAt: timestamp("applied_at", { withTimezone: true })
});

export const approvals = pgTable("approvals", {
  id: uuid("id").defaultRandom().primaryKey(),
  proposalId: uuid("proposal_id")
    .notNull()
    .references(() => proposals.id, { onDelete: "cascade", onUpdate: "cascade" }),
  approver: text("approver").notNull().default("creator"),
  note: text("note").default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

export const events = pgTable("events", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: text("project_id").notNull(),
  timestamp: timestamp("timestamp", { withTimezone: true }).notNull(),
  type: text("type").notNull(),
  participants: text("participants").array().notNull().default([]),
  location: text("location"),
  description: text("description").notNull(),
  impacts: jsonb("impacts").notNull().default([]),
  canonStatus: canonStatus("canon_status").notNull().default("draft"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});

export const eventDependencies = pgTable(
  "event_dependencies",
  {
    eventId: uuid("event_id").notNull().references(() => events.id, {
      onDelete: "cascade",
      onUpdate: "cascade"
    }),
    dependsOnEventId: uuid("depends_on_event_id")
      .notNull()
      .references(() => events.id, {
        onDelete: "restrict",
        onUpdate: "cascade"
      })
  },
  (table) => ({
    pk: primaryKey({ columns: [table.eventId, table.dependsOnEventId] })
  })
);

export const knowledgeStates = pgTable("knowledge_states", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: text("project_id").notNull(),
  characterId: text("character_id").notNull(),
  eventId: uuid("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "restrict", onUpdate: "cascade" }),
  learnedAt: timestamp("learned_at", { withTimezone: true }).notNull(),
  certainty: knowledgeCertainty("certainty").notNull(),
  source: knowledgeSource("source").notNull(),
  canonStatus: canonStatus("canon_status").notNull().default("draft"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});

export const promises = pgTable("promises", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: text("project_id").notNull(),
  type: promiseType("type").notNull(),
  establishedInScene: text("established_in_scene").notNull(),
  description: text("description").notNull(),
  status: promiseStatus("status").notNull(),
  fulfilledInScene: text("fulfilled_in_scene"),
  canonStatus: canonStatus("canon_status").notNull().default("draft"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});

export const scenes = pgTable("scenes", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: text("project_id").notNull(),
  chapterId: text("chapter_id").notNull(),
  sequenceOrder: integer("sequence_order").notNull(),
  narrativeText: text("narrative_text"),
  canonStatus: canonStatus("canon_status").notNull().default("draft"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});

export const sceneEvents = pgTable(
  "scene_events",
  {
    sceneId: uuid("scene_id")
      .notNull()
      .references(() => scenes.id, { onDelete: "cascade", onUpdate: "cascade" }),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade", onUpdate: "cascade" })
  },
  (table) => ({
    pk: primaryKey({ columns: [table.sceneId, table.eventId] })
  })
);

export const audioMasters = pgTable("audio_masters", {
  id: uuid("id").defaultRandom().primaryKey(),
  chapterId: text("chapter_id").notNull(),
  storagePath: text("storage_path").notNull(),
  durationSeconds: integer("duration_seconds").notNull(),
  fileSizeBytes: bigint("file_size_bytes", { mode: "number" }).notNull(),
  format: text("format").notNull(),
  sampleRate: integer("sample_rate").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

export const audioSceneObjects = pgTable("audio_scene_objects", {
  id: uuid("id").defaultRandom().primaryKey(),
  sceneId: uuid("scene_id")
    .notNull()
    .references(() => scenes.id, { onDelete: "cascade", onUpdate: "cascade" }),
  narrationText: text("narration_text").notNull(),
  voiceProfileId: text("voice_profile_id").notNull(),
  beatMarkers: jsonb("beat_markers").notNull(),
  emotionalEnvelope: jsonb("emotional_envelope").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

export const listeners = pgTable("listeners", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

export const entitlements = pgTable("entitlements", {
  id: uuid("id").defaultRandom().primaryKey(),
  listenerId: uuid("listener_id")
    .notNull()
    .references(() => listeners.id, { onDelete: "cascade", onUpdate: "cascade" }),
  entitlementType: text("entitlement_type").notNull(),
  grantedAt: timestamp("granted_at", { withTimezone: true }).notNull(),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

export const playbackProgress = pgTable(
  "playback_progress",
  {
    listenerId: uuid("listener_id")
      .notNull()
      .references(() => listeners.id, { onDelete: "cascade", onUpdate: "cascade" }),
    chapterId: text("chapter_id").notNull(),
    positionSeconds: integer("position_seconds").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    pk: primaryKey({ columns: [table.listenerId, table.chapterId] })
  })
);
