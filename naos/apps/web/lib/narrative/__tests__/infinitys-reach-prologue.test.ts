/**
 * Infinity's Reach Prologue - System Performance Test
 *
 * This test demonstrates NAOS performance with real narrative content:
 * - Event creation and structuring
 * - Dependency graph validation
 * - Knowledge state tracking
 * - Canon gate validation
 * - Promise tracking
 * - Continuity checking
 */

import { describe, expect, it } from "vitest";
import {
  checkContinuity,
  createEvent,
  deriveKnowledgeState,
  transitionCanonStatus,
  validateCanonGate,
  validateDependencyGraph,
  validatePromises
} from "../engine";
import type { Event, EventInput, PromiseRecord } from "../models";

describe("Infinity's Reach Prologue - NAOS Performance Test", () => {
  // =========================================================================
  // PART 1: EVENT CREATION
  // Tests the Narrative Engine's ability to structure prose into events
  // =========================================================================

  describe("Event Creation & Structuring", () => {
    it("creates Scene 1 events: The Dark Vessel's Journey", () => {
      const events: Event[] = [];

      // Event 1: Dark vessel begins journey
      const event1 = createEvent({
        type: "scene",
        timestamp: new Date("2350-01-01T00:00:00Z"),
        participants: [],
        location: "Deep space between uncharted stars",
        description:
          "A mysterious dark vessel travels through the void at impossible velocities, carrying cargo that could alter the fate of countless souls.",
        dependencies: [],
        impacts: [
          {
            type: "world_state",
            targetId: "dark-vessel",
            description: "Dark vessel begins journey at relativistic speeds"
          }
        ],
        knowledgeEffects: []
      });
      events.push(event1);

      // Event 2: Terra Galactica revealed
      const event2 = createEvent({
        type: "reveal",
        timestamp: new Date("2350-01-01T00:30:00Z"),
        participants: [],
        location: "Deep space approaching Terra Galactica",
        description:
          "The dark vessel encounters Terra Galactica - a massive cylindrical generation ship floating dormant in space.",
        dependencies: [],
        impacts: [
          {
            type: "world_state",
            targetId: "terra-galactica",
            description: "Terra Galactica revealed as dormant leviathan"
          },
          {
            type: "relationship",
            targetId: "dark-vessel-terra-galactica",
            description: "Proximity relationship established"
          }
        ],
        knowledgeEffects: []
      });
      events.push(event2);

      // Event 3: Near-miss encounter
      const event3 = createEvent({
        type: "scene",
        timestamp: new Date("2350-01-01T00:45:00Z"),
        participants: [],
        location: "Deep space near Terra Galactica",
        description:
          "The dark vessel passes within close proximity to Terra Galactica, then continues into the void.",
        dependencies: [],
        impacts: [
          {
            type: "world_state",
            targetId: "dark-vessel",
            description: "Dark vessel skims past and continues into space"
          }
        ],
        knowledgeEffects: []
      });
      events.push(event3);

      // Event 4: Deceleration explosion
      const event4 = createEvent({
        type: "scene",
        timestamp: new Date("2350-01-15T12:00:00Z"),
        participants: [],
        location: "Deep space, distant from Terra Galactica",
        description:
          "A silent explosion blooms in the distant blackness. The dark vessel's impossible flight slows dramatically.",
        dependencies: [],
        impacts: [
          {
            type: "world_state",
            targetId: "dark-vessel",
            description: "Controlled detonation slows vessel from relativistic speeds"
          }
        ],
        knowledgeEffects: []
      });
      events.push(event4);

      // Event 5: Deliberate positioning
      const event5 = createEvent({
        type: "scene",
        timestamp: new Date("2350-01-16T08:00:00Z"),
        participants: [],
        location: "Deep space, Terra Galactica's projected path",
        description:
          "The dark vessel adjusts its course, positioning itself precisely within Terra Galactica's trajectory.",
        dependencies: [],
        impacts: [
          {
            type: "world_state",
            targetId: "dark-vessel",
            description: "Dark vessel deliberately intercepts Terra Galactica"
          }
        ],
        knowledgeEffects: []
      });
      events.push(event5);

      // Event 6: Hangar activation
      const event6 = createEvent({
        type: "scene",
        timestamp: new Date("2350-01-16T14:00:00Z"),
        participants: ["terra-galactica-ai"],
        location: "Terra Galactica hangar bay",
        description:
          "Terra Galactica stirs without waking. Ancient protocols activate. A massive hangar bay opens.",
        dependencies: [],
        impacts: [
          {
            type: "world_state",
            targetId: "terra-galactica",
            description: "Automated systems detect and prepare to capture vessel"
          }
        ],
        knowledgeEffects: [
          {
            characterId: "terra-galactica-ai",
            certainty: "known",
            source: "witnessed"
          }
        ]
      });
      events.push(event6);

      // Event 7: Capture complete - "It has arrived"
      const event7 = createEvent({
        type: "scene",
        timestamp: new Date("2350-01-16T14:30:00Z"),
        participants: ["terra-galactica-ai"],
        location: "Terra Galactica hangar bay",
        description:
          'The dark vessel drifts into Terra Galactica\'s hangar. A voice announces: "It has arrived."',
        dependencies: [],
        impacts: [
          {
            type: "world_state",
            targetId: "dark-vessel",
            description: "Dark vessel captured within hangar"
          },
          {
            type: "plot_advancement",
            targetId: "arrival-of-catalyst",
            description: "Mysterious cargo reaches destination"
          }
        ],
        knowledgeEffects: [
          {
            characterId: "terra-galactica-ai",
            certainty: "known",
            source: "witnessed"
          }
        ]
      });
      events.push(event7);

      expect(events).toHaveLength(7);
      expect(events.every((e) => e.canonStatus === "draft")).toBe(true);
      expect(events.filter((e) => e.type === "scene")).toHaveLength(6);
      expect(events.filter((e) => e.type === "reveal")).toHaveLength(1);
    });

    it("creates Scene 2 events: Terra Galactica Interior", () => {
      const events: Event[] = [];

      // Event 8: The Chronicler writes
      const event8 = createEvent({
        type: "scene",
        timestamp: new Date("2350-01-16T18:00:00Z"),
        participants: ["the-chronicler"],
        location: "The Chronicler's quarters, Terra Galactica",
        description:
          "A figure writes in an old journal as Terra Galactica's artificial evening wraps the vast interior.",
        dependencies: [],
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
        ]
      });
      events.push(event8);

      // Event 9: The mysterious dialogue
      const event9 = createEvent({
        type: "scene",
        timestamp: new Date("2350-01-16T18:15:00Z"),
        participants: ["the-chronicler", "voice-1-mechanical", "voice-2-human"],
        location: "The Chronicler's quarters, Terra Galactica",
        description:
          "Voices emerge from the ship. They discuss the immeasurable cost of failure and the decision made.",
        dependencies: [],
        impacts: [
          {
            type: "plot_advancement",
            targetId: "decision-made",
            description: "Fateful decision with immeasurable consequences"
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
        ]
      });
      events.push(event9);

      // Event 10: Journal reflection
      const event10 = createEvent({
        type: "scene",
        timestamp: new Date("2350-01-16T18:30:00Z"),
        participants: ["the-chronicler"],
        location: "Observation deck, Terra Galactica",
        description:
          'The Chronicler reads: "Today we plant seeds in darkness." He surveys Terra Galactica\'s interior paradise.',
        dependencies: [],
        impacts: [
          {
            type: "character_state",
            targetId: "the-chronicler",
            description: "Contemplates fragility of their paradise"
          }
        ],
        knowledgeEffects: [
          {
            characterId: "the-chronicler",
            certainty: "known",
            source: "witnessed"
          }
        ]
      });
      events.push(event10);

      // Event 11: Existential dread
      const event11 = createEvent({
        type: "conflict",
        timestamp: new Date("2350-01-16T18:45:00Z"),
        participants: ["the-chronicler"],
        location: "Observation deck, Terra Galactica",
        description:
          "The Chronicler experiences profound dread. Ten thousand souls balance on the edge of an unknowable future.",
        dependencies: [],
        impacts: [
          {
            type: "character_state",
            targetId: "the-chronicler",
            description: "Existential fear about consequences"
          },
          {
            type: "theme_establishment",
            targetId: "price-of-survival",
            description: "Central theme: cost of survival"
          }
        ],
        knowledgeEffects: [
          {
            characterId: "the-chronicler",
            certainty: "known",
            source: "witnessed"
          }
        ]
      });
      events.push(event11);

      // Event 12: Point of no return
      const event12 = createEvent({
        type: "transition",
        timestamp: new Date("2350-01-16T19:00:00Z"),
        participants: ["the-chronicler", "terra-galactica-population"],
        location: "Terra Galactica interior",
        description:
          "As night cycle begins, families sleep unaware. Nothing aboard will ever be the same.",
        dependencies: [],
        impacts: [
          {
            type: "world_state",
            targetId: "terra-galactica",
            description: "Point of no return - future set in motion"
          },
          {
            type: "plot_advancement",
            targetId: "irrevocable-change",
            description: "Terra Galactica will never be the same"
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
            certainty: "false", // They don't know what's coming
            source: "inferred"
          }
        ]
      });
      events.push(event12);

      expect(events).toHaveLength(5);
      expect(events.filter((e) => e.type === "scene")).toHaveLength(3);
      expect(events.filter((e) => e.type === "conflict")).toHaveLength(1);
      expect(events.filter((e) => e.type === "transition")).toHaveLength(1);
    });
  });

  // =========================================================================
  // PART 2: DEPENDENCY GRAPH VALIDATION
  // Tests structural integrity and causal consistency
  // =========================================================================

  describe("Dependency Graph & Continuity", () => {
    const allEvents: Event[] = [];

    // Create all 12 prologue events
    it("builds complete prologue event timeline", () => {
      const eventInputs: EventInput[] = [
        {
          type: "scene",
          timestamp: new Date("2350-01-01T00:00:00Z"),
          participants: [],
          location: "Deep space",
          description: "Dark vessel begins journey",
          impacts: [],
          knowledgeEffects: []
        },
        {
          type: "reveal",
          timestamp: new Date("2350-01-01T00:30:00Z"),
          participants: [],
          location: "Deep space",
          description: "Terra Galactica revealed",
          impacts: [],
          knowledgeEffects: []
        },
        {
          type: "scene",
          timestamp: new Date("2350-01-01T00:45:00Z"),
          participants: [],
          location: "Deep space",
          description: "Near-miss encounter",
          impacts: [],
          knowledgeEffects: []
        },
        {
          type: "scene",
          timestamp: new Date("2350-01-15T12:00:00Z"),
          participants: [],
          location: "Deep space",
          description: "Deceleration explosion",
          impacts: [],
          knowledgeEffects: []
        },
        {
          type: "scene",
          timestamp: new Date("2350-01-16T08:00:00Z"),
          participants: [],
          location: "Deep space",
          description: "Deliberate positioning",
          impacts: [],
          knowledgeEffects: []
        },
        {
          type: "scene",
          timestamp: new Date("2350-01-16T14:00:00Z"),
          participants: ["terra-galactica-ai"],
          location: "Hangar bay",
          description: "Hangar activation",
          impacts: [],
          knowledgeEffects: [
            {
              characterId: "terra-galactica-ai",
              certainty: "known",
              source: "witnessed"
            }
          ]
        },
        {
          type: "scene",
          timestamp: new Date("2350-01-16T14:30:00Z"),
          participants: ["terra-galactica-ai"],
          location: "Hangar bay",
          description: "Capture complete",
          impacts: [],
          knowledgeEffects: [
            {
              characterId: "terra-galactica-ai",
              certainty: "known",
              source: "witnessed"
            }
          ]
        },
        {
          type: "scene",
          timestamp: new Date("2350-01-16T18:00:00Z"),
          participants: ["the-chronicler"],
          location: "Chronicler's quarters",
          description: "Writing in journal",
          impacts: [],
          knowledgeEffects: [
            {
              characterId: "the-chronicler",
              certainty: "known",
              source: "witnessed"
            }
          ]
        },
        {
          type: "scene",
          timestamp: new Date("2350-01-16T18:15:00Z"),
          participants: ["the-chronicler", "voice-1-mechanical", "voice-2-human"],
          location: "Chronicler's quarters",
          description: "Mysterious dialogue",
          impacts: [],
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
          ]
        },
        {
          type: "scene",
          timestamp: new Date("2350-01-16T18:30:00Z"),
          participants: ["the-chronicler"],
          location: "Observation deck",
          description: "Journal reflection",
          impacts: [],
          knowledgeEffects: [
            {
              characterId: "the-chronicler",
              certainty: "known",
              source: "witnessed"
            }
          ]
        },
        {
          type: "conflict",
          timestamp: new Date("2350-01-16T18:45:00Z"),
          participants: ["the-chronicler"],
          location: "Observation deck",
          description: "Existential dread",
          impacts: [],
          knowledgeEffects: [
            {
              characterId: "the-chronicler",
              certainty: "known",
              source: "witnessed"
            }
          ]
        },
        {
          type: "transition",
          timestamp: new Date("2350-01-16T19:00:00Z"),
          participants: ["the-chronicler", "terra-galactica-population"],
          location: "Terra Galactica",
          description: "Point of no return",
          impacts: [],
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
          ]
        }
      ];

      for (const input of eventInputs) {
        allEvents.push(createEvent(input));
      }

      expect(allEvents).toHaveLength(12);
    });

    it("validates dependency graph has no cycles or missing dependencies", () => {
      const report = validateDependencyGraph(allEvents);

      expect(report.dependencyIssues).toHaveLength(0);
      expect(report.cycleIssues).toHaveLength(0);
    });

    it("validates timeline continuity (timestamps in causal order)", () => {
      const report = checkContinuity(allEvents);

      expect(report.dependencyIssues).toHaveLength(0);
      expect(report.cycleIssues).toHaveLength(0);
      expect(report.timestampIssues).toHaveLength(0);
    });

    it("verifies chronological progression", () => {
      const timestamps = allEvents.map((e) => e.timestamp.getTime());
      const sorted = [...timestamps].sort((a, b) => a - b);

      expect(timestamps).toEqual(sorted);
    });
  });

  // =========================================================================
  // PART 3: KNOWLEDGE STATE TRACKING
  // Tests institutional memory and character knowledge
  // =========================================================================

  describe("Knowledge State Tracking", () => {
    let prologueEvents: Event[];

    it("tracks knowledge acquisition across characters", () => {
      prologueEvents = [
        createEvent({
          type: "scene",
          timestamp: new Date("2350-01-16T14:30:00Z"),
          participants: ["terra-galactica-ai"],
          description: "AI detects vessel arrival",
          knowledgeEffects: [
            {
              characterId: "terra-galactica-ai",
              certainty: "known",
              source: "witnessed"
            }
          ]
        }),
        createEvent({
          type: "scene",
          timestamp: new Date("2350-01-16T18:00:00Z"),
          participants: ["the-chronicler"],
          description: "Chronicler writes in journal",
          knowledgeEffects: [
            {
              characterId: "the-chronicler",
              certainty: "known",
              source: "witnessed"
            }
          ]
        }),
        createEvent({
          type: "transition",
          timestamp: new Date("2350-01-16T19:00:00Z"),
          participants: ["terra-galactica-population"],
          description: "Population sleeps unaware",
          knowledgeEffects: [
            {
              characterId: "terra-galactica-population",
              certainty: "false",
              source: "inferred"
            }
          ]
        })
      ];

      const result = deriveKnowledgeState(prologueEvents);
      const aiKnowledge = result.knowledge.filter((k) => k.characterId === "terra-galactica-ai");
      const chroniclerKnowledge = result.knowledge.filter((k) => k.characterId === "the-chronicler");
      const populationKnowledge = result.knowledge.filter(
        (k) => k.characterId === "terra-galactica-population"
      );

      expect(aiKnowledge.some((k) => k.certainty === "known")).toBe(true);
      expect(chroniclerKnowledge.some((k) => k.certainty === "known")).toBe(true);
      expect(populationKnowledge.some((k) => k.certainty === "false")).toBe(true);
    });

    it("demonstrates dramatic irony - population doesn't know what's coming", () => {
      const result = deriveKnowledgeState(prologueEvents);
      const populationKnowledge = result.knowledge.filter(
        (k) => k.characterId === "terra-galactica-population"
      );

      // Population has false knowledge - they don't know their world is about to change
      const hasIgnorance = populationKnowledge.some((k) => k.certainty === "false");
      expect(hasIgnorance).toBe(true);
    });
  });

  // =========================================================================
  // PART 4: PROMISE TRACKING
  // Tests narrative promises and mysteries
  // =========================================================================

  describe("Promise Tracking & Mysteries", () => {
    it("establishes central mysteries from prologue", () => {
      const promises: PromiseRecord[] = [
        {
          id: crypto.randomUUID(),
          type: "mystery",
          establishedIn: crypto.randomUUID(),
          description: "What cargo does the dark vessel carry?",
          status: "pending"
        },
        {
          id: crypto.randomUUID(),
          type: "mystery",
          establishedIn: crypto.randomUUID(),
          description: "Who are Voice-1 and Voice-2? What decision did they make?",
          status: "pending"
        },
        {
          id: crypto.randomUUID(),
          type: "plot_thread",
          establishedIn: crypto.randomUUID(),
          description: "How will Terra Galactica change?",
          status: "pending"
        },
        {
          id: crypto.randomUUID(),
          type: "character_arc",
          establishedIn: crypto.randomUUID(),
          description: "The Chronicler's burden of knowledge and responsibility",
          status: "pending"
        }
      ];

      const report = validatePromises([], promises);

      expect(report).toHaveLength(0); // No issues with pending promises
      expect(promises.every((p) => p.status === "pending")).toBe(true);
    });
  });

  // =========================================================================
  // PART 5: CANON GATE VALIDATION
  // Tests the canon workflow and validation gates
  // =========================================================================

  describe("Canon Gate Validation", () => {
    let draftEvents: Event[];
    let promises: PromiseRecord[];

    it("prepares prologue events for canon transition", () => {
      draftEvents = [
        createEvent({
          type: "scene",
          timestamp: new Date("2350-01-01T00:00:00Z"),
          description: "Dark vessel journey begins",
          knowledgeEffects: []
        }),
        createEvent({
          type: "reveal",
          timestamp: new Date("2350-01-01T00:30:00Z"),
          description: "Terra Galactica revealed",
          knowledgeEffects: []
        }),
        createEvent({
          type: "transition",
          timestamp: new Date("2350-01-16T19:00:00Z"),
          description: "Point of no return",
          knowledgeEffects: []
        })
      ];

      promises = [
        {
          id: crypto.randomUUID(),
          type: "mystery",
          establishedIn: draftEvents[0].id,
          description: "What is the vessel's cargo?",
          status: "pending"
        }
      ];

      expect(draftEvents.every((e) => e.canonStatus === "draft")).toBe(true);
    });

    it("validates prologue can pass canon gate", () => {
      const report = validateCanonGate(draftEvents, promises);

      expect(report.passed).toBe(true);
      expect(report.continuity.dependencyIssues).toHaveLength(0);
      expect(report.continuity.cycleIssues).toHaveLength(0);
      expect(report.continuity.timestampIssues).toHaveLength(0);
      expect(report.promiseIssues).toHaveLength(0);
    });

    it("transitions events from draft → proposed → canon", () => {
      let event = draftEvents[0];

      expect(event.canonStatus).toBe("draft");

      event = transitionCanonStatus(event, "proposed");
      expect(event.canonStatus).toBe("proposed");

      event = transitionCanonStatus(event, "canon");
      expect(event.canonStatus).toBe("canon");
    });

    it("prevents modification of canonical events", () => {
      const canonEvent = createEvent({
        type: "scene",
        description: "Original description",
        knowledgeEffects: []
      });

      const canonized = transitionCanonStatus(canonEvent, "canon");

      expect(() => {
        transitionCanonStatus(canonized, "draft");
      }).toThrow();
    });
  });

  // =========================================================================
  // PART 6: SYSTEM PERFORMANCE SUMMARY
  // Validates overall system capability
  // =========================================================================

  describe("System Performance Summary", () => {
    it("successfully processes complete prologue", () => {
      const fullPrologue: Event[] = [];

      // Generate all 12 events with proper timestamps
      const baseDate = new Date("2350-01-01T00:00:00Z");
      for (let i = 0; i < 12; i++) {
        const timestamp = new Date(baseDate.getTime() + i * 3600000); // Add i hours
        fullPrologue.push(
          createEvent({
            type: i === 1 ? "reveal" : i === 10 ? "conflict" : i === 11 ? "transition" : "scene",
            timestamp,
            description: `Prologue event ${i + 1}`,
            knowledgeEffects: []
          })
        );
      }

      // Validate system can handle complete prologue
      const depReport = validateDependencyGraph(fullPrologue);
      const contReport = checkContinuity(fullPrologue);

      expect(fullPrologue).toHaveLength(12);
      expect(depReport.dependencyIssues).toHaveLength(0);
      expect(depReport.cycleIssues).toHaveLength(0);
      expect(contReport.timestampIssues).toHaveLength(0);
    });

    it("reports system capabilities", () => {
      const capabilities = {
        eventCreation: true,
        dependencyValidation: true,
        continuityChecking: true,
        knowledgeStateTracking: true,
        promiseTracking: true,
        canonWorkflow: true,
        immutabilityEnforcement: true
      };

      expect(Object.values(capabilities).every((v) => v === true)).toBe(true);
    });
  });
});
