import { describe, it } from "node:test";
import assert from "node:assert";
import { isAuthorizedForScope } from "../src/scopes/authorization.js";

describe("Audio Tools Integration", () => {
  describe("Scope authorization for audio tools", () => {
    it("allows creator role to generate audio packets", () => {
      assert.strictEqual(isAuthorizedForScope("audio:generate", "creator", "sonnet"), true);
    });

    it("allows creator role to audit listener confusion", () => {
      assert.strictEqual(isAuthorizedForScope("audio:audit", "creator", "sonnet"), true);
    });

    it("allows automation_service role to generate audio packets", () => {
      assert.strictEqual(isAuthorizedForScope("audio:generate", "automation_service", "opus"), true);
    });

    it("allows editor_reviewer role to audit but not generate", () => {
      assert.strictEqual(isAuthorizedForScope("audio:audit", "editor_reviewer", "sonnet"), true);
      assert.strictEqual(isAuthorizedForScope("audio:generate", "editor_reviewer", "sonnet"), false);
    });

    it("denies listener_support role access to audio tools", () => {
      assert.strictEqual(isAuthorizedForScope("audio:generate", "listener_support", "haiku"), false);
      assert.strictEqual(isAuthorizedForScope("audio:audit", "listener_support", "haiku"), false);
    });

    it("allows opus model to generate and audit audio", () => {
      assert.strictEqual(isAuthorizedForScope("audio:generate", "creator", "opus"), true);
      assert.strictEqual(isAuthorizedForScope("audio:audit", "creator", "opus"), true);
    });

    it("allows sonnet model to generate and audit audio", () => {
      assert.strictEqual(isAuthorizedForScope("audio:generate", "creator", "sonnet"), true);
      assert.strictEqual(isAuthorizedForScope("audio:audit", "creator", "sonnet"), true);
    });

    it("allows haiku model to audit but not generate", () => {
      assert.strictEqual(isAuthorizedForScope("audio:audit", "creator", "haiku"), true);
      assert.strictEqual(isAuthorizedForScope("audio:generate", "creator", "haiku"), false);
    });
  });
});
