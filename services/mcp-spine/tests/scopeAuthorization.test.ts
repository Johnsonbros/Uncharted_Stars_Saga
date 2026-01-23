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
  assert.deepEqual(haikuScopes, ["narrative:read", "audio:audit", "audio:scene:read"]);
});

test("scope authorization includes audio scene scopes for creator role", () => {
  const creatorScopes = getRoleScopes("creator");
  assert.ok(creatorScopes.includes("audio:scene:create"));
  assert.ok(creatorScopes.includes("audio:scene:read"));
  assert.ok(creatorScopes.includes("audio:scene:update"));
  assert.ok(creatorScopes.includes("audio:scene:delete"));
});

test("scope authorization includes audio scene read for editor_reviewer role", () => {
  const editorScopes = getRoleScopes("editor_reviewer");
  assert.ok(editorScopes.includes("audio:scene:read"));
  assert.ok(!editorScopes.includes("audio:scene:create"));
  assert.ok(!editorScopes.includes("audio:scene:update"));
  assert.ok(!editorScopes.includes("audio:scene:delete"));
});

test("scope authorization includes full audio scene scopes for automation_service", () => {
  const automationScopes = getRoleScopes("automation_service");
  assert.ok(automationScopes.includes("audio:scene:create"));
  assert.ok(automationScopes.includes("audio:scene:read"));
  assert.ok(automationScopes.includes("audio:scene:update"));
  assert.ok(automationScopes.includes("audio:scene:delete"));
});

test("scope authorization includes audio scene scopes for opus model", () => {
  const opusScopes = getModelScopes("opus");
  assert.ok(opusScopes.includes("audio:scene:create"));
  assert.ok(opusScopes.includes("audio:scene:read"));
  assert.ok(opusScopes.includes("audio:scene:update"));
  assert.ok(!opusScopes.includes("audio:scene:delete"));
});

test("scope authorization includes audio scene scopes for sonnet model", () => {
  const sonnetScopes = getModelScopes("sonnet");
  assert.ok(sonnetScopes.includes("audio:scene:create"));
  assert.ok(sonnetScopes.includes("audio:scene:read"));
  assert.ok(sonnetScopes.includes("audio:scene:update"));
  assert.ok(!sonnetScopes.includes("audio:scene:delete"));
});
