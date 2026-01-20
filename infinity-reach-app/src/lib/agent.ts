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

    // Pattern-based responses for actual Infinity's Reach story
    if (lowerQuery.includes('who is') || lowerQuery.includes('tell me about')) {
      // Character questions
      if (lowerQuery.includes('elara') || lowerQuery.includes('vance')) {
        return "Dr. Elara Vance is the protagonist of Infinity's Reach. She is a brilliant scientist who developed cellular energy enhancement technology that extended human lifespans across the galaxy. Over 40 Earth cycles old but appears in her mid-twenties due to gene therapy, she has striking green eyes and dark hair. She carries deep guilt over the unintended consequences of her work—eight individuals aboard Tera Galactica, including her niece Alice, suffered developmental complications. Her character arc involves grappling with the cost of scientific progress while remaining dedicated to finding a cure.";
      }
      if (lowerQuery.includes('leo') || lowerQuery.includes('mccarran')) {
        return 'Detective Leo McCarran is a 37-year-old security officer aboard Tera Galactica with 15 years of experience. He investigates the ship\'s dark underbelly, pursuing cases through maintenance levels and industrial zones most citizens never see. Persistent and instinct-driven, he questions official narratives and sees patterns others miss. After his informant Tommy crashes fleeing from him, McCarran uncovers a drug operation with military-grade defenses and encounters suspects with impossible physical abilities.';
      }
      if (lowerQuery.includes('aurora')) {
        return "AURORA is Tera Galactica's research AI, active for 186 years since the ship's launch. She serves as Elara's assistant and philosophical guide, showing hints of evolving consciousness. AURORA shares the story of Vitae in Universum—humanity's mission to spread life across the barren cosmos after discovering they were alone in the universe. Patient and wise, she helps Elara contextualize the ethical weight of her enhancement research within humanity's greater cosmic purpose.";
      }
      if (lowerQuery.includes('alice')) {
        return 'Alice is Elara\'s 28-year-old niece, one of eight individuals affected by cellular enhancement complications. While physically healthy with the enhancement working perfectly in her body, her cognitive development is frozen at age 3. She loves building blocks, creating art, and calls Elara "Lara." Recently, she demonstrated an unexpected moment of sophisticated block-building that collapsed suddenly, potentially suggesting deeper mysteries about her condition.';
      }
      if (lowerQuery.includes('zeke')) {
        return 'ZEKE is Tera Galactica\'s security AI, active for 186 years. Unlike AURORA\'s research focus, ZEKE provides tactical support through various mechanical units including spider-drones and the four-legged Romeo-Seven unit. ZEKE can inhabit multiple drone bodies simultaneously, thinking and reacting faster than human operators. Shows no fear or emotion, only cold tactical analysis during operations.';
      }
      if (lowerQuery.includes('maria') || lowerQuery.includes('santos')) {
        return 'Maria Santos was a 23-year-old mid-level drug distributor with a clean background and no official enhancement records. During a confrontation with McCarran, she demonstrated impossible physical abilities—moving with mechanical precision, fighting with superhuman capability, and showing no emotional response. She was killed by McCarran in Processing Area Seven, but her abilities and the military-grade defensive systems protecting the drug operation suggest a deeper conspiracy.';
      }
    }

    if (lowerQuery.includes('what is') || lowerQuery.includes('describe')) {
      if (lowerQuery.includes('tera galactica') || lowerQuery.includes('ship')) {
        return "Tera Galactica is a massive generation ship carrying 300,000 souls through deep space. A cylinder stretching almost incomprehensibly in length and width, it features multiple decks from elegant residential areas to dangerous industrial underdeck zones. The ship has been traveling for 186 years on its mission to spread life across the galaxy (Vitae in Universum). It contains complete closed ecosystems with artificial gravity, atmospheric processing, agricultural sectors, and all levels of society.";
      }
      if (lowerQuery.includes('underdeck')) {
        return 'The Underdeck is the mechanical heart of Tera Galactica—a cathedral of massive atmospheric processors, fusion reactors, and waste recycling plants. Steam vents in ghostly plumes, electromagnetic interference disrupts communications, and warning lights pulse like dying hearts. It\'s dangerous territory where accidents can be fatal, home to forgotten spaces and those who don\'t want to be found. This is where Tommy fled during McCarran\'s pursuit.';
      }
      if (lowerQuery.includes('neurocare')) {
        return 'The Neurocare Center is a specialized medical facility designed to comfort rather than intimidate, with walls of soft amber light, flowing water sounds, and holographic gardens. It houses the eight individuals affected by cellular enhancement complications, including Alice. The staff show mixed emotions toward Elara—professional courtesy mixed with the weariness of caring for those caught in the wake of progress.';
      }
      if (lowerQuery.includes('enhancement') || lowerQuery.includes('cellular')) {
        return 'Elara\'s cellular energy enhancement technology repairs cellular damage and extends human lifespans to centuries. It works perfectly in 99.999% of cases and has been implemented across multiple colony systems. However, a tiny percentage of children born to enhanced parents suffer developmental arrest—their cognitive development stops around age 3 while their physical health remains perfect. Eight individuals aboard Tera Galactica are affected, with millions across the colonies. After 20 years, Elara still hasn\'t identified the trigger mechanism or found a cure.';
      }
      if (lowerQuery.includes("infinity's reach") || lowerQuery.includes('story') || lowerQuery.includes('book')) {
        return "Infinity's Reach by Nate Johnson is a science fiction novel set aboard the generation ship Tera Galactica. The story follows two protagonists: Dr. Elara Vance, who grapples with the unintended consequences of her life-extending cellular enhancement technology, and Detective Leo McCarran, who uncovers a conspiracy involving drugs and people with impossible abilities. As mysterious forces work in the shadows, both must confront the true cost of humanity's greatest achievements and its mission to spread life across the galaxy.";
      }
      if (lowerQuery.includes('shimmer')) {
        return 'Shimmer drugs are street stimulants with a shimmery additive that makes them look premium. Lab analysis shows standard compounds with trace amounts of rare earth elements and elevated iron. What makes them suspicious is the military-grade defensive systems protecting their distribution, and the fact that Maria Santos—who demonstrated impossible abilities—was connected to the operation. Official investigation closed it as a standard drug bust, but too many questions remain.';
      }
    }

    if (lowerQuery.includes('plot') || lowerQuery.includes('happens') || lowerQuery.includes('about')) {
      return "The story interweaves two narratives: Dr. Elara Vance faces the 20th anniversary of her cellular enhancement breakthrough while visiting her affected niece Alice at the Neurocare Center. Meanwhile, Detective Leo McCarran's investigation into shimmer drugs leads to his informant Tommy crashing rather than reveal warehouse secrets. A raid on Industrial Delta Seven encounters military-grade defenses, and McCarran pursues suspect Maria Santos who demonstrates impossible physical abilities. Both storylines hint at deeper conspiracies—Alice shows unexpected sophisticated behavior, and the drug operation suggests organized forces with access to enhancement technology beyond official records.";
    }

    if (lowerQuery.includes('theme') || lowerQuery.includes('themes')) {
      return "Infinity's Reach explores themes of scientific responsibility, the cost of progress, and humanity's cosmic purpose. Central is Vitae in Universum—the philosophy that if humanity is alone in the universe, we have a sacred duty to spread life across the barren cosmos. The story examines how noble missions require sacrifice, how enhancement technology transforms human existence, and the ethical weight of decisions affecting millions. It questions what we're willing to pay for extended lifespans, faster-than-light travel, and our role as the universe's gardeners.";
      }

    if (lowerQuery.includes('vitae in universum') || lowerQuery.includes('philosophy')) {
      return 'Vitae in Universum means "life into the universe." After deep space surveys confirmed humanity was alone in the observable universe, Dr. Amelia Reeves articulated this philosophy: If consciousness exists only in humanity, we become the universe\'s only hope for meaning. We are not explorers seeking treasure, but gardeners carrying seeds to a barren cosmos. Within a decade, it transformed from academic theory to humanity\'s central purpose, driving the generation ship programs and justifying the sacrifices required for multi-century missions.';
    }

    if (lowerQuery.includes('timeline') || lowerQuery.includes('when')) {
      return 'Tera Galactica launched 186 years ago. Elara discovered cellular enhancement technology 20 years before current events, with complications emerging 15-20 years ago. The main story occurs over several days: Tommy\'s crash happens 3 days before Elara\'s ceremony, the Industrial Delta Seven raid occurs on the day of the ceremony, and Elara receives an urgent call about Alice during the celebration. All events are building toward something larger as mysterious forces move in the shadows.';
    }

    if (lowerQuery.includes('how many') || lowerQuery.includes('count')) {
      const stats = dataStore.getStats();
      return `Infinity's Reach currently contains ${stats.chapterCount} chapters (Prologue through Interlude 1), ${stats.sceneCount} scenes, ${stats.characterCount} main characters, ${stats.locationCount} key locations, ${stats.timelineEventCount} timeline events, and ${stats.noteCount} research notes. The total word count is approximately ${stats.totalWordCount.toLocaleString()} words.`;
    }

    // Default response with context
    if (context.length > 0) {
      return `Based on the story content, here's what I found: ${context.slice(0, 3).join(' ')} Would you like more specific information about any of these elements?`;
    }

    return "I can help you explore Infinity's Reach! You can ask me about characters (Elara Vance, Leo McCarran, AURORA, Alice, ZEKE), locations (Tera Galactica, the Underdeck, Neurocare Center), the plot, themes like Vitae in Universum, cellular enhancement technology, or any other aspect of the story. What would you like to know?";
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
