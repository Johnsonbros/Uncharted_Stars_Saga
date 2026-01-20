import { pgTable, text, timestamp, uuid, boolean } from "drizzle-orm/pg-core";

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
  proposalId: uuid("proposal_id").notNull(),
  approver: text("approver").notNull().default("creator"),
  note: text("note").default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});
