// Type definitions for Infinity's Reach Story Management System

export interface Story {
  id: string;
  title: string;
  author: string;
  genre: string;
  synopsis: string;
  createdAt: Date;
  updatedAt: Date;
  wordCount: number;
}

export interface Chapter {
  id: string;
  storyId: string;
  title: string;
  order: number;
  synopsis: string;
  wordCount: number;
  scenes: Scene[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Scene {
  id: string;
  chapterId: string;
  title: string;
  order: number;
  content: string;
  wordCount: number;
  pov?: string; // Point of view character
  location?: string;
  timestamp?: string; // In-story timestamp
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Character {
  id: string;
  storyId: string;
  name: string;
  role: 'protagonist' | 'antagonist' | 'supporting' | 'minor';
  age?: number;
  species?: string;
  appearance: string;
  personality: string;
  background: string;
  goals: string;
  relationships: CharacterRelationship[];
  notes: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CharacterRelationship {
  characterId: string;
  relatedCharacterId: string;
  relationshipType: string;
  description: string;
}

export interface Location {
  id: string;
  storyId: string;
  name: string;
  type: string; // planet, station, ship, etc.
  description: string;
  significance: string;
  notes: string;
  parentLocationId?: string; // For nested locations
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TimelineEvent {
  id: string;
  storyId: string;
  title: string;
  description: string;
  date: string;
  order: number;
  relatedChapters: string[];
  relatedCharacters: string[];
  relatedLocations: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Note {
  id: string;
  storyId: string;
  title: string;
  content: string;
  category: 'research' | 'plot' | 'worldbuilding' | 'general';
  tags: string[];
  relatedItems: {
    type: 'chapter' | 'character' | 'location' | 'timeline';
    id: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentQuery {
  id: string;
  query: string;
  response: string;
  context: string[];
  timestamp: Date;
}

export type NavigationSection = 
  | 'dashboard'
  | 'chapters'
  | 'characters'
  | 'locations'
  | 'timeline'
  | 'notes'
  | 'agent'
  | 'version-control'
  | 'writing-assistant';
