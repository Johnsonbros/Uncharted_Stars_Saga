import assert from "node:assert/strict";
import { test } from "node:test";
import { ProposalStore } from "../src/proposals/proposalStore.js";
import { ProposalTool } from "../src/tools/proposalTool.js";
import { createTestLogger } from "./loggerTestUtils.js";

const createValidInput = () => ({
  title: "New canon event",
  author: { model: "opus", role: "creator" },
  payload: {
    canon_events: [
      {
        event_id: "event-001",
        type: "scene",
        dependencies: ["event-000"],
        content: { summary: "Intro scene" },
      },
    ],
  },
});

const createInvalidInput = () => ({
  title: "Invalid canon event",
  author: { model: "opus", role: "creator" },
  payload: {
    canon_events: [
      {
        event_id: "event-001",
        type: "scene",
        dependencies: ["event-001"],
        content: { summary: "Invalid dependency" },
      },
      {
        event_id: "event-001",
        type: "scene",
        dependencies: ["event-000"],
        content: { summary: "Duplicate ID" },
      },
    ],
  },
});

test("proposal tool response metadata is consistent", async () => {
  const { logger } = createTestLogger();
  const tool = new ProposalTool(new ProposalStore(), logger);
  const response = await tool.createProposal(createValidInput());

  assert.ok(response.proposal_id);
  assert.equal(response.scope, "proposal:create");
  assert.equal(response.validation.status, "passed");
  assert.equal(response.status, "validated");
  assert.ok(response.created_at);
  assert.ok(response.updated_at);
});

test("proposal workflow end-to-end applies validated proposal", async () => {
  const { logger } = createTestLogger();
  const store = new ProposalStore();
  const tool = new ProposalTool(store, logger);

  const created = await tool.createProposal(createValidInput());
  const applied = await tool.applyProposal(created.proposal_id);

  assert.ok(applied);
  assert.equal(applied?.status, "applied");
  assert.equal(applied?.validation.status, "passed");
});

test("canon gate rejects invalid proposals", async () => {
  const { logger } = createTestLogger();
  const store = new ProposalStore();
  const tool = new ProposalTool(store, logger);

  const created = await tool.createProposal(createInvalidInput());
  assert.equal(created.validation.status, "failed");
  assert.equal(created.status, "submitted");

  const applied = await tool.applyProposal(created.proposal_id);
  assert.ok(applied);
  assert.equal(applied?.status, "submitted");
  assert.equal(
    applied?.message,
    "Canon gate failed; proposal cannot be applied.",
  );
});

test("audit log entries are written for proposal lifecycle", async () => {
  const { logger, entries } = createTestLogger();
  const store = new ProposalStore();
  const tool = new ProposalTool(store, logger);

  const created = await tool.createProposal(createValidInput());
  await tool.applyProposal(created.proposal_id);

  const messages = entries.map((entry) => entry.message);
  assert.ok(messages.includes("proposal.created"));
  assert.ok(messages.includes("proposal.validated"));
  assert.ok(messages.includes("proposal.applied"));
});
