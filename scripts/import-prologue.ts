#!/usr/bin/env tsx
/**
 * Prologue Import Script
 *
 * Parses the Infinity's Reach prologue and imports it into the NAOS Narrative Engine.
 * This script demonstrates:
 * - Event extraction from prose
 * - Dependency graph construction
 * - Knowledge state tracking
 * - Impact modeling
 * - Canon workflow
 */

import { createEventRecord, fetchProjectEvents } from '../naos/apps/web/lib/narrative/repository';
import type { EventInput } from '../naos/apps/web/lib/narrative/models';

const PROJECT_ID = 'infinitys-reach';

/**
 * Prologue narrative events extracted from scenes
 */
const prologueEvents: EventInput[] = [
  // Scene 1: The Dark Vessel's Journey
  {
    type: 'scene',
    timestamp: new Date('2350-01-01T00:00:00Z'), // Arbitrary far-future timestamp
    participants: [], // No named characters yet, just the vessel
    location: 'Deep space between uncharted stars',
    description: 'A mysterious dark vessel travels through the void at impossible velocities, carrying cargo that could alter the fate of countless souls.',
    dependencies: [],
    impacts: [
      {
        type: 'world_state',
        targetId: 'dark-vessel',
        description: 'Dark vessel begins journey through deep space at relativistic speeds'
      }
    ],
    knowledgeEffects: [],
    canonStatus: 'draft'
  },

  {
    type: 'reveal',
    timestamp: new Date('2350-01-01T00:30:00Z'),
    participants: [],
    location: 'Deep space approaching Terra Galactica',
    description: 'The dark vessel encounters Terra Galactica - a massive cylindrical generation ship floating dormant in space.',
    dependencies: [],
    impacts: [
      {
        type: 'world_state',
        targetId: 'terra-galactica',
        description: 'Terra Galactica revealed as a dormant leviathan awaiting reawakening'
      },
      {
        type: 'relationship',
        targetId: 'dark-vessel-terra-galactica',
        description: 'Dark vessel and Terra Galactica establish proximity relationship'
      }
    ],
    knowledgeEffects: [],
    canonStatus: 'draft'
  },

  {
    type: 'scene',
    timestamp: new Date('2350-01-01T00:45:00Z'),
    participants: [],
    location: 'Deep space near Terra Galactica',
    description: 'The dark vessel passes within close proximity to Terra Galactica, then continues into the void. It appears to be a near-miss encounter.',
    dependencies: [],
    impacts: [
      {
        type: 'world_state',
        targetId: 'dark-vessel',
        description: 'Dark vessel skims past Terra Galactica and continues deeper into space'
      }
    ],
    knowledgeEffects: [],
    canonStatus: 'draft'
  },

  {
    type: 'scene',
    timestamp: new Date('2350-01-15T12:00:00Z'), // Days/weeks later
    participants: [],
    location: 'Deep space, distant from Terra Galactica',
    description: 'In the distant blackness, a silent explosion blooms like a newborn sun. The dark vessel\'s impossible flight slows dramatically.',
    dependencies: [],
    impacts: [
      {
        type: 'world_state',
        targetId: 'dark-vessel',
        description: 'Controlled detonation slows the dark vessel from relativistic speeds'
      }
    ],
    knowledgeEffects: [],
    canonStatus: 'draft'
  },

  {
    type: 'scene',
    timestamp: new Date('2350-01-16T08:00:00Z'),
    participants: [],
    location: 'Deep space, Terra Galactica\'s projected path',
    description: 'The dark vessel adjusts its course, positioning itself precisely within Terra Galactica\'s trajectory. It waits to be consumed by the great ship.',
    dependencies: [],
    impacts: [
      {
        type: 'world_state',
        targetId: 'dark-vessel',
        description: 'Dark vessel deliberately positions itself to intercept Terra Galactica'
      }
    ],
    knowledgeEffects: [],
    canonStatus: 'draft'
  },

  {
    type: 'scene',
    timestamp: new Date('2350-01-16T14:00:00Z'),
    participants: ['terra-galactica-ai'],
    location: 'Terra Galactica hangar bay',
    description: 'Terra Galactica stirs without waking. Ancient protocols activate deep within its frame. A massive hangar bay opens like metallic jaws, ready to swallow the approaching vessel.',
    dependencies: [],
    impacts: [
      {
        type: 'world_state',
        targetId: 'terra-galactica',
        description: 'Terra Galactica\'s automated systems detect and prepare to capture the dark vessel'
      }
    ],
    knowledgeEffects: [
      {
        characterId: 'terra-galactica-ai',
        certainty: 'known',
        source: 'witnessed'
      }
    ],
    canonStatus: 'draft'
  },

  {
    type: 'scene',
    timestamp: new Date('2350-01-16T14:30:00Z'),
    participants: ['terra-galactica-ai'],
    location: 'Terra Galactica hangar bay',
    description: 'The dark vessel drifts into the gaping maw of Terra Galactica, allowing itself to be devoured. Someone or something announces: "It has arrived."',
    dependencies: [],
    impacts: [
      {
        type: 'world_state',
        targetId: 'dark-vessel',
        description: 'Dark vessel successfully captured within Terra Galactica\'s hangar'
      },
      {
        type: 'plot_advancement',
        targetId: 'arrival-of-catalyst',
        description: 'The mysterious cargo has reached its destination - the catalyst event begins'
      }
    ],
    knowledgeEffects: [
      {
        characterId: 'terra-galactica-ai',
        certainty: 'known',
        source: 'witnessed'
      }
    ],
    canonStatus: 'draft'
  },

  // Scene 2: Terra Galactica Interior
  {
    type: 'scene',
    timestamp: new Date('2350-01-16T18:00:00Z'), // Same day, evening cycle
    participants: ['the-chronicler'],
    location: 'The Chronicler\'s quarters, Terra Galactica',
    description: 'A figure sits at a weathered desk in dim light, surrounded by Earth relics and advanced technology. He writes in an old journal as Terra Galactica\'s artificial evening wraps the vast interior.',
    dependencies: [],
    impacts: [
      {
        type: 'character_state',
        targetId: 'the-chronicler',
        description: 'The Chronicler records the pivotal moment in his journal'
      }
    ],
    knowledgeEffects: [
      {
        characterId: 'the-chronicler',
        certainty: 'known',
        source: 'witnessed'
      }
    ],
    canonStatus: 'draft'
  },

  {
    type: 'scene',
    timestamp: new Date('2350-01-16T18:15:00Z'),
    participants: ['the-chronicler', 'voice-1-mechanical', 'voice-2-human'],
    location: 'The Chronicler\'s quarters, Terra Galactica',
    description: 'Voices emerge from deep within the ship. A flat mechanical voice states there are no alternatives. A warmer human voice questions if the responsibility falls to them. They discuss the immeasurable cost of failure.',
    dependencies: [],
    impacts: [
      {
        type: 'plot_advancement',
        targetId: 'decision-made',
        description: 'A fateful decision has been made with immeasurable consequences'
      }
    ],
    knowledgeEffects: [
      {
        characterId: 'the-chronicler',
        certainty: 'known',
        source: 'witnessed'
      },
      {
        characterId: 'voice-1-mechanical',
        certainty: 'known',
        source: 'witnessed'
      },
      {
        characterId: 'voice-2-human',
        certainty: 'known',
        source: 'witnessed'
      }
    ],
    canonStatus: 'draft'
  },

  {
    type: 'scene',
    timestamp: new Date('2350-01-16T18:30:00Z'),
    participants: ['the-chronicler'],
    location: 'Observation deck, Terra Galactica',
    description: 'The Chronicler reads his journal entry: "Today we plant seeds in darkness, not knowing what will grow tomorrow." He walks to the observation window and surveys the terraced farms, bioluminescent trees, and flowing rivers of Terra Galactica\'s interior paradise.',
    dependencies: [],
    impacts: [
      {
        type: 'character_state',
        targetId: 'the-chronicler',
        description: 'The Chronicler contemplates the fragility of their artificial paradise'
      }
    ],
    knowledgeEffects: [
      {
        characterId: 'the-chronicler',
        certainty: 'known',
        source: 'witnessed'
      }
    ],
    canonStatus: 'draft'
  },

  {
    type: 'conflict',
    timestamp: new Date('2350-01-16T18:45:00Z'),
    participants: ['the-chronicler'],
    location: 'Observation deck, Terra Galactica',
    description: 'The Chronicler experiences profound dread as he realizes the weight of their decision. Every life aboard Terra Galactica - ten thousand souls - balances on the edge of an unknowable future. They stand at a threshold between salvation and damnation.',
    dependencies: [],
    impacts: [
      {
        type: 'character_state',
        targetId: 'the-chronicler',
        description: 'The Chronicler experiences deep existential fear about the consequences of their choice'
      },
      {
        type: 'theme_establishment',
        targetId: 'price-of-survival',
        description: 'Central theme established: the cost of survival and the burden of impossible decisions'
      }
    ],
    knowledgeEffects: [
      {
        characterId: 'the-chronicler',
        certainty: 'known',
        source: 'witnessed'
      }
    ],
    canonStatus: 'draft'
  },

  {
    type: 'transition',
    timestamp: new Date('2350-01-16T19:00:00Z'),
    participants: ['the-chronicler', 'terra-galactica-population'],
    location: 'Terra Galactica interior',
    description: 'As Terra Galactica transitions to night cycle, families settle to sleep unaware their dreams might be the last of their kind. The Chronicler closes his eyes and feels the weight of ten thousand souls. Nothing aboard Terra Galactica will ever be the same.',
    dependencies: [],
    impacts: [
      {
        type: 'world_state',
        targetId: 'terra-galactica',
        description: 'Terra Galactica transitions to night cycle as the point of no return is passed'
      },
      {
        type: 'plot_advancement',
        targetId: 'irrevocable-change',
        description: 'The future has been set in motion - Terra Galactica will never be the same'
      }
    ],
    knowledgeEffects: [
      {
        characterId: 'the-chronicler',
        certainty: 'known',
        source: 'witnessed'
      },
      {
        characterId: 'terra-galactica-population',
        certainty: 'false', // They don't know what's coming
        source: 'inferred'
      }
    ],
    canonStatus: 'draft'
  }
];

/**
 * Import prologue events into the narrative database
 */
async function importPrologue() {
  console.log('🚀 Starting Infinity\'s Reach prologue import...\n');

  try {
    // Check if events already exist for this project
    const existingEvents = await fetchProjectEvents(PROJECT_ID);
    if (existingEvents.length > 0) {
      console.log(`⚠️  Warning: ${existingEvents.length} events already exist for project "${PROJECT_ID}"`);
      console.log('   Skipping import to avoid duplicates.\n');
      return;
    }

    // Import events sequentially to maintain dependency order
    const createdEvents = [];
    for (let i = 0; i < prologueEvents.length; i++) {
      const eventInput = prologueEvents[i];
      console.log(`📝 Creating event ${i + 1}/${prologueEvents.length}: ${eventInput.description.substring(0, 60)}...`);

      const event = await createEventRecord(PROJECT_ID, eventInput);
      createdEvents.push(event);

      console.log(`   ✅ Created event ${event.id}`);
      console.log(`      Type: ${event.type}`);
      console.log(`      Timestamp: ${event.timestamp.toISOString()}`);
      console.log(`      Participants: ${event.participants.join(', ') || 'None'}`);
      console.log(`      Location: ${event.location || 'Not specified'}`);
      console.log(`      Impacts: ${event.impacts.length}`);
      console.log(`      Knowledge effects: ${event.knowledgeEffects.length}`);
      console.log('');
    }

    console.log(`\n✨ Successfully imported ${createdEvents.length} events for Infinity's Reach prologue!`);
    console.log(`\n📊 Summary:`);
    console.log(`   - Scene events: ${createdEvents.filter(e => e.type === 'scene').length}`);
    console.log(`   - Reveal events: ${createdEvents.filter(e => e.type === 'reveal').length}`);
    console.log(`   - Conflict events: ${createdEvents.filter(e => e.type === 'conflict').length}`);
    console.log(`   - Transition events: ${createdEvents.filter(e => e.type === 'transition').length}`);
    console.log(`   - Total impacts: ${createdEvents.reduce((sum, e) => sum + e.impacts.length, 0)}`);
    console.log(`   - Total knowledge effects: ${createdEvents.reduce((sum, e) => sum + e.knowledgeEffects.length, 0)}`);

    console.log(`\n🎯 Next steps:`);
    console.log(`   1. Create audio scene objects with beat markers`);
    console.log(`   2. Define voice profiles for narrator and characters`);
    console.log(`   3. Run listener cognition audits`);
    console.log(`   4. Generate recording packets`);
    console.log(`   5. Validate canon gates before publishing`);

  } catch (error) {
    console.error('❌ Import failed:', error);
    throw error;
  }
}

// Run the import
importPrologue().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
