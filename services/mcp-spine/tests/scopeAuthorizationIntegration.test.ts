import assert from "node:assert/strict";
import { test } from "node:test";
import { isAuthorizedForScope } from "../src/scopes/authorization.js";

test("scope authorization rejects forbidden scope access", () => {
  const allowed = isAuthorizedForScope("proposal:create", "creator", "sonnet");
  const rejected = isAuthorizedForScope("proposal:apply", "creator", "sonnet");

  assert.equal(allowed, true);
  assert.equal(rejected, false);
});
