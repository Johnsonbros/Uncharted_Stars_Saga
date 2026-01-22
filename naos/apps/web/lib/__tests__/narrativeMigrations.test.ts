import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const migrationPath = new URL(
  "../../drizzle/migrations/0000_narrative_db.sql",
  import.meta.url
);

describe("narrative DB migration", () => {
  it("defines core enums and tables", async () => {
    const sql = await readFile(migrationPath, "utf-8");

    expect(sql).toContain("CREATE TYPE canon_status");
    expect(sql).toContain("CREATE TYPE knowledge_certainty");
    expect(sql).toContain("CREATE TYPE knowledge_source");
    expect(sql).toContain("CREATE TYPE promise_type");
    expect(sql).toContain("CREATE TYPE promise_status");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS events");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS event_dependencies");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS knowledge_states");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS promises");
  });

  it("prevents canon mutation via triggers", async () => {
    const sql = await readFile(migrationPath, "utf-8");

    expect(sql).toContain("CREATE OR REPLACE FUNCTION prevent_canon_mutation");
    expect(sql).toContain(
      "CREATE TRIGGER events_prevent_canon_mutation"
    );
    expect(sql).toContain(
      "CREATE TRIGGER knowledge_states_prevent_canon_mutation"
    );
    expect(sql).toContain(
      "CREATE TRIGGER promises_prevent_canon_mutation"
    );
    expect(sql).toContain(
      "CREATE TRIGGER event_dependencies_prevent_canon_mutation"
    );
  });

  it("defines foreign keys and enum-backed columns", async () => {
    const sql = await readFile(migrationPath, "utf-8");

    expect(sql).toContain(
      "event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE ON UPDATE CASCADE"
    );
    expect(sql).toContain(
      "depends_on_event_id UUID NOT NULL REFERENCES events(id) ON DELETE RESTRICT ON UPDATE CASCADE"
    );
    expect(sql).toContain(
      "event_id UUID NOT NULL REFERENCES events(id) ON DELETE RESTRICT ON UPDATE CASCADE"
    );
    expect(sql).toContain("canon_status canon_status NOT NULL DEFAULT 'draft'");
    expect(sql).toContain("certainty knowledge_certainty NOT NULL");
    expect(sql).toContain("source knowledge_source NOT NULL");
    expect(sql).toContain("type promise_type NOT NULL");
    expect(sql).toContain("status promise_status NOT NULL");
  });
});
