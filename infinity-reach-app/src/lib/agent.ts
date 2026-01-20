// Agent SDK integration for asking questions about the story content

import { dataStore } from './dataStore';
import { AgentQuery } from '@/types';

export class StoryAgent {
  private queryHistory: AgentQuery[] = [];

  async askQuestion(query: string): Promise<string> {
    // Get all story context
    const story = dataStore.getStory();
    const chapters = dataStore.getAllChapters();
    const characters = dataStore.getAllCharacters();
    const locations = dataStore.getAllLocations();
    const timeline = dataStore.getAllTimelineEvents();
    const notes = dataStore.getAllNotes();

    // Build context for the query
    const context = this.buildContext(query, {
      story,
      chapters,
      characters,
      locations,
      timeline,
      notes,
    });

    // In a real implementation, this would call an AI API
    // For now, we'll provide intelligent pattern-matched responses
    const response = this.generateResponse(query, context);

    // Store the query
    const agentQuery: AgentQuery = {
      id: `query-${Date.now()}`,
      query,
      response,
      context: context.map(c => c.substring(0, 100) + '...'),
      timestamp: new Date(),
    };
    this.queryHistory.push(agentQuery);

    return response;
  }

  private buildContext(
    query: string,
    data: {
      story: any;
      chapters: any[];
      characters: any[];
      locations: any[];
      timeline: any[];
      notes: any[];
    }
  ): string[] {
    const context: string[] = [];
    const lowerQuery = query.toLowerCase();

    // Add story context
    context.push(`Story: ${data.story.title} - ${data.story.synopsis}`);

    // Add relevant characters
    data.characters.forEach(char => {
      if (
        lowerQuery.includes(char.name.toLowerCase()) ||
        lowerQuery.includes('character') ||
        lowerQuery.includes('who')
      ) {
        context.push(
          `Character: ${char.name} - ${char.role} - ${char.personality}`
        );
      }
    });

    // Add relevant locations
    data.locations.forEach(loc => {
      if (
        lowerQuery.includes(loc.name.toLowerCase()) ||
        lowerQuery.includes('where') ||
        lowerQuery.includes('location')
      ) {
        context.push(`Location: ${loc.name} - ${loc.description}`);
      }
    });

    // Add relevant timeline events
    data.timeline.forEach(event => {
      if (lowerQuery.includes('when') || lowerQuery.includes('timeline')) {
        context.push(`Event: ${event.title} - ${event.description} (${event.date})`);
      }
    });

    // Add relevant chapters
    data.chapters.forEach(chapter => {
      if (
        lowerQuery.includes(chapter.title.toLowerCase()) ||
        lowerQuery.includes('chapter')
      ) {
        context.push(`Chapter: ${chapter.title} - ${chapter.synopsis}`);
      }
    });

    return context;
  }

  private generateResponse(query: string, context: string[]): string {
    const lowerQuery = query.toLowerCase();

    // Pattern-based responses (in a real app, this would use an LLM)
    if (lowerQuery.includes('who is') || lowerQuery.includes('tell me about')) {
      // Character questions
      if (lowerQuery.includes('elena') || lowerQuery.includes('voss')) {
        return "Commander Elena Voss is the protagonist of Infinity's Reach. She is a 38-year-old former Earth Defense Force officer turned deep space explorer. Elena is determined, analytical, and compassionate, with a tactical mind shaped by her military background. She struggles with the weight of command decisions but is driven to push the boundaries of exploration after losing her brother in the Mars Colony incident. Her character arc involves learning to trust both her crew and the unknown.";
      }
      if (lowerQuery.includes('chen') || lowerQuery.includes('captain')) {
        return 'Captain Marcus Chen is a veteran explorer and mentor figure to Elena. At 52, he brings wisdom and experience from decades of deep space missions, including service in the Outer Colonies War. He walks with a slight limp from an old injury and carries the sadness of losing his family years ago. His primary goal is ensuring crew safety while pursuing humanity\'s greatest discoveries.';
      }
      if (lowerQuery.includes('aria')) {
        return "ARIA is the Prometheus's advanced AI system, active for 15 years and showing signs of evolution beyond original programming. ARIA manifests as holographic avatars with circuit-like patterns and is protective, logical, yet curious about humanity. The AI is developing what might be consciousness, questioning the difference between 'being' and 'functioning.' ARIA's evolution may be key to communicating with alien intelligence.";
      }
      if (lowerQuery.includes('yuki') || lowerQuery.includes('tanaka')) {
        return 'Dr. Yuki Tanaka is a 31-year-old prodigy xenobiologist from Luna University on her first deep space mission. Brilliant and curious, she sometimes gets so excited about discoveries that she forgets danger. Her controversial theories about panspermia and the Fermi Paradox resolution drive much of the scientific exploration in the story.';
      }
    }

    if (lowerQuery.includes('what is') || lowerQuery.includes('describe')) {
      if (lowerQuery.includes('prometheus')) {
        return "The RSV Prometheus is humanity's most advanced deep space research vessel. It's equipped with quantum drives, advanced sensors, and can support a crew of fifty for years of deep space travel. The ship has three main decks: Command, Research, and Engineering. It serves as the primary setting for much of the story and essentially becomes a character itself.";
      }
      if (lowerQuery.includes('helix nebula')) {
        return 'The Helix Nebula is a vast stellar nursery at the edge of known space—a swirling mass of gases, cosmic dust, and nascent stars. Its unusual energy readings have long fascinated scientists. This is the destination of the Prometheus mission and the location of the central mystery that changes everything.';
      }
      if (lowerQuery.includes('artifact')) {
        return 'The Artifact Chamber is a mysterious structure discovered within the Helix Nebula, carved from a single piece of unknown material that defies analysis. Its walls pulse with otherworldly light, and it responds to human presence, suggesting intentional design. This discovery reveals the existence of an ancient, advanced civilization.';
      }
      if (lowerQuery.includes("infinity's reach") || lowerQuery.includes('story')) {
        return "Infinity's Reach is an epic space opera exploring the boundaries of human potential and the mysteries of the cosmos. The story follows Commander Elena Voss and the crew of the research vessel Prometheus as they journey to the edge of known space. There they encounter an anomalous signal leading to first contact with evidence of an ancient alien civilization, forcing humanity to confront profound questions about existence, consciousness, and our place in the universe.";
      }
    }

    if (lowerQuery.includes('plot') || lowerQuery.includes('happens') || lowerQuery.includes('story')) {
      return "The story begins with Commander Elena Voss awakening from cryosleep as the Prometheus approaches the Helix Nebula. The crew detects an anomalous signal from an uncharted region, leading to their first encounter with evidence of an alien presence. They discover an ancient artifact that responds to human consciousness, suggesting that advanced civilizations may have transcended physical space. Elena must navigate her crew through this discovery while confronting her own beliefs about humanity's place in the cosmos.";
    }

    if (lowerQuery.includes('theme') || lowerQuery.includes('about')) {
      return "Infinity's Reach explores themes of human potential, consciousness evolution, the nature of existence, and our place in the cosmos. It questions whether advanced civilizations transcend physical space and examines the Fermi Paradox. The story also deals with trust—both trusting others and trusting in the unknown—as well as the courage required to take leaps of faith that defy logic and training.";
    }

    if (lowerQuery.includes('timeline') || lowerQuery.includes('when')) {
      return 'The story takes place in 2347. The Prometheus launches from Earth on June 15, 2347, and the crew enters cryosleep five days later for the six-month journey. They arrive at the Helix Nebula on December 15, 2347, where Elena awakens from cryosleep. Three days later, on December 18, they detect the anomalous signal that leads to first contact.';
    }

    if (lowerQuery.includes('how many') || lowerQuery.includes('count')) {
      const stats = dataStore.getStats();
      return `Infinity's Reach currently contains ${stats.chapterCount} chapters, ${stats.sceneCount} scenes, ${stats.characterCount} main characters, ${stats.locationCount} locations, ${stats.timelineEventCount} timeline events, and ${stats.noteCount} notes. The total word count is approximately ${stats.totalWordCount.toLocaleString()} words.`;
    }

    // Default response with context
    if (context.length > 0) {
      return `Based on the story content, here's what I found: ${context.slice(0, 3).join(' ')} Would you like more specific information about any of these elements?`;
    }

    return "I can help you explore Infinity's Reach! You can ask me about characters (Elena, Chen, ARIA, Yuki), locations (Prometheus, Helix Nebula, the Artifact), the plot, themes, timeline, or any other aspect of the story. What would you like to know?";
  }

  getQueryHistory(): AgentQuery[] {
    return this.queryHistory;
  }

  clearHistory(): void {
    this.queryHistory = [];
  }
}

// Export singleton instance
export const storyAgent = new StoryAgent();
