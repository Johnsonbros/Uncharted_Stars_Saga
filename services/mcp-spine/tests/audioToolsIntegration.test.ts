import { describe, it, expect } from "@jest/globals";
import { isAuthorizedForScope } from "../src/scopes/authorization.js";

describe("Audio Tools Integration", () => {
  describe("Scope authorization for audio tools", () => {
    it("allows creator role to generate audio packets", () => {
      expect(isAuthorizedForScope("audio:generate", "creator", "sonnet")).toBe(true);
    });

    it("allows creator role to audit listener confusion", () => {
      expect(isAuthorizedForScope("audio:audit", "creator", "sonnet")).toBe(true);
    });

    it("allows automation_service role to generate audio packets", () => {
      expect(isAuthorizedForScope("audio:generate", "automation_service", "opus")).toBe(true);
    });

    it("allows editor_reviewer role to audit but not generate", () => {
      expect(isAuthorizedForScope("audio:audit", "editor_reviewer", "sonnet")).toBe(true);
      expect(isAuthorizedForScope("audio:generate", "editor_reviewer", "sonnet")).toBe(false);
    });

    it("denies listener_support role access to audio tools", () => {
      expect(isAuthorizedForScope("audio:generate", "listener_support", "haiku")).toBe(false);
      expect(isAuthorizedForScope("audio:audit", "listener_support", "haiku")).toBe(false);
    });

    it("allows opus model to generate and audit audio", () => {
      expect(isAuthorizedForScope("audio:generate", "creator", "opus")).toBe(true);
      expect(isAuthorizedForScope("audio:audit", "creator", "opus")).toBe(true);
    });

    it("allows sonnet model to generate and audit audio", () => {
      expect(isAuthorizedForScope("audio:generate", "creator", "sonnet")).toBe(true);
      expect(isAuthorizedForScope("audio:audit", "creator", "sonnet")).toBe(true);
    });

    it("allows haiku model to audit but not generate", () => {
      expect(isAuthorizedForScope("audio:audit", "creator", "haiku")).toBe(true);
      expect(isAuthorizedForScope("audio:generate", "creator", "haiku")).toBe(false);
    });
  });
});
