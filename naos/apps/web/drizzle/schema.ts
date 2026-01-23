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
  bigint,
  uniqueIndex
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
export const listenerStatus = pgEnum("listener_status", ["pending", "active", "deleted"]);
export const entitlementStatus = pgEnum("entitlement_status", [
  "active",
  "expired",
  "revoked"
]);

// Story Codex enums
export const codexEntryType = pgEnum("codex_entry_type", [
  "character",
  "location",
  "object",
  "faction",
  "lore",
  "timeline"
]);
export const codexDetectionMode = pgEnum("codex_detection_mode", [
  "include_when_detected",
  "dont_include_when_detected",
  "always_include",
  "never_include"
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
  status: listenerStatus("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});

export const entitlements = pgTable("entitlements", {
  id: uuid("id").defaultRandom().primaryKey(),
  listenerId: uuid("listener_id")
    .notNull()
    .references(() => listeners.id, { onDelete: "cascade", onUpdate: "cascade" }),
  productId: text("product_id").notNull(),
  accessStart: timestamp("access_start", { withTimezone: true }).notNull().defaultNow(),
  accessEnd: timestamp("access_end", { withTimezone: true }),
  status: entitlementStatus("status").notNull().default("active"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  stripeEventId: text("stripe_event_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});

export const playbackPositions = pgTable(
  "playback_positions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    listenerId: uuid("listener_id").references(() => listeners.id, {
      onDelete: "set null",
      onUpdate: "cascade"
    }),
    assetId: text("asset_id").notNull(),
    positionSeconds: integer("position_seconds").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    uniqueListenerAsset: uniqueIndex("playback_positions_listener_asset_unique").on(
      table.listenerId,
      table.assetId
    )
  })
);

export const stripeEvents = pgTable("stripe_events", {
  id: text("id").primaryKey(),
  type: text("type").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

// Session management for listener authentication
export const sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  listenerId: uuid("listener_id")
    .notNull()
    .references(() => listeners.id, { onDelete: "cascade", onUpdate: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

// Magic link tokens for passwordless authentication
export const magicLinks = pgTable("magic_links", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

// Chapters table for audiobook content
export const chapters = pgTable("chapters", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  description: text("description"),
  audioStoragePath: text("audio_storage_path"),
  durationSeconds: integer("duration_seconds").notNull().default(0),
  sequenceOrder: integer("sequence_order").notNull(),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  isPublished: boolean("is_published").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});

// ============================================================================
// STORY CODEX TABLES
// See docs/story_codex_system.md for full documentation
// ============================================================================

// Core codex entries - characters, locations, objects, factions, lore, timelines
export const codexEntries = pgTable("codex_entries", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: text("project_id").notNull(),
  type: codexEntryType("type").notNull(),

  // Names & Detection
  name: text("name").notNull(),
  aliases: text("aliases").array().notNull().default([]),
  detectionMode: codexDetectionMode("detection_mode").notNull().default("include_when_detected"),

  // Content
  summary: text("summary").notNull(),
  description: text("description").notNull(),
  notes: text("notes").default(""),

  // Type-specific data (JSON for flexibility)
  // Character: { role, personality, goals, backstory, physical_description, voice_notes, pov_eligible, first_appearance, arc_stage }
  // Location: { parent_location_id, atmosphere, features, typical_inhabitants, coordinates }
  // Object: { significance_level, current_holder_id, location_id, properties, history }
  // Faction: { ideology, structure, headquarters_id, leader_id, member_ids }
  // Lore: { category, era, implications }
  // Timeline: { date, era, impact, connected_entry_ids }
  typeData: jsonb("type_data").notNull().default({}),

  // Audio integration
  // { voice_profile_id, ambient_profile, sound_effect_tags, pronunciation_guide }
  audioContext: jsonb("audio_context").default({}),

  // Organization
  tags: text("tags").array().notNull().default([]),

  // Canon status
  canonStatus: canonStatus("canon_status").notNull().default("draft"),

  // Metadata
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  createdBy: text("created_by").notNull().default("system")
});

// Relationships between codex entries
export const codexRelationships = pgTable("codex_relationships", {
  id: uuid("id").defaultRandom().primaryKey(),
  sourceId: uuid("source_id")
    .notNull()
    .references(() => codexEntries.id, { onDelete: "cascade", onUpdate: "cascade" }),
  targetId: uuid("target_id")
    .notNull()
    .references(() => codexEntries.id, { onDelete: "cascade", onUpdate: "cascade" }),
  // Relationship types:
  // Character: family, romantic, friend, enemy, colleague, mentor, subordinate, custom
  // Location: contains, adjacent, connected_via
  // Faction: member_of, allied_with, opposed_to, subset_of
  // General: related_to, mentioned_in
  relationshipType: text("relationship_type").notNull(),
  description: text("description").default(""),
  bidirectional: boolean("bidirectional").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

// Manual context pinning - explicitly attach codex entries to scenes
export const sceneCodexContext = pgTable(
  "scene_codex_context",
  {
    sceneId: uuid("scene_id")
      .notNull()
      .references(() => scenes.id, { onDelete: "cascade", onUpdate: "cascade" }),
    codexEntryId: uuid("codex_entry_id")
      .notNull()
      .references(() => codexEntries.id, { onDelete: "cascade", onUpdate: "cascade" }),
    // Priority for context injection (lower = higher priority)
    priority: integer("priority").notNull().default(0),
    reason: text("reason").default("")
  },
  (table) => ({
    pk: primaryKey({ columns: [table.sceneId, table.codexEntryId] })
  })
);

// Extraction jobs - track auto-extraction from uploads
export const codexExtractionJobs = pgTable("codex_extraction_jobs", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: text("project_id").notNull(),
  status: text("status").notNull().default("pending"), // pending, processing, complete, failed
  filesCount: integer("files_count").notNull().default(0),
  wordsProcessed: integer("words_processed").notNull().default(0),
  entriesGenerated: integer("entries_generated").notNull().default(0),
  entriesApproved: integer("entries_approved").notNull().default(0),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true })
});

// Draft entries from extraction - pending human review
export const codexDraftEntries = pgTable("codex_draft_entries", {
  id: uuid("id").defaultRandom().primaryKey(),
  extractionJobId: uuid("extraction_job_id")
    .notNull()
    .references(() => codexExtractionJobs.id, { onDelete: "cascade", onUpdate: "cascade" }),
  type: codexEntryType("type").notNull(),
  name: text("name").notNull(),
  aliases: text("aliases").array().notNull().default([]),
  summary: text("summary").notNull(),
  description: text("description").notNull(),
  typeData: jsonb("type_data").notNull().default({}),
  audioContext: jsonb("audio_context").default({}),

  // Extraction metadata
  confidence: integer("confidence").notNull().default(0), // 0-100
  sources: jsonb("sources").notNull().default([]), // Array of { quote, file, position }
  extractionNotes: text("extraction_notes").default(""),

  // Review status
  reviewStatus: text("review_status").notNull().default("pending"), // pending, approved, rejected, merged
  reviewNotes: text("review_notes").default(""),
  mergedIntoId: uuid("merged_into_id").references(() => codexEntries.id, {
    onDelete: "set null",
    onUpdate: "cascade"
  }),

  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true })
});

// ============================================================================
// AI CONTENT DEVELOPMENT SYSTEM TABLES
// See docs/ai_content_development_system.md for full documentation
// ============================================================================

// Session types for content development
export const contentSessionType = pgEnum("content_session_type", [
  "discovery",
  "development",
  "outline",
  "studio"
]);

// Session status
export const contentSessionStatus = pgEnum("content_session_status", [
  "active",
  "paused",
  "completed",
  "abandoned"
]);

// Outline levels
export const outlineLevel = pgEnum("outline_level", [
  "story",
  "book",
  "act",
  "chapter",
  "scene"
]);

// Outline status
export const outlineStatus = pgEnum("outline_status", [
  "concept",
  "draft",
  "outlined",
  "written",
  "complete"
]);

// Profile update source types
export const profileUpdateSource = pgEnum("profile_update_source", [
  "conversation",
  "writing",
  "manual",
  "extraction"
]);

// Development sessions - Discovery, Development, Outline, and Studio modes
export const contentSessions = pgTable("content_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: text("project_id").notNull(),
  sessionType: contentSessionType("session_type").notNull(),

  // What's being developed
  targetType: text("target_type"), // 'character', 'location', 'book_outline', etc.
  targetId: uuid("target_id"), // Links to codex_entries or outlines table

  // Session state
  status: contentSessionStatus("status").notNull().default("active"),

  // Conversation history (for resuming sessions)
  // Array of { role: 'user' | 'assistant', content: string, timestamp: string }
  conversation: jsonb("conversation").notNull().default([]),

  // Extracted content pending approval
  // Array of { field_path: string, value: any, approved: boolean }
  pendingUpdates: jsonb("pending_updates").notNull().default([]),

  // Completion tracking
  // { field_name: 'complete' | 'partial' | 'incomplete', ... }
  completionStatus: jsonb("completion_status").default({}),

  // Current mode state (for Discovery: threads, concepts; for Development: questions remaining)
  modeState: jsonb("mode_state").default({}),

  // Metadata
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true })
});

// Outline hierarchy - story, book, act, chapter, scene levels
export const outlines = pgTable("outlines", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: text("project_id").notNull(),

  // Hierarchy
  outlineLevel: outlineLevel("outline_level").notNull(),
  parentId: uuid("parent_id").references((): any => outlines.id, {
    onDelete: "cascade",
    onUpdate: "cascade"
  }),
  sequenceOrder: integer("sequence_order").notNull().default(0),

  // Identity
  title: text("title").notNull(),
  subtitle: text("subtitle"),

  // Content - Level-specific structure stored as JSON
  // Story: { logline, core_themes, central_mystery, primary_characters, setting_summary, estimated_length, target_medium }
  // Book: { acts: [...], premise, stakes }
  // Act: { purpose, key_events, character_arcs, promises_established }
  // Chapter: { purpose, chapter_goals, pov_character, scenes: [...] }
  // Scene: { synopsis, scene_goals, beats: [...], promise_tracking, audio_notes }
  content: jsonb("content").notNull().default({}),

  // Narrative context for scenes
  povCharacterId: uuid("pov_character_id").references(() => codexEntries.id, {
    onDelete: "set null",
    onUpdate: "cascade"
  }),
  locationId: uuid("location_id").references(() => codexEntries.id, {
    onDelete: "set null",
    onUpdate: "cascade"
  }),
  timeAnchor: timestamp("time_anchor", { withTimezone: true }),
  timeDescription: text("time_description"),

  // Characters present (for scenes)
  // Array of { character_id: string, role: 'pov' | 'active' | 'background' | 'mentioned' }
  charactersPresent: jsonb("characters_present").default([]),

  // Pinned context entries
  // Array of { codex_entry_id: string, reason: string, priority: number }
  pinnedContext: jsonb("pinned_context").default([]),

  // Estimated metrics
  estimatedWords: integer("estimated_words"),
  estimatedAudioMinutes: integer("estimated_audio_minutes"),

  // Status
  status: outlineStatus("status").notNull().default("draft"),
  canonStatus: canonStatus("canon_status").notNull().default("draft"),

  // Metadata
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});

// Profile update history - tracks changes from content development sessions and writing
export const profileUpdates = pgTable("profile_updates", {
  id: uuid("id").defaultRandom().primaryKey(),
  entryId: uuid("entry_id")
    .notNull()
    .references(() => codexEntries.id, { onDelete: "cascade", onUpdate: "cascade" }),
  sessionId: uuid("session_id").references(() => contentSessions.id, {
    onDelete: "set null",
    onUpdate: "cascade"
  }),

  // What changed
  fieldPath: text("field_path").notNull(), // e.g., 'personality.traits', 'voice.verbal_tics'
  previousValue: jsonb("previous_value"),
  newValue: jsonb("new_value").notNull(),

  // Source
  sourceType: profileUpdateSource("source_type").notNull(),
  sourceReference: text("source_reference"), // scene_id, session_id, or extraction job id

  // Approval
  autoApplied: boolean("auto_applied").notNull().default(false),
  approvedBy: text("approved_by"),
  approvedAt: timestamp("approved_at", { withTimezone: true }),

  // Status
  status: text("status").notNull().default("pending"), // pending, approved, rejected

  // Metadata
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

// Discovery session artifacts - rough concepts captured during discovery mode
export const discoveryArtifacts = pgTable("discovery_artifacts", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("session_id")
    .notNull()
    .references(() => contentSessions.id, { onDelete: "cascade", onUpdate: "cascade" }),

  // Artifact type
  artifactType: text("artifact_type").notNull(), // 'character_sketch', 'setting_concept', 'plot_idea', 'question', 'thread'

  // Content
  name: text("name"),
  notes: text("notes").notNull(),

  // Questions to explore
  openQuestions: text("open_questions").array().default([]),

  // Potential connections to existing entries
  potentialConnections: jsonb("potential_connections").default([]),

  // Whether this has been developed into a full entry
  developedIntoId: uuid("developed_into_id").references(() => codexEntries.id, {
    onDelete: "set null",
    onUpdate: "cascade"
  }),

  // Metadata
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

// Studio writing sessions - tracks writing context and progress
export const studioSessions = pgTable("studio_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  contentSessionId: uuid("content_session_id")
    .notNull()
    .references(() => contentSessions.id, { onDelete: "cascade", onUpdate: "cascade" }),
  outlineId: uuid("outline_id")
    .notNull()
    .references(() => outlines.id, { onDelete: "cascade", onUpdate: "cascade" }),

  // Current position in the scene
  currentBeat: integer("current_beat").notNull().default(0),
  totalBeats: integer("total_beats").notNull().default(0),

  // Written content
  writtenProse: text("written_prose").default(""),

  // Assembled context snapshot (for consistency checking)
  contextSnapshot: jsonb("context_snapshot").default({}),

  // Profile discoveries during writing
  // Array of { character_id, field_path, value, type: 'discovery' | 'relationship' | 'knowledge' }
  profileDiscoveries: jsonb("profile_discoveries").default([]),

  // Consistency issues found
  // Array of { type, description, suggestion, resolved }
  consistencyIssues: jsonb("consistency_issues").default([]),

  // Metadata
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});

// Note: Indexes for content development tables are defined via SQL migrations
// See migrations/ folder for CREATE INDEX statements for:
// - idx_content_sessions_project, idx_content_sessions_status, idx_content_sessions_type
// - idx_outlines_project, idx_outlines_parent, idx_outlines_level
// - idx_profile_updates_entry, idx_profile_updates_session
// - idx_discovery_artifacts_session
// These were moved from standalone Drizzle index exports to migrations for better compatibility.
