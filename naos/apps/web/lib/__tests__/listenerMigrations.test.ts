import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const migrationPath = new URL(
  "../../drizzle/migrations/0002_listener_db.sql",
  import.meta.url
);

describe("listener DB migration", () => {
  it("defines listener enums and tables", async () => {
    const sql = await readFile(migrationPath, "utf-8");

    expect(sql).toContain("CREATE TYPE listener_status");
    expect(sql).toContain("CREATE TYPE entitlement_status");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS listeners");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS entitlements");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS playback_positions");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS stripe_events");
  });

  it("defines key constraints and references", async () => {
    const sql = await readFile(migrationPath, "utf-8");

    expect(sql).toContain(
      "listener_id UUID NOT NULL REFERENCES listeners(id) ON DELETE CASCADE ON UPDATE CASCADE"
    );
    expect(sql).toContain(
      "CONSTRAINT playback_positions_unique_listener_asset UNIQUE (listener_id, asset_id)"
    );
    expect(sql).toContain("email TEXT NOT NULL UNIQUE");
    expect(sql).toContain("status listener_status NOT NULL DEFAULT 'pending'");
    expect(sql).toContain("status entitlement_status NOT NULL DEFAULT 'active'");
  });
});
