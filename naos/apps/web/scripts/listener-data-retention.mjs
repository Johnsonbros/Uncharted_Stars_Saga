import pg from "pg";

const { Client } = pg;

const requireEnv = (name) => {
  if (!process.env[name]) {
    throw new Error(`${name} is required to run listener data retention.`);
  }
};

requireEnv("DATABASE_URL");

const parsePositiveInt = (value, fallback) => {
  if (value === undefined) {
    return fallback;
  }
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`Invalid numeric value: ${value}`);
  }
  return parsed;
};

const playbackRetentionMonths = parsePositiveInt(
  process.env.PLAYBACK_RETENTION_MONTHS,
  24
);
const entitlementRetentionYears = parsePositiveInt(
  process.env.ENTITLEMENT_RETENTION_YEARS,
  7
);
const deletionGraceDays = parsePositiveInt(process.env.DELETION_GRACE_DAYS, 30);
const dryRun = ["1", "true", "yes"].includes(
  (process.env.DRY_RUN || "").toLowerCase()
);

const client = new Client({ connectionString: process.env.DATABASE_URL });

const runCount = async (sql, params) => {
  const result = await client.query(sql, params);
  return Number.parseInt(result.rows[0]?.count ?? "0", 10);
};

const main = async () => {
  await client.connect();

  if (!dryRun) {
    await client.query("BEGIN");
  }

  const stalePlaybackCount = await runCount(
    `SELECT COUNT(*) AS count
     FROM playback_positions
     WHERE updated_at < NOW() - ($1 * INTERVAL '1 month')`,
    [playbackRetentionMonths]
  );

  if (!dryRun && stalePlaybackCount > 0) {
    await client.query(
      `DELETE FROM playback_positions
       WHERE updated_at < NOW() - ($1 * INTERVAL '1 month')`,
      [playbackRetentionMonths]
    );
  }

  const staleEntitlementCount = await runCount(
    `SELECT COUNT(*) AS count
     FROM entitlements
     WHERE access_end IS NOT NULL
       AND access_end < NOW() - ($1 * INTERVAL '1 year')`,
    [entitlementRetentionYears]
  );

  if (!dryRun && staleEntitlementCount > 0) {
    await client.query(
      `DELETE FROM entitlements
       WHERE access_end IS NOT NULL
         AND access_end < NOW() - ($1 * INTERVAL '1 year')`,
      [entitlementRetentionYears]
    );
  }

  const deletionCandidates = await client.query(
    `SELECT id
     FROM listeners
     WHERE status = 'deleted'
       AND updated_at < NOW() - ($1 * INTERVAL '1 day')`,
    [deletionGraceDays]
  );

  for (const row of deletionCandidates.rows) {
    const listenerId = row.id;
    const anonymizedEmail = `deleted+${listenerId}@redacted.invalid`;

    if (!dryRun) {
      await client.query(
        `UPDATE playback_positions
         SET listener_id = NULL,
             updated_at = NOW()
         WHERE listener_id = $1`,
        [listenerId]
      );

      await client.query(
        `UPDATE listeners
         SET email = $1,
             updated_at = NOW()
         WHERE id = $2`,
        [anonymizedEmail, listenerId]
      );
    }
  }

  if (!dryRun) {
    await client.query("COMMIT");
  }

  console.log("Listener data retention summary", {
    dryRun,
    playbackRetentionMonths,
    stalePlaybackCount,
    entitlementRetentionYears,
    staleEntitlementCount,
    deletionGraceDays,
    deletionCandidates: deletionCandidates.rows.length
  });

  await client.end();
};

main().catch(async (error) => {
  console.error(error);
  try {
    await client.query("ROLLBACK");
  } catch (rollbackError) {
    console.error(rollbackError);
  }
  try {
    await client.end();
  } catch (closeError) {
    console.error(closeError);
  }
  process.exit(1);
});
