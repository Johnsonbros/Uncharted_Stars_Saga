// Data store utilities for managing story data

import { Story, Chapter, Scene, Character, Location, TimelineEvent, Note } from '@/types';
import {
  infinityReachStory,
  sampleChapters,
  sampleScenes,
  sampleCharacters,
  sampleLocations,
  sampleTimeline,
  sampleNotes,
} from '@/data/sampleData';

// In-memory data store (in a real app, this would be connected to a database)
class DataStore {
  private story: Story;
  private chapters: Chapter[];
  private scenes: Scene[];
  private characters: Character[];
  private locations: Location[];
  private timeline: TimelineEvent[];
  private notes: Note[];

  constructor() {
    this.story = infinityReachStory;
    this.chapters = sampleChapters;
    this.scenes = sampleScenes;
    this.characters = sampleCharacters;
    this.locations = sampleLocations;
    this.timeline = sampleTimeline;
    this.notes = sampleNotes;
  }

  // Story methods
  getStory(): Story {
    return this.story;
  }

  // Chapter methods
  getAllChapters(): Chapter[] {
    return this.chapters.sort((a, b) => a.order - b.order);
  }

  getChapter(id: string): Chapter | undefined {
    return this.chapters.find(c => c.id === id);
  }

  // Scene methods
  getAllScenes(): Scene[] {
    return this.scenes;
  }

  getScenesByChapter(chapterId: string): Scene[] {
    return this.scenes
      .filter(s => s.chapterId === chapterId)
      .sort((a, b) => a.order - b.order);
  }

  getScene(id: string): Scene | undefined {
    return this.scenes.find(s => s.id === id);
  }

  // Character methods
  getAllCharacters(): Character[] {
    return this.characters.sort((a, b) => {
      const roleOrder = { protagonist: 0, antagonist: 1, supporting: 2, minor: 3 };
      return roleOrder[a.role] - roleOrder[b.role];
    });
  }

  getCharacter(id: string): Character | undefined {
    return this.characters.find(c => c.id === id);
  }

  // Location methods
  getAllLocations(): Location[] {
    return this.locations;
  }

  getLocation(id: string): Location | undefined {
    return this.locations.find(l => l.id === id);
  }

  // Timeline methods
  getAllTimelineEvents(): TimelineEvent[] {
    return this.timeline.sort((a, b) => a.order - b.order);
  }

  getTimelineEvent(id: string): TimelineEvent | undefined {
    return this.timeline.find(t => t.id === id);
  }

  // Note methods
  getAllNotes(): Note[] {
    return this.notes.sort((a, b) => 
      b.updatedAt.getTime() - a.updatedAt.getTime()
    );
  }

  getNotesByCategory(category: Note['category']): Note[] {
    return this.notes.filter(n => n.category === category);
  }

  getNote(id: string): Note | undefined {
    return this.notes.find(n => n.id === id);
  }

  // Search methods
  searchContent(query: string): {
    chapters: Chapter[];
    scenes: Scene[];
    characters: Character[];
    locations: Location[];
    notes: Note[];
  } {
    const lowerQuery = query.toLowerCase();

    return {
      chapters: this.chapters.filter(c => 
        c.title.toLowerCase().includes(lowerQuery) ||
        c.synopsis.toLowerCase().includes(lowerQuery)
      ),
      scenes: this.scenes.filter(s => 
        s.title.toLowerCase().includes(lowerQuery) ||
        s.content.toLowerCase().includes(lowerQuery)
      ),
      characters: this.characters.filter(c => 
        c.name.toLowerCase().includes(lowerQuery) ||
        c.background.toLowerCase().includes(lowerQuery)
      ),
      locations: this.locations.filter(l => 
        l.name.toLowerCase().includes(lowerQuery) ||
        l.description.toLowerCase().includes(lowerQuery)
      ),
      notes: this.notes.filter(n => 
        n.title.toLowerCase().includes(lowerQuery) ||
        n.content.toLowerCase().includes(lowerQuery)
      ),
    };
  }

  // Stats methods
  getStats() {
    return {
      totalWordCount: this.story.wordCount,
      chapterCount: this.chapters.length,
      sceneCount: this.scenes.length,
      characterCount: this.characters.length,
      locationCount: this.locations.length,
      timelineEventCount: this.timeline.length,
      noteCount: this.notes.length,
    };
  }
}

// Export singleton instance
export const dataStore = new DataStore();
