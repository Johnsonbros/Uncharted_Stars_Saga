import assert from "node:assert/strict";
import { test } from "node:test";
import { resolveResource } from "../src/resources/resourceResolver.js";

test("resource resolver allows authorized access", () => {
  const result = resolveResource({
    resourceId: "narrative.events",
    role: "creator",
    model: "haiku",
  });

  assert.equal(result.resourceId, "narrative.events");
  assert.equal(result.version, "v1");
  assert.deepEqual(result.data, { events: [] });
});

test("resource resolver blocks unauthorized access", () => {
  assert.throws(() => {
    resolveResource({
      resourceId: "narrative.events",
      role: "listener_support",
      model: undefined,
    });
  }, /Unauthorized/);
});
