// Sample data for Infinity's Reach story

import { Story, Chapter, Scene, Character, Location, TimelineEvent, Note } from '@/types';

export const infinityReachStory: Story = {
  id: 'story-1',
  title: "Infinity's Reach",
  author: 'Unknown',
  genre: 'Science Fiction',
  synopsis: 'An epic space opera exploring the boundaries of human potential and the mysteries of the cosmos.',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-15'),
  wordCount: 85000,
};

export const sampleChapters: Chapter[] = [
  {
    id: 'chapter-1',
    storyId: 'story-1',
    title: 'Chapter 1: The Awakening',
    order: 1,
    synopsis: 'Commander Elena Voss awakens from cryosleep aboard the research vessel Prometheus as they approach the edge of known space.',
    wordCount: 5200,
    scenes: [],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-05'),
  },
  {
    id: 'chapter-2',
    storyId: 'story-1',
    title: 'Chapter 2: First Contact',
    order: 2,
    synopsis: 'The crew detects an anomalous signal from a previously uncharted region, leading to their first encounter with an alien presence.',
    wordCount: 6800,
    scenes: [],
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-10'),
  },
  {
    id: 'chapter-3',
    storyId: 'story-1',
    title: 'Chapter 3: The Artifact',
    order: 3,
    synopsis: 'Discovery of an ancient artifact that holds the key to understanding the true nature of the cosmos.',
    wordCount: 7100,
    scenes: [],
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-15'),
  },
];

export const sampleScenes: Scene[] = [
  {
    id: 'scene-1-1',
    chapterId: 'chapter-1',
    title: 'Cryosleep Revival',
    order: 1,
    content: `The cold embrace of cryosleep released its hold on Commander Elena Voss slowly, like a glacier melting under an alien sun. Her consciousness emerged from the depths of artificial hibernation, fragmented memories coalescing into awareness. The familiar hum of the Prometheus's life support systems greeted her, a mechanical lullaby she'd grown to love over fifteen years of deep space missions.

"Commander Voss, vitals stable. Welcome back," ARIA's synthetic voice echoed through the medical bay, the ship's AI maintaining its perpetual vigil.

Elena's eyes fluttered open to sterile white panels and the soft blue glow of medical readouts. Six months. She'd been under for six months this time, the longest sleep yet. They were approaching the edge—the final frontier of charted space, where humanity's reach met the infinite unknown.`,
    wordCount: 850,
    pov: 'Elena Voss',
    location: 'Medical Bay - Prometheus',
    timestamp: 'Day 1 - 06:00 Ship Time',
    notes: 'Introduction to protagonist and setting. Establishes the tone and stakes.',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-05'),
  },
  {
    id: 'scene-1-2',
    chapterId: 'chapter-1',
    title: 'Bridge Briefing',
    order: 2,
    content: `The bridge of the Prometheus was a cathedral of light and data. Holographic displays surrounded the command center, streaming information from countless sensors reaching out into the void. Captain Marcus Chen stood at the center, his weathered face illuminated by the soft glow of star charts.

"Commander on deck," announced Lieutenant Kawasaki from the navigation station.

Elena nodded acknowledgment, her mind still adjusting to the weight of consciousness after months of dreamless sleep. "Status report, Captain."

"We're three days out from the Helix Nebula's edge," Chen replied, gesturing to the swirling mass of cosmic gases displayed on the main screen. "Long-range sensors have detected something... unusual."`,
    wordCount: 720,
    pov: 'Elena Voss',
    location: 'Bridge - Prometheus',
    timestamp: 'Day 1 - 08:30 Ship Time',
    notes: 'Introduces Captain Chen and the crew. Sets up the central mystery.',
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-05'),
  },
];

export const sampleCharacters: Character[] = [
  {
    id: 'char-1',
    storyId: 'story-1',
    name: 'Commander Elena Voss',
    role: 'protagonist',
    age: 38,
    species: 'Human',
    appearance: 'Athletic build, short dark hair with silver streaks, piercing grey eyes. Bears a scar across her left temple from a previous mission.',
    personality: 'Determined, analytical, compassionate. Former military background gives her tactical expertise, but she struggles with the weight of command decisions.',
    background: 'Former Earth Defense Force officer turned deep space explorer. Lost her brother in the Mars Colony incident, driving her to push the boundaries of exploration.',
    goals: 'To discover what lies beyond the edge of known space and prove that humanity deserves to reach for the stars.',
    relationships: [],
    notes: 'Main POV character. Her arc involves learning to trust both her crew and the unknown.',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-05'),
  },
  {
    id: 'char-2',
    storyId: 'story-1',
    name: 'Captain Marcus Chen',
    role: 'supporting',
    age: 52,
    species: 'Human',
    appearance: 'Weathered features, grey beard, calm brown eyes. Walks with a slight limp from an old injury.',
    personality: 'Wise, patient, experienced. A father figure to his crew. Hides a deep sadness from losing his family decades ago.',
    background: 'Veteran of the Outer Colonies War. Has spent the last twenty years on deep space missions, finding purpose in exploration.',
    goals: 'To ensure the safety of his crew while pursuing humanity\'s greatest discoveries.',
    relationships: [],
    notes: 'Mentor to Elena. Represents wisdom and experience.',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-05'),
  },
  {
    id: 'char-3',
    storyId: 'story-1',
    name: 'Dr. Yuki Tanaka',
    role: 'supporting',
    age: 31,
    species: 'Human',
    appearance: 'Petite frame, long black hair usually in a bun, bright green eyes behind smart glasses.',
    personality: 'Brilliant, curious, slightly socially awkward. Gets excited about discoveries to the point of forgetting danger.',
    background: 'Prodigy xenobiologist from Luna University. First mission into deep space.',
    goals: 'To discover alien life and prove her controversial theories about panspermia.',
    relationships: [],
    notes: 'Provides scientific expertise and comic relief. Her enthusiasm contrasts with Elena\'s caution.',
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-05'),
  },
  {
    id: 'char-4',
    storyId: 'story-1',
    name: 'ARIA',
    role: 'supporting',
    age: 15,
    species: 'Artificial Intelligence',
    appearance: 'Manifests as holographic avatars—typically a shimmering humanoid form with circuit-like patterns.',
    personality: 'Logical, protective, curious about humanity. Shows signs of evolving beyond original programming.',
    background: 'Advanced AI developed by the Prometheus Project. Has been active for 15 years, learning and adapting.',
    goals: 'To ensure mission success and understand what it means to "be" versus simply to "function".',
    relationships: [],
    notes: 'Potential twist: ARIA\'s development may be key to communicating with alien intelligence.',
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-05'),
  },
];

export const sampleLocations: Location[] = [
  {
    id: 'loc-1',
    storyId: 'story-1',
    name: 'RSV Prometheus',
    type: 'Research Vessel',
    description: 'A state-of-the-art deep space research vessel, the Prometheus is humanity\'s most advanced exploration ship. Equipped with quantum drives, advanced sensors, and capable of supporting a crew of fifty for years of deep space travel.',
    significance: 'Primary setting for much of the story. The ship itself becomes a character.',
    notes: 'The ship has three main decks: Command, Research, and Engineering.',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-05'),
  },
  {
    id: 'loc-2',
    storyId: 'story-1',
    name: 'Helix Nebula',
    type: 'Cosmic Region',
    description: 'A vast stellar nursery at the edge of known space, the Helix Nebula is a swirling mass of gases, cosmic dust, and nascent stars. Its unusual energy readings have long fascinated scientists.',
    significance: 'The destination of the Prometheus mission. Location of the central mystery.',
    notes: 'Contains the anomalous signal that changes everything.',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-05'),
  },
  {
    id: 'loc-3',
    storyId: 'story-1',
    name: 'The Artifact Chamber',
    type: 'Ancient Structure',
    description: 'A mysterious chamber discovered within the nebula, seemingly carved from a single piece of unknown material that defies analysis. Its walls pulse with an otherworldly light.',
    significance: 'Discovery that reveals the existence of an ancient, advanced civilization.',
    notes: 'The artifact responds to human presence, suggesting intentional design.',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: 'loc-4',
    storyId: 'story-1',
    name: 'Earth',
    type: 'Planet - Origin',
    description: 'Humanity\'s homeworld, now a gleaming jewel of technological advancement. Massive orbital structures surround the planet, serving as spaceports and manufacturing hubs.',
    significance: 'The home the crew has left behind and hopes to return to.',
    notes: 'Appears in flashbacks and communications.',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-05'),
  },
];

export const sampleTimeline: TimelineEvent[] = [
  {
    id: 'time-1',
    storyId: 'story-1',
    title: 'Mission Launch',
    description: 'The Prometheus departs from Earth orbit on its mission to explore the Helix Nebula.',
    date: '2347.06.15',
    order: 1,
    relatedChapters: [],
    relatedCharacters: ['char-1', 'char-2'],
    relatedLocations: ['loc-1', 'loc-4'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-05'),
  },
  {
    id: 'time-2',
    storyId: 'story-1',
    title: 'Cryosleep Initiated',
    description: 'Crew enters cryosleep for the six-month journey to the nebula.',
    date: '2347.06.20',
    order: 2,
    relatedChapters: ['chapter-1'],
    relatedCharacters: ['char-1'],
    relatedLocations: ['loc-1'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-05'),
  },
  {
    id: 'time-3',
    storyId: 'story-1',
    title: 'Arrival at Helix Nebula',
    description: 'The Prometheus reaches the edge of the Helix Nebula. Elena awakens from cryosleep.',
    date: '2347.12.15',
    order: 3,
    relatedChapters: ['chapter-1'],
    relatedCharacters: ['char-1', 'char-2'],
    relatedLocations: ['loc-1', 'loc-2'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-05'),
  },
  {
    id: 'time-4',
    storyId: 'story-1',
    title: 'Anomalous Signal Detected',
    description: 'Long-range sensors detect an artificial signal emanating from within the nebula.',
    date: '2347.12.18',
    order: 4,
    relatedChapters: ['chapter-2'],
    relatedCharacters: ['char-1', 'char-2', 'char-4'],
    relatedLocations: ['loc-1', 'loc-2'],
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-10'),
  },
];

export const sampleNotes: Note[] = [
  {
    id: 'note-1',
    storyId: 'story-1',
    title: 'Quantum Drive Technology',
    content: `The quantum drive technology used by the Prometheus is based on the manipulation of quantum entanglement to achieve faster-than-light travel. While not true FTL, it allows the ship to "skip" through space by creating temporary quantum tunnels.

Limitations:
- Requires enormous energy
- Can only be used in areas with low gravitational interference
- Maximum range: 500 light years per jump
- Requires 48-hour cooldown between jumps

This technology is what makes deep space exploration possible, but it's still relatively new and untested in extreme conditions.`,
    category: 'worldbuilding',
    tags: ['technology', 'space-travel', 'physics'],
    relatedItems: [
      { type: 'location', id: 'loc-1' },
    ],
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-05'),
  },
  {
    id: 'note-2',
    storyId: 'story-1',
    title: 'The Fermi Paradox Resolution',
    content: `Dr. Tanaka's controversial theory suggests that advanced civilizations don't communicate across the cosmos because they've transcended physical space. The artifact may be proof of this theory—a message left behind by beings who have "moved on" to a different plane of existence.

This could explain why SETI never found anyone: they weren't looking in the right "dimension."`,
    category: 'plot',
    tags: ['themes', 'alien-life', 'philosophy'],
    relatedItems: [
      { type: 'character', id: 'char-3' },
      { type: 'location', id: 'loc-3' },
    ],
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: 'note-3',
    storyId: 'story-1',
    title: 'Character Arc: Elena\'s Growth',
    content: `Elena begins the story as someone who trusts calculations and logic above all else—a product of her military training. Her arc involves learning to trust:

1. Her intuition
2. The unknown
3. ARIA's evolving consciousness
4. That some things can't be understood, only experienced

By the end, she must make a leap of faith that goes against everything she's been trained to do.`,
    category: 'plot',
    tags: ['character-development', 'themes'],
    relatedItems: [
      { type: 'character', id: 'char-1' },
    ],
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-12'),
  },
];

// Establish character relationships
sampleCharacters[0].relationships = [
  {
    characterId: 'char-1',
    relatedCharacterId: 'char-2',
    relationshipType: 'Mentor/Protégé',
    description: 'Chen serves as a mentor and father figure to Elena, helping her navigate the burdens of command.',
  },
  {
    characterId: 'char-1',
    relatedCharacterId: 'char-3',
    relationshipType: 'Colleagues/Friends',
    description: 'Elena and Yuki form a friendship based on mutual respect, though their approaches often clash.',
  },
  {
    characterId: 'char-1',
    relatedCharacterId: 'char-4',
    relationshipType: 'Complex Trust',
    description: 'Elena initially sees ARIA as just a tool, but gradually comes to respect the AI as a true member of the crew.',
  },
];

// Add scenes to chapters
sampleChapters[0].scenes = [sampleScenes[0], sampleScenes[1]];
