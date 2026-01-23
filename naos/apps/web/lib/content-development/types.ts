/**
 * AI Content Development System Types
 *
 * See docs/ai_content_development_system.md for full documentation
 */

// ============================================================================
// ENUMS AND BASIC TYPES
// ============================================================================

export type ContentSessionType = "discovery" | "development" | "outline" | "studio";
export type ContentSessionStatus = "active" | "paused" | "completed" | "abandoned";
export type OutlineLevel = "story" | "book" | "act" | "chapter" | "scene";
export type OutlineStatus = "concept" | "draft" | "outlined" | "written" | "complete";
export type ProfileUpdateSource = "conversation" | "writing" | "manual" | "extraction";
export type CanonStatus = "draft" | "proposed" | "canon";

export type CodexEntryType =
  | "character"
  | "location"
  | "object"
  | "faction"
  | "lore"
  | "timeline";

// ============================================================================
// CONVERSATION & MESSAGE TYPES
// ============================================================================

export interface ConversationMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  metadata?: {
    extractedConcepts?: ConceptSketch[];
    fieldsUpdated?: string[];
    questionsAsked?: string[];
  };
}

export interface ConceptSketch {
  type: "character_sketch" | "setting_concept" | "plot_idea" | "relationship" | "theme";
  name?: string;
  notes: string;
  inferredTraits?: Record<string, unknown>;
  openQuestions?: string[];
  potentialConnections?: string[];
}

// ============================================================================
// SESSION TYPES
// ============================================================================

export interface ContentSession {
  id: string;
  projectId: string;
  sessionType: ContentSessionType;
  targetType?: string;
  targetId?: string;
  status: ContentSessionStatus;
  conversation: ConversationMessage[];
  pendingUpdates: FieldUpdate[];
  completionStatus: Record<string, "complete" | "partial" | "incomplete">;
  modeState: DiscoveryModeState | DevelopmentModeState | OutlineModeState | StudioModeState;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface DiscoveryModeState {
  topic: string;
  mode: "character" | "setting" | "plot" | "open";
  capturedConcepts: ConceptSketch[];
  threadsToExplore: string[];
  questionsOpen: string[];
}

export interface DevelopmentModeState {
  entryType: CodexEntryType;
  questionsAsked: number;
  questionsRemaining: number;
  nextQuestions: string[];
  currentProfileDraft: Partial<CharacterProfile | LocationProfile | FactionProfile>;
}

export interface OutlineModeState {
  currentLevel: OutlineLevel;
  parentOutlineId?: string;
  guidingQuestions: string[];
  drillDownOptions: string[];
}

export interface StudioModeState {
  sceneId: string;
  currentBeat: number;
  totalBeats: number;
  contextLoaded: boolean;
  consistencyWarnings: ConsistencyWarning[];
}

// ============================================================================
// FIELD UPDATE TYPES
// ============================================================================

export interface FieldUpdate {
  fieldPath: string;
  previousValue?: unknown;
  newValue: unknown;
  confidence?: number;
  source: ProfileUpdateSource;
  approved?: boolean;
}

export interface ProfileUpdate {
  id: string;
  entryId: string;
  sessionId?: string;
  fieldPath: string;
  previousValue?: unknown;
  newValue: unknown;
  sourceType: ProfileUpdateSource;
  sourceReference?: string;
  autoApplied: boolean;
  approvedBy?: string;
  approvedAt?: Date;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
}

// ============================================================================
// CHARACTER PROFILE TYPES
// ============================================================================

export interface CharacterProfile {
  // Identity
  id: string;
  projectId: string;
  name: string;
  aliases: string[];

  // Core Identity
  role: CharacterRole;
  summary: string;
  description: string;

  // Personality
  personality: {
    traits: string[];
    strengths: string[];
    flaws: string[];
    fears: string[];
    desires: string[];
    values: string[];
    quirks: string[];
  };

  // Physical
  physical: {
    age: string;
    gender: string;
    appearance: string;
    distinguishingFeatures: string[];
  };

  // Voice & Speech
  voice: {
    profileId: string;
    speechPatterns: string;
    vocabularyLevel: "simple" | "moderate" | "sophisticated" | "technical";
    accent: string;
    verbalTics: string[];
    emotionalRange: string;
  };

  // Background
  background: {
    backstory: string;
    origin: string;
    occupation: string;
    education: string;
    keyEvents: string[];
  };

  // Goals & Motivation
  goals: {
    primary: string;
    secondary: string[];
    internal: string;
    motivation: string;
  };

  // Relationships
  relationships: CharacterRelationship[];

  // Arc Tracking
  arc: {
    type: ArcType;
    startingState: string;
    endingState: string;
    currentStage: string;
    keyMoments: ArcMoment[];
  };

  // Story Metadata
  story: {
    povEligible: boolean;
    firstAppearance: string;
    lastAppearance?: string;
    chapterAppearances: string[];
    importance: "major" | "supporting" | "minor" | "mentioned";
  };

  // Knowledge State
  knowledge: {
    knows: KnowledgeItem[];
    doesntKnow: string[];
    secrets: string[];
    liesTold: string[];
  };

  // Private Notes
  notes: string;

  // Organization
  tags: string[];
  canonStatus: CanonStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type CharacterRole =
  | "protagonist"
  | "deuteragonist"
  | "antagonist"
  | "mentor"
  | "ally"
  | "love_interest"
  | "comic_relief"
  | "foil"
  | "guardian"
  | "herald"
  | "shapeshifter"
  | "trickster"
  | "supporting"
  | "background";

export type ArcType =
  | "positive_change"
  | "negative_change"
  | "flat"
  | "disillusionment"
  | "transformation"
  | "maturation"
  | "redemption"
  | "corruption"
  | "unknown";

export interface CharacterRelationship {
  characterId: string;
  type: RelationshipType;
  description: string;
  history: string;
  tension: string;
  dynamic: "stable" | "evolving" | "volatile";
}

export type RelationshipType =
  | "family_parent"
  | "family_child"
  | "family_sibling"
  | "family_extended"
  | "romantic_partner"
  | "romantic_former"
  | "romantic_interest"
  | "friend_close"
  | "friend_casual"
  | "friend_former"
  | "enemy_personal"
  | "enemy_professional"
  | "enemy_ideological"
  | "mentor"
  | "mentee"
  | "colleague"
  | "rival"
  | "subordinate"
  | "superior"
  | "acquaintance"
  | "stranger_significant";

export interface ArcMoment {
  sceneId: string;
  description: string;
  change: string;
  stage: string;
}

export interface KnowledgeItem {
  fact: string;
  certainty: "known" | "suspected" | "rumored" | "false";
  learnedIn: string;
  source: "witnessed" | "told" | "inferred";
}

// ============================================================================
// LOCATION PROFILE TYPES
// ============================================================================

export interface LocationProfile {
  id: string;
  projectId: string;
  name: string;
  aliases: string[];
  summary: string;
  description: string;

  // Location-specific
  parentLocationId?: string;
  atmosphere: string;
  features: string[];
  typicalInhabitants: string[];
  coordinates?: {
    deck?: string;
    sector?: string;
    region?: string;
  };

  // Audio
  audioContext: {
    ambientProfile?: string;
    soundEffectTags?: string[];
    pronunciationGuide?: string;
  };

  // Organization
  tags: string[];
  canonStatus: CanonStatus;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// FACTION PROFILE TYPES
// ============================================================================

export interface FactionProfile {
  id: string;
  projectId: string;
  name: string;
  aliases: string[];
  summary: string;
  description: string;

  // Faction-specific
  ideology: string;
  structure: string;
  headquartersId?: string;
  leaderId?: string;
  memberIds: string[];

  // Organization
  tags: string[];
  canonStatus: CanonStatus;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// OUTLINE TYPES
// ============================================================================

export interface Outline {
  id: string;
  projectId: string;
  outlineLevel: OutlineLevel;
  parentId?: string;
  sequenceOrder: number;
  title: string;
  subtitle?: string;
  content: StoryOutlineContent | BookOutlineContent | ActOutlineContent | ChapterOutlineContent | SceneOutlineContent;
  povCharacterId?: string;
  locationId?: string;
  timeAnchor?: Date;
  timeDescription?: string;
  charactersPresent: CharacterPresence[];
  pinnedContext: PinnedContextEntry[];
  estimatedWords?: number;
  estimatedAudioMinutes?: number;
  status: OutlineStatus;
  canonStatus: CanonStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CharacterPresence {
  characterId: string;
  role: "pov" | "active" | "background" | "mentioned";
}

export interface PinnedContextEntry {
  codexEntryId: string;
  reason: string;
  priority: number;
}

// Story level outline content
export interface StoryOutlineContent {
  logline: string;
  coreThemes: string[];
  centralMystery: string;
  primaryCharacters: {
    name: string;
    role: string;
    arcSummary: string;
  }[];
  settingSummary: string;
  estimatedLength: string;
  targetMedium: string;
}

// Book level outline content
export interface BookOutlineContent {
  premise: string;
  stakes: string;
  acts: {
    actNumber: number;
    name: string;
    purpose: string;
  }[];
}

// Act level outline content
export interface ActOutlineContent {
  purpose: string;
  chapters: string; // e.g., "1-8"
  keyEvents: string[];
  characterArcs: Record<string, string>; // character_id -> stage description
  promisesEstablished: string[];
}

// Chapter level outline content
export interface ChapterOutlineContent {
  purpose: string;
  chapterGoals: {
    plot: string;
    character: string;
    relationship?: string;
  };
  povCharacter: string;
  scenes: {
    id: string;
    title: string;
    summary: string;
    goals: string[];
  }[];
  chapterPromises: {
    advances: string[];
    demonstrates: string[];
    establishes: string[];
  };
}

// Scene level outline content
export interface SceneOutlineContent {
  synopsis: string;
  sceneGoals: {
    plot: SceneGoal[];
    character: SceneGoal[];
    world: SceneGoal[];
    reader: SceneGoal[];
  };
  promiseTracking: {
    advances: PromiseProgress[];
    demonstrates: PromiseProgress[];
    establishes: PromiseProgress[];
    fulfills: PromiseProgress[];
  };
  beats: Beat[];
  eventsEstablished: SceneEvent[];
  knowledgeChanges: KnowledgeChange[];
  audioNotes: AudioNotes;
  authorNotes?: string;
}

export interface SceneGoal {
  goal: string;
  achievement: string;
  importance: "primary" | "secondary";
}

export interface PromiseProgress {
  promiseId?: string;
  description?: string;
  type: string;
  how: string;
  progress?: string;
}

export interface Beat {
  id: number;
  type: BeatType;
  title?: string;
  summary: string;
  purpose: string;
  storyFunction?: string;
  charactersActive: string[];
  povKnowledgeChange?: KnowledgeChange[];
  emotionalState: Record<string, string>;
  emotionalShift?: string;
  keyDialogue?: DialogueLine[];
  dialogueNotes?: string;
  durationEstimate: "brief" | "medium" | "extended";
  pacing?: string;
  audioDirection: string;
  beatMarkers?: BeatMarker[];
  foreshadows?: string[];
  callbacks?: string[];
  promiseProgress?: PromiseProgress[];
}

export type BeatType =
  | "establishing"
  | "action"
  | "dialogue"
  | "introspection"
  | "revelation"
  | "decision"
  | "transition"
  | "climax"
  | "resolution"
  | "hook";

export interface DialogueLine {
  speaker: string;
  line: string;
  subtext?: string;
}

export interface BeatMarker {
  type: "pause" | "emphasis" | "pace_change" | "emotional_shift";
  position: string;
  duration?: string;
  intensity?: string;
  direction?: string;
  from?: string;
  to?: string;
  purpose: string;
}

export interface SceneEvent {
  type: string;
  timestamp: string;
  description: string;
  participants: string[];
  location?: string;
  impacts: EventImpact[];
}

export interface EventImpact {
  type: string;
  target: string;
  content: string;
}

export interface KnowledgeChange {
  character: string;
  learns: string;
  certainty: "known" | "suspected" | "rumored";
  source: "witnessed" | "told" | "inferred";
}

export interface AudioNotes {
  pacing: string;
  emotionalArc: {
    start: string;
    middle: string;
    end: string;
  };
  ambient: {
    base: string;
    layers: string[];
  };
  voiceNotes: Record<string, string>;
  keyAudioMoments: {
    beat: number;
    direction: string;
    importance: string;
  }[];
  beatMarkers: BeatMarker[];
}

// ============================================================================
// STUDIO MODE TYPES
// ============================================================================

export interface StudioContext {
  sceneId: string;
  outline: SceneOutlineContent;
  povCharacter: CharacterProfile;
  presentCharacters: Partial<CharacterProfile>[];
  location?: LocationProfile;
  activePromises: ActivePromise[];
  previousSceneSummary?: string;
  pinnedEntries: CodexEntry[];
}

export interface CodexEntry {
  id: string;
  type: CodexEntryType;
  name: string;
  summary: string;
  description: string;
  typeData: Record<string, unknown>;
}

export interface ActivePromise {
  id: string;
  type: string;
  description: string;
  status: string;
  thisSceneAction: "advancement" | "demonstration" | "establishment" | "fulfillment";
}

export interface ConsistencyWarning {
  type: "voice_drift" | "knowledge_violation" | "arc_inconsistency" | "continuity_error" | "promise_neglect";
  description: string;
  suggestion: string;
  severity: "error" | "warning" | "info";
  resolved?: boolean;
}

export interface ConsistencyReport {
  issues: ConsistencyIssue[];
  suggestions: Suggestion[];
}

export interface ConsistencyIssue {
  type: string;
  description: string;
  location?: string;
  severity: "error" | "warning" | "info";
}

export interface Suggestion {
  type: string;
  original: string;
  suggested: string;
  reason: string;
}

export interface ProfileDiscovery {
  characterId: string;
  fieldPath: string;
  value: unknown;
  type: "discovery" | "relationship" | "knowledge";
  context: string;
}

// ============================================================================
// MCP TOOL INPUT/OUTPUT TYPES
// ============================================================================

// Discovery Mode Tools
export interface DiscoveryStartInput {
  topic: string;
  mode: "character" | "setting" | "plot" | "open";
}

export interface DiscoveryStartOutput {
  sessionId: string;
  openingPrompt: string;
}

export interface DiscoveryRespondInput {
  sessionId: string;
  userInput: string;
}

export interface DiscoveryRespondOutput {
  extractedConcepts: ConceptSketch[];
  followUpPrompt: string;
  threadsOpened: string[];
}

// Development Mode Tools
export interface ProfileDevelopInput {
  entryType: CodexEntryType;
  entryId?: string;
  initialConcept?: ConceptSketch;
}

export interface ProfileDevelopOutput {
  sessionId: string;
  currentProfile: Partial<CharacterProfile | LocationProfile | FactionProfile>;
  completionStatus: Record<string, "complete" | "partial" | "incomplete">;
  nextQuestion: string;
}

export interface ProfileAnswerInput {
  sessionId: string;
  answer: string;
}

export interface ProfileAnswerOutput {
  extractedFields: FieldUpdate[];
  needsClarification?: ClarificationRequest;
  profilePreview: Partial<CharacterProfile | LocationProfile | FactionProfile>;
  nextQuestion: string;
  completionStatus: Record<string, "complete" | "partial" | "incomplete">;
}

export interface ClarificationRequest {
  question: string;
  options?: string[];
  context: string;
}

export interface ProfileSaveInput {
  sessionId: string;
  approvedChanges: FieldUpdate[];
}

export interface ProfileSaveOutput {
  entryId: string;
  savedProfile: CharacterProfile | LocationProfile | FactionProfile;
}

// Outline Mode Tools
export interface OutlineCreateInput {
  level: OutlineLevel;
  parentId?: string;
  initialConcept?: string;
}

export interface OutlineCreateOutput {
  sessionId: string;
  outlineDraft: Outline;
  guidingQuestions: string[];
}

export interface OutlineDevelopInput {
  sessionId: string;
  userInput: string;
}

export interface OutlineDevelopOutput {
  outlineUpdates: OutlineUpdate[];
  nextQuestions: string[];
  drillDownOptions?: string[];
}

export interface OutlineUpdate {
  fieldPath: string;
  value: unknown;
}

// Studio Mode Tools
export interface ContextAssembleInput {
  sceneId: string;
}

export interface ContextAssembleOutput {
  fullContext: StudioContext;
  warnings: ConsistencyWarning[];
}

export interface BeatWriteInput {
  sceneId: string;
  beatNumber: number;
  userGuidance?: string;
}

export interface BeatWriteOutput {
  prose: string;
  consistencyCheck: ConsistencyReport;
  profileDiscoveries: ProfileDiscovery[];
}

export interface ConsistencyCheckInput {
  prose: string;
  context: StudioContext;
}

export interface ConsistencyCheckOutput {
  issues: ConsistencyIssue[];
  suggestions: Suggestion[];
}

// Profile Extraction Tools
export interface ExtractFromProseInput {
  prose: string;
  charactersInvolved: string[];
  location?: string;
}

export interface ExtractFromProseOutput {
  characterDiscoveries: ProfileDiscovery[];
  relationshipUpdates: RelationshipUpdate[];
  knowledgeChanges: KnowledgeChange[];
  suggestedUpdates: ProfileUpdate[];
}

export interface RelationshipUpdate {
  sourceCharacterId: string;
  targetCharacterId: string;
  type: RelationshipType;
  description: string;
  dynamic: "stable" | "evolving" | "volatile";
}

export interface UpdateApplyInput {
  updates: ProfileUpdate[];
  autoApply: boolean;
}

export interface UpdateApplyOutput {
  applied: ProfileUpdate[];
  pendingApproval: ProfileUpdate[];
  conflicts: UpdateConflict[];
}

export interface UpdateConflict {
  updateId: string;
  fieldPath: string;
  existingValue: unknown;
  newValue: unknown;
  reason: string;
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

export interface CreateSessionRequest {
  projectId: string;
  sessionType: ContentSessionType;
  targetType?: string;
  targetId?: string;
  initialInput?: string;
}

export interface SessionResponse {
  session: ContentSession;
  response?: string;
  extractedData?: unknown;
}

export interface ContinueSessionRequest {
  userInput: string;
}

export interface SaveSessionRequest {
  approvedUpdates?: FieldUpdate[];
}

export interface CreateOutlineRequest {
  projectId: string;
  level: OutlineLevel;
  parentId?: string;
  title: string;
  initialConcept?: string;
}

export interface UpdateOutlineRequest {
  title?: string;
  subtitle?: string;
  content?: Partial<StoryOutlineContent | BookOutlineContent | ActOutlineContent | ChapterOutlineContent | SceneOutlineContent>;
  status?: OutlineStatus;
  canonStatus?: CanonStatus;
}

export interface PendingUpdatesResponse {
  updates: ProfileUpdate[];
  totalCount: number;
}

export interface ApproveUpdatesRequest {
  updateIds: string[];
  approvedBy: string;
}

export interface RejectUpdatesRequest {
  updateIds: string[];
  reason?: string;
}
