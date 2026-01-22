import assert from "node:assert/strict";
import { test } from "node:test";
import { ProposalStore } from "../src/proposals/proposalStore.js";
import { validateProposalSchema } from "../src/proposals/proposalSchemaValidator.js";

const createValidProposal = () => {
  const store = new ProposalStore();
  return store.create({
    title: "Add canon event",
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
};

test("proposal schema validator accepts valid proposal", () => {
  const proposal = createValidProposal();
  const result = validateProposalSchema(proposal);
  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, []);
});

test("proposal schema validator flags invalid proposals", () => {
  const proposal = createValidProposal();
  const invalid = { ...proposal, title: "" };
  const result = validateProposalSchema(invalid);
  assert.equal(result.valid, false);
  assert.ok(result.errors.length > 0);
});
