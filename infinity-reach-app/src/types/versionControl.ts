// Version control types for story management (GitHub-style)

export interface StoryCommit {
  id: string;
  message: string;
  author: string;
  timestamp: Date;
  branch: string;
  parentCommitId?: string;
  changes: StoryChange[];
}

export interface StoryChange {
  type: 'create' | 'update' | 'delete';
  resourceType: 'chapter' | 'scene' | 'character' | 'location' | 'note';
  resourceId: string;
  before?: any; // Previous state
  after?: any; // New state
  diff?: string; // Text diff for content
}

export interface StoryBranch {
  name: string;
  headCommitId: string;
  createdAt: Date;
  createdFrom: string; // parent branch name
  description: string;
  isActive: boolean;
}

export interface StoryVersion {
  commitId: string;
  branch: string;
  timestamp: Date;
  snapshot: {
    chapters: any[];
    scenes: any[];
    characters: any[];
    locations: any[];
    notes: any[];
  };
}

export interface PullRequest {
  id: string;
  title: string;
  description: string;
  sourceBranch: string;
  targetBranch: string;
  status: 'open' | 'merged' | 'closed';
  commits: string[]; // commit IDs
  createdAt: Date;
  updatedAt: Date;
  author: string;
}

export interface DiffResult {
  resourceType: string;
  resourceId: string;
  changes: {
    field: string;
    before: string;
    after: string;
    type: 'addition' | 'deletion' | 'modification';
  }[];
}

// LLM Writing Assistant Context
export interface WritingContext {
  currentScene?: string;
  currentChapter?: string;
  activeCharacters: string[]; // Character IDs in current scene
  previousScenes: string[]; // Recent scene IDs for context
  storyNotes: string[]; // Relevant note IDs
  tone?: string;
  pov?: string;
  timestamp?: string; // In-story timeline
}

export interface LLMRequest {
  type: 'continue' | 'revise' | 'suggest' | 'analyze' | 'brainstorm';
  context: WritingContext;
  prompt?: string;
  targetLength?: number;
  constraints?: string[];
}

export interface LLMResponse {
  content: string;
  suggestions?: string[];
  analysisNotes?: string[];
  continuityIssues?: string[];
}
