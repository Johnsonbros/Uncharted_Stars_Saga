#!/usr/bin/env node
/**
 * Infinity's Reach Prologue Import Script
 *
 * Imports the prologue narrative events into the NAOS database.
 * This demonstrates the Narrative Engine's ability to handle structured story events.
 */

import pg from "pg";
import crypto from "crypto";

const { Client } = pg;

const requiredEnv = "DATABASE_URL";
if (!process.env[requiredEnv]) {
  throw new Error(`${requiredEnv} is required for database access.`);
}

const client = new Client({ connectionString: process.env.DATABASE_URL });

const PROJECT_ID = "infinitys-reach";

/**
 * Prologue narrative events
 */
const prologueEvents = [
  {
    id: crypto.randomUUID(),
    type: "scene",
    timestamp: new Date("2350-01-01T00:00:00Z"),
    participants: [],
    location: "Deep space between uncharted stars",
    description: "A mysterious dark vessel travels through the void at impossible velocities, carrying cargo that could alter the fate of countless souls.",
    impacts: [
      {
        type: "world_state",
        targetId: "dark-vessel",
        description: "Dark vessel begins journey through deep space at relativistic speeds"
      }
    ],
    canonStatus: "draft"
  },
  {
    id: crypto.randomUUID(),
    type: "reveal",
    timestamp: new Date("2350-01-01T00:30:00Z"),
    participants: [],
    location: "Deep space approaching Terra Galactica",
    description: "The dark vessel encounters Terra Galactica - a massive cylindrical generation ship floating dormant in space.",
    impacts: [
      {
        type: "world_state",
        targetId: "terra-galactica",
        description: "Terra Galactica revealed as a dormant leviathan awaiting reawakening"
      },
      {
        type: "relationship",
        targetId: "dark-vessel-terra-galactica",
        description: "Dark vessel and Terra Galactica establish proximity relationship"
      }
    ],
    canonStatus: "draft"
  },
  {
    id: crypto.randomUUID(),
    type: "scene",
    timestamp: new Date("2350-01-01T00:45:00Z"),
    participants: [],
    location: "Deep space near Terra Galactica",
    description: "The dark vessel passes within close proximity to Terra Galactica, then continues into the void.",
    impacts: [
      {
        type: "world_state",
        targetId: "dark-vessel",
        description: "Dark vessel skims past Terra Galactica and continues deeper into space"
      }
    ],
    canonStatus: "draft"
  },
  {
    id: crypto.randomUUID(),
    type: "scene",
    timestamp: new Date("2350-01-15T12:00:00Z"),
    participants: [],
    location: "Deep space, distant from Terra Galactica",
    description: "A silent explosion blooms in the distant blackness. The dark vessel's impossible flight slows dramatically.",
    impacts: [
      {
        type: "world_state",
        targetId: "dark-vessel",
        description: "Controlled detonation slows the dark vessel from relativistic speeds"
      }
    ],
    canonStatus: "draft"
  },
  {
    id: crypto.randomUUID(),
    type: "scene",
    timestamp: new Date("2350-01-16T08:00:00Z"),
    participants: [],
    location: "Deep space, Terra Galactica's projected path",
    description: "The dark vessel adjusts its course, positioning itself precisely within Terra Galactica's trajectory.",
    impacts: [
      {
        type: "world_state",
        targetId: "dark-vessel",
        description: "Dark vessel deliberately positions itself to intercept Terra Galactica"
      }
    ],
    canonStatus: "draft"
  },
  {
    id: crypto.randomUUID(),
    type: "scene",
    timestamp: new Date("2350-01-16T14:00:00Z"),
    participants: ["terra-galactica-ai"],
    location: "Terra Galactica hangar bay",
    description: "Terra Galactica stirs without waking. Ancient protocols activate. A massive hangar bay opens.",
    impacts: [
      {
        type: "world_state",
        targetId: "terra-galactica",
        description: "Terra Galactica's automated systems detect and prepare to capture the dark vessel"
      }
    ],
    knowledgeEffects: [
      {
        characterId: "terra-galactica-ai",
        certainty: "known",
        source: "witnessed"
      }
    ],
    canonStatus: "draft"
  },
  {
    id: crypto.randomUUID(),
    type: "scene",
    timestamp: new Date("2350-01-16T14:30:00Z"),
    participants: ["terra-galactica-ai"],
    location: "Terra Galactica hangar bay",
    description: 'The dark vessel drifts into Terra Galactica\'s hangar. A voice announces: "It has arrived."',
    impacts: [
      {
        type: "world_state",
        targetId: "dark-vessel",
        description: "Dark vessel successfully captured within Terra Galactica's hangar"
      },
      {
        type: "plot_advancement",
        targetId: "arrival-of-catalyst",
        description: "The mysterious cargo has reached its destination"
      }
    ],
    knowledgeEffects: [
      {
        characterId: "terra-galactica-ai",
        certainty: "known",
        source: "witnessed"
      }
    ],
    canonStatus: "draft"
  },
  {
    id: crypto.randomUUID(),
    type: "scene",
    timestamp: new Date("2350-01-16T18:00:00Z"),
    participants: ["the-chronicler"],
    location: "The Chronicler's quarters, Terra Galactica",
    description: "A figure writes in an old journal as Terra Galactica's artificial evening wraps the vast interior.",
    impacts: [
      {
        type: "character_state",
        targetId: "the-chronicler",
        description: "The Chronicler records the pivotal moment"
      }
    ],
    knowledgeEffects: [
      {
        characterId: "the-chronicler",
        certainty: "known",
        source: "witnessed"
      }
    ],
    canonStatus: "draft"
  },
  {
    id: crypto.randomUUID(),
    type: "scene",
    timestamp: new Date("2350-01-16T18:15:00Z"),
    participants: ["the-chronicler", "voice-1-mechanical", "voice-2-human"],
    location: "The Chronicler's quarters, Terra Galactica",
    description: "Voices emerge from the ship. They discuss the immeasurable cost of failure and the decision that's been made.",
    impacts: [
      {
        type: "plot_advancement",
        targetId: "decision-made",
        description: "A fateful decision has been made with immeasurable consequences"
      }
    ],
    knowledgeEffects: [
      {
        characterId: "the-chronicler",
        certainty: "known",
        source: "witnessed"
      },
      {
        characterId: "voice-1-mechanical",
        certainty: "known",
        source: "witnessed"
      },
      {
        characterId: "voice-2-human",
        certainty: "known",
        source: "witnessed"
      }
    ],
    canonStatus: "draft"
  },
  {
    id: crypto.randomUUID(),
    type: "scene",
    timestamp: new Date("2350-01-16T18:30:00Z"),
    participants: ["the-chronicler"],
    location: "Observation deck, Terra Galactica",
    description: 'The Chronicler reads: "Today we plant seeds in darkness, not knowing what will grow tomorrow." He surveys Terra Galactica\'s interior paradise.',
    impacts: [
      {
        type: "character_state",
        targetId: "the-chronicler",
        description: "The Chronicler contemplates the fragility of their paradise"
      }
    ],
    knowledgeEffects: [
      {
        characterId: "the-chronicler",
        certainty: "known",
        source: "witnessed"
      }
    ],
    canonStatus: "draft"
  },
  {
    id: crypto.randomUUID(),
    type: "conflict",
    timestamp: new Date("2350-01-16T18:45:00Z"),
    participants: ["the-chronicler"],
    location: "Observation deck, Terra Galactica",
    description: "The Chronicler experiences profound dread as he realizes the weight of their decision. Ten thousand souls balance on the edge of an unknowable future.",
    impacts: [
      {
        type: "character_state",
        targetId: "the-chronicler",
        description: "The Chronicler experiences existential fear about consequences"
      },
      {
        type: "theme_establishment",
        targetId: "price-of-survival",
        description: "Central theme: the cost of survival and burden of impossible decisions"
      }
    ],
    knowledgeEffects: [
      {
        characterId: "the-chronicler",
        certainty: "known",
        source: "witnessed"
      }
    ],
    canonStatus: "draft"
  },
  {
    id: crypto.randomUUID(),
    type: "transition",
    timestamp: new Date("2350-01-16T19:00:00Z"),
    participants: ["the-chronicler", "terra-galactica-population"],
    location: "Terra Galactica interior",
    description: "As Terra Galactica transitions to night cycle, families sleep unaware. Nothing aboard will ever be the same.",
    impacts: [
      {
        type: "world_state",
        targetId: "terra-galactica",
        description: "Point of no return passed - Terra Galactica will never be the same"
      },
      {
        type: "plot_advancement",
        targetId: "irrevocable-change",
        description: "The future has been set in motion"
      }
    ],
    knowledgeEffects: [
      {
        characterId: "the-chronicler",
        certainty: "known",
        source: "witnessed"
      },
      {
        characterId: "terra-galactica-population",
        certainty: "false",
        source: "inferred"
      }
    ],
    canonStatus: "draft"
  }
];

async function importPrologue() {
  console.log("🚀 Starting Infinity's Reach prologue import...\n");

  try {
    await client.connect();

    // Check if events already exist
    const existingCount = await client.query(
      "SELECT COUNT(*) as count FROM events WHERE project_id = $1",
      [PROJECT_ID]
    );

    if (parseInt(existingCount.rows[0].count) > 0) {
      console.log(`⚠️  Warning: ${existingCount.rows[0].count} events already exist for "${PROJECT_ID}"`);
      console.log("   Skipping import to avoid duplicates.\n");
      return;
    }

    // Import events
    for (let i = 0; i < prologueEvents.length; i++) {
      const event = prologueEvents[i];
      console.log(`📝 Importing event ${i + 1}/${prologueEvents.length}: ${event.description.substring(0, 50)}...`);

      // Insert event
      await client.query(
        `INSERT INTO events (id, project_id, timestamp, type, participants, location, description, impacts, canon_status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          event.id,
          PROJECT_ID,
          event.timestamp,
          event.type,
          event.participants,
          event.location,
          event.description,
          JSON.stringify(event.impacts),
          event.canonStatus
        ]
      );

      // Insert knowledge effects if any
      if (event.knowledgeEffects) {
        for (const effect of event.knowledgeEffects) {
          await client.query(
            `INSERT INTO knowledge_states (project_id, character_id, event_id, learned_at, certainty, source, canon_status)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
              PROJECT_ID,
              effect.characterId,
              event.id,
              event.timestamp,
              effect.certainty,
              effect.source,
              event.canonStatus
            ]
          );
        }
      }

      console.log(`   ✅ Event ${event.id} created`);
    }

    // Get summary stats
    const stats = await client.query(`
      SELECT
        type,
        COUNT(*) as count
      FROM events
      WHERE project_id = $1
      GROUP BY type
      ORDER BY type
    `, [PROJECT_ID]);

    const impactCount = await client.query(`
      SELECT COUNT(*) as count
      FROM events
      WHERE project_id = $1 AND jsonb_array_length(impacts) > 0
    `, [PROJECT_ID]);

    const knowledgeCount = await client.query(`
      SELECT COUNT(*) as count
      FROM knowledge_states
      WHERE project_id = $1
    `, [PROJECT_ID]);

    console.log(`\n✨ Successfully imported ${prologueEvents.length} events!\n`);
    console.log("📊 Summary by type:");
    for (const row of stats.rows) {
      console.log(`   - ${row.type}: ${row.count}`);
    }
    console.log(`   - Total events with impacts: ${impactCount.rows[0].count}`);
    console.log(`   - Total knowledge states: ${knowledgeCount.rows[0].count}`);

    console.log("\n🎯 Next steps:");
    console.log("   1. Create audio scene objects with beat markers");
    console.log("   2. Define voice profiles");
    console.log("   3. Run listener cognition audits");
    console.log("   4. Generate recording packets");

  } catch (error) {
    console.error("❌ Import failed:", error);
    throw error;
  } finally {
    await client.end();
  }
}

importPrologue().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
