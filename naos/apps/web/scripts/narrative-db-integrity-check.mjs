import pg from "pg";

const { Client } = pg;

const requiredEnv = "DATABASE_URL";

if (!process.env[requiredEnv]) {
  throw new Error(`${requiredEnv} is required to run integrity checks.`);
}

const client = new Client({ connectionString: process.env.DATABASE_URL });

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

const expectFailure = async (fn, message) => {
  try {
    await fn();
  } catch (error) {
    return;
  }
  throw new Error(message);
};

const querySingleValue = async (sql, params = []) => {
  const result = await client.query(sql, params);
  return result.rows[0]?.value;
};

const main = async () => {
  await client.connect();

  const enumChecks = [
    "canon_status",
    "knowledge_certainty",
    "knowledge_source",
    "promise_type",
    "promise_status"
  ];

  for (const enumName of enumChecks) {
    const value = await querySingleValue(
      `SELECT EXISTS (
         SELECT 1
         FROM pg_type
         WHERE typname = $1
       ) AS value`,
      [enumName]
    );
    assert(value === true, `Missing enum type: ${enumName}`);
  }

  const fkChecks = [
    {
      constraint: "event_dependencies_event_id_fkey",
      table: "event_dependencies"
    },
    {
      constraint: "event_dependencies_depends_on_event_id_fkey",
      table: "event_dependencies"
    },
    {
      constraint: "knowledge_states_event_id_fkey",
      table: "knowledge_states"
    }
  ];

  for (const { constraint, table } of fkChecks) {
    const value = await querySingleValue(
      `SELECT EXISTS (
         SELECT 1
         FROM information_schema.table_constraints
         WHERE constraint_name = $1
           AND table_name = $2
           AND constraint_type = 'FOREIGN KEY'
       ) AS value`,
      [constraint, table]
    );
    assert(value === true, `Missing foreign key: ${constraint}`);
  }

  const checkConstraint = await querySingleValue(
    `SELECT EXISTS (
       SELECT 1
       FROM information_schema.table_constraints
       WHERE constraint_name = 'event_dependencies_not_self'
         AND table_name = 'event_dependencies'
         AND constraint_type = 'CHECK'
     ) AS value`
  );
  assert(checkConstraint === true, "Missing event dependency self-check constraint.");

  const triggerChecks = [
    "events_prevent_canon_mutation",
    "knowledge_states_prevent_canon_mutation",
    "promises_prevent_canon_mutation",
    "event_dependencies_prevent_canon_mutation"
  ];

  for (const trigger of triggerChecks) {
    const value = await querySingleValue(
      `SELECT EXISTS (
         SELECT 1
         FROM pg_trigger
         WHERE tgname = $1
       ) AS value`,
      [trigger]
    );
    assert(value === true, `Missing trigger: ${trigger}`);
  }

  await client.query("BEGIN");

  const eventInsert = await client.query(
    `INSERT INTO events (
       project_id,
       timestamp,
       type,
       participants,
       description,
       impacts,
       canon_status
     ) VALUES (
       'test-project',
       NOW(),
       'test-event',
       ARRAY['char-1'],
       'Test description',
       '[]',
       'canon'
     ) RETURNING id`
  );

  const eventId = eventInsert.rows[0].id;

  await expectFailure(
    () =>
      client.query(
        `UPDATE events SET description = 'Updated' WHERE id = $1`,
        [eventId]
      ),
    "Canonical event update should be blocked."
  );

  const draftEventInsert = await client.query(
    `INSERT INTO events (
       project_id,
       timestamp,
       type,
       participants,
       description,
       impacts,
       canon_status
     ) VALUES (
       'test-project',
       NOW(),
       'draft-event',
       ARRAY['char-2'],
       'Draft description',
       '[]',
       'draft'
     ) RETURNING id`
  );

  const draftEventId = draftEventInsert.rows[0].id;

  await expectFailure(
    () =>
      client.query(
        `INSERT INTO event_dependencies (event_id, depends_on_event_id)
         VALUES ($1, $2)`,
        [draftEventId, eventId]
      ),
    "Dependencies referencing canon events should be blocked."
  );

  await client.query("ROLLBACK");

  await client.end();
  console.log("Narrative DB integrity checks passed.");
};

main().catch(async (error) => {
  console.error(error);
  try {
    await client.end();
  } catch (closeError) {
    console.error(closeError);
  }
  process.exit(1);
});
