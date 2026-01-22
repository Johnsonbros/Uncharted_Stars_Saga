import assert from "node:assert/strict";
import { test } from "node:test";
import { getRoleScopes } from "../src/scopes/scopeUtils.js";
import { getModelScopes } from "../src/models/modelRegistry.js";

test("scope authorization returns role scopes", () => {
  const creatorScopes = getRoleScopes("creator");
  assert.ok(creatorScopes.includes("proposal:create"));
  assert.ok(creatorScopes.includes("narrative:read"));
  assert.ok(creatorScopes.includes("proposal:validate"));
});

test("scope authorization returns empty list for unknown role", () => {
  assert.deepEqual(getRoleScopes("unknown" as "creator"), []);
  assert.deepEqual(getRoleScopes(), []);
});

test("scope authorization returns model scopes", () => {
  const haikuScopes = getModelScopes("haiku");
  assert.deepEqual(haikuScopes, ["narrative:read"]);
});
