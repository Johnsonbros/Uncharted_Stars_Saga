#!/usr/bin/env npx tsx
/**
 * Chapter Seed Script for Uncharted Stars Saga
 *
 * Seeds the chapters table with sample audiobook chapters for testing
 * the Listener Platform.
 *
 * Usage: npm run seed
 */

import pg from "pg";
import crypto from "crypto";

const { Client } = pg;

const requiredEnv = "DATABASE_URL";
if (!process.env[requiredEnv]) {
  throw new Error(`${requiredEnv} is required for database access.`);
}

const client = new Client({ connectionString: process.env.DATABASE_URL });

interface Chapter {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string;
  audioStoragePath: string | null;
  durationSeconds: number;
  sequenceOrder: number;
  isPublished: boolean;
  publishedAt: Date | null;
}

/**
 * Sample chapters for "Infinity's Reach" - Book 1 of Uncharted Stars Saga
 */
const sampleChapters: Chapter[] = [
  {
    id: crypto.randomUUID(),
    slug: "prologue-first-contact",
    title: "Prologue: First Contact",
    subtitle: "The Arrival",
    description:
      "In the endless darkness of space, a mysterious vessel approaches the dormant generation ship Terra Galactica, carrying cargo that will change everything.",
    audioStoragePath: null,
    durationSeconds: 900, // ~15 minutes
    sequenceOrder: 1,
    isPublished: true,
    publishedAt: new Date("2026-01-15T00:00:00Z")
  },
  {
    id: crypto.randomUUID(),
    slug: "act-1-the-discovery",
    title: "Chapter 1: The Discovery",
    subtitle: "Elara's Laboratory",
    description:
      "Dr. Elara Vance begins another day in her laboratory aboard Terra Galactica, unaware that the results of her life's work are about to be celebrated - and questioned.",
    audioStoragePath: null,
    durationSeconds: 2700, // ~45 minutes
    sequenceOrder: 2,
    isPublished: true,
    publishedAt: new Date("2026-01-15T00:00:00Z")
  },
  {
    id: crypto.randomUUID(),
    slug: "act-1-distant-signals",
    title: "Chapter 2: Distant Signals",
    subtitle: "The Neurocare Center",
    description:
      "Elara visits the patients affected by her enhancement research, confronting the human cost of humanity's greatest medical achievement.",
    audioStoragePath: null,
    durationSeconds: 2400, // ~40 minutes
    sequenceOrder: 3,
    isPublished: true,
    publishedAt: new Date("2026-01-22T00:00:00Z")
  },
  {
    id: crypto.randomUUID(),
    slug: "act-1-the-approach",
    title: "Chapter 3: The Approach",
    subtitle: "Detective McCarran",
    description:
      "Security Detective Leo McCarran investigates unusual activity in the ship's industrial sectors, leading him into a deadly confrontation.",
    audioStoragePath: null,
    durationSeconds: 2100, // ~35 minutes
    sequenceOrder: 4,
    isPublished: false,
    publishedAt: null
  },
  {
    id: crypto.randomUUID(),
    slug: "act-1-collision-course",
    title: "Chapter 4: Collision Course",
    subtitle: "The Grand Assembly",
    description:
      "As Elara prepares for her ceremony, forces beyond her understanding converge on Terra Galactica.",
    audioStoragePath: null,
    durationSeconds: 1800, // ~30 minutes
    sequenceOrder: 5,
    isPublished: false,
    publishedAt: null
  }
];

async function seedChapters(): Promise<void> {
  console.log("Starting chapter seed...\n");

  try {
    await client.connect();

    // Check if chapters already exist
    const existingCount = await client.query(
      "SELECT COUNT(*) as count FROM chapters"
    );

    if (parseInt(existingCount.rows[0].count) > 0) {
      console.log(
        `Warning: ${existingCount.rows[0].count} chapters already exist.`
      );
      console.log("Clearing existing chapters before seeding...\n");

      await client.query("DELETE FROM chapters");
      console.log("Existing chapters cleared.\n");
    }

    // Insert chapters
    for (let i = 0; i < sampleChapters.length; i++) {
      const chapter = sampleChapters[i];
      console.log(
        `Inserting chapter ${i + 1}/${sampleChapters.length}: ${chapter.title}`
      );

      await client.query(
        `INSERT INTO chapters (
          id,
          slug,
          title,
          subtitle,
          description,
          audio_storage_path,
          duration_seconds,
          sequence_order,
          is_published,
          published_at,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())`,
        [
          chapter.id,
          chapter.slug,
          chapter.title,
          chapter.subtitle,
          chapter.description,
          chapter.audioStoragePath,
          chapter.durationSeconds,
          chapter.sequenceOrder,
          chapter.isPublished,
          chapter.publishedAt
        ]
      );

      const status = chapter.isPublished ? "published" : "draft";
      const duration = Math.floor(chapter.durationSeconds / 60);
      console.log(`  - ${chapter.slug} (${duration} min, ${status})`);
    }

    // Get summary
    const publishedCount = await client.query(
      "SELECT COUNT(*) as count FROM chapters WHERE is_published = true"
    );

    const draftCount = await client.query(
      "SELECT COUNT(*) as count FROM chapters WHERE is_published = false"
    );

    const totalDuration = await client.query(
      "SELECT SUM(duration_seconds) as total FROM chapters"
    );

    const totalMinutes = Math.floor(
      parseInt(totalDuration.rows[0].total || "0") / 60
    );

    console.log(`\nSuccessfully seeded ${sampleChapters.length} chapters!\n`);
    console.log("Summary:");
    console.log(`  - Published chapters: ${publishedCount.rows[0].count}`);
    console.log(`  - Draft chapters: ${draftCount.rows[0].count}`);
    console.log(`  - Total duration: ${totalMinutes} minutes`);

    console.log("\nChapter URLs:");
    for (const chapter of sampleChapters) {
      if (chapter.isPublished) {
        console.log(`  - /player/${chapter.slug}`);
      }
    }

    console.log("\nNext steps:");
    console.log("  1. Visit /library to see the chapter listing");
    console.log("  2. Test player pages at /player/[slug]");
    console.log("  3. Upload audio files to storage");
    console.log("  4. Update audioStoragePath for each chapter");
  } catch (error) {
    console.error("Seed failed:", error);
    throw error;
  } finally {
    await client.end();
  }
}

seedChapters().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
