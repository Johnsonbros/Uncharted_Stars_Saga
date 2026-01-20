// MCP Server for Story Writing Assistant
// Provides context to LLMs for helping write Infinity's Reach

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { dataStore } from './dataStore';
import { versionControl } from './versionControl';
import { WritingContext, LLMRequest } from '@/types/versionControl';

class InfinityReachMCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'infinity-reach-writer',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      }
    );

    this.setupToolHandlers();
    this.setupResourceHandlers();
  }

  private setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'get_story_context',
          description: 'Get comprehensive context about the current state of Infinity\'s Reach including chapters, characters, and recent changes',
          inputSchema: {
            type: 'object',
            properties: {
              includeChapters: { type: 'boolean', description: 'Include chapter summaries' },
              includeCharacters: { type: 'boolean', description: 'Include character profiles' },
              includeLocations: { type: 'boolean', description: 'Include location descriptions' },
              includeNotes: { type: 'boolean', description: 'Include story notes' },
              branch: { type: 'string', description: 'Git branch to get context from (default: current)' },
            },
          },
        },
        {
          name: 'get_scene_context',
          description: 'Get detailed context for a specific scene including previous scenes, active characters, and relevant notes',
          inputSchema: {
            type: 'object',
            properties: {
              sceneId: { type: 'string', description: 'Scene ID to get context for' },
              includePreviousScenes: { type: 'number', description: 'Number of previous scenes to include (default: 2)' },
            },
            required: ['sceneId'],
          },
        },
        {
          name: 'get_character_details',
          description: 'Get comprehensive details about one or more characters',
          inputSchema: {
            type: 'object',
            properties: {
              characterIds: { type: 'array', items: { type: 'string' }, description: 'Character IDs to retrieve' },
              includeRelationships: { type: 'boolean', description: 'Include relationship information' },
            },
            required: ['characterIds'],
          },
        },
        {
          name: 'search_story_content',
          description: 'Search across all story content for specific terms or concepts',
          inputSchema: {
            type: 'object',
            properties: {
              query: { type: 'string', description: 'Search query' },
              searchIn: { 
                type: 'array', 
                items: { type: 'string', enum: ['chapters', 'scenes', 'characters', 'locations', 'notes'] },
                description: 'Which resources to search'
              },
            },
            required: ['query'],
          },
        },
        {
          name: 'get_commit_history',
          description: 'Get recent commits showing story evolution (GitHub-style history)',
          inputSchema: {
            type: 'object',
            properties: {
              branch: { type: 'string', description: 'Branch name (default: current)' },
              limit: { type: 'number', description: 'Number of commits to return (default: 10)' },
            },
          },
        },
        {
          name: 'create_branch',
          description: 'Create a new story branch for alternative plotlines or experimental changes',
          inputSchema: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'Branch name' },
              fromBranch: { type: 'string', description: 'Source branch (default: main)' },
              description: { type: 'string', description: 'Branch description' },
            },
            required: ['name'],
          },
        },
        {
          name: 'commit_changes',
          description: 'Commit story changes with a message (like git commit)',
          inputSchema: {
            type: 'object',
            properties: {
              message: { type: 'string', description: 'Commit message' },
              changes: { 
                type: 'array',
                description: 'Array of changes being committed',
                items: {
                  type: 'object',
                  properties: {
                    type: { type: 'string', enum: ['create', 'update', 'delete'] },
                    resourceType: { type: 'string', enum: ['chapter', 'scene', 'character', 'location', 'note'] },
                    resourceId: { type: 'string' },
                    before: { type: 'object' },
                    after: { type: 'object' },
                  },
                },
              },
            },
            required: ['message', 'changes'],
          },
        },
        {
          name: 'get_writing_suggestions',
          description: 'Get AI-powered suggestions for continuing, revising, or improving a scene',
          inputSchema: {
            type: 'object',
            properties: {
              type: { type: 'string', enum: ['continue', 'revise', 'suggest', 'analyze', 'brainstorm'] },
              context: {
                type: 'object',
                properties: {
                  currentScene: { type: 'string' },
                  currentChapter: { type: 'string' },
                  activeCharacters: { type: 'array', items: { type: 'string' } },
                  tone: { type: 'string' },
                  pov: { type: 'string' },
                },
              },
              prompt: { type: 'string', description: 'Specific prompt or question' },
              targetLength: { type: 'number', description: 'Target word count for generation' },
            },
            required: ['type', 'context'],
          },
        },
        {
          name: 'analyze_continuity',
          description: 'Check for continuity issues, plot holes, or character inconsistencies',
          inputSchema: {
            type: 'object',
            properties: {
              scope: { type: 'string', enum: ['chapter', 'full-story'], description: 'Analysis scope' },
              chapterId: { type: 'string', description: 'Chapter ID if scope is chapter' },
              focus: { 
                type: 'array',
                items: { type: 'string', enum: ['timeline', 'character-behavior', 'world-rules', 'plot-threads'] },
              },
            },
            required: ['scope'],
          },
        },
      ],
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case 'get_story_context':
          return this.getStoryContext(args);
        
        case 'get_scene_context':
          return this.getSceneContext(args);
        
        case 'get_character_details':
          return this.getCharacterDetails(args);
        
        case 'search_story_content':
          return this.searchStoryContent(args);
        
        case 'get_commit_history':
          return this.getCommitHistory(args);
        
        case 'create_branch':
          return this.createBranch(args);
        
        case 'commit_changes':
          return this.commitChanges(args);
        
        case 'get_writing_suggestions':
          return this.getWritingSuggestions(args);
        
        case 'analyze_continuity':
          return this.analyzeContinuity(args);
        
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });
  }

  private setupResourceHandlers() {
    // List available resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      const chapters = dataStore.getAllChapters();
      const characters = dataStore.getAllCharacters();
      
      return {
        resources: [
          {
            uri: 'story://infinity-reach/full',
            name: 'Complete Story',
            description: 'Full story content including all chapters, characters, and locations',
            mimeType: 'application/json',
          },
          ...chapters.map(chapter => ({
            uri: `story://infinity-reach/chapter/${chapter.id}`,
            name: chapter.title,
            description: chapter.synopsis,
            mimeType: 'application/json',
          })),
          ...characters.map(char => ({
            uri: `story://infinity-reach/character/${char.id}`,
            name: char.name,
            description: `${char.role}: ${char.personality.substring(0, 100)}...`,
            mimeType: 'application/json',
          })),
          {
            uri: 'story://infinity-reach/version-control',
            name: 'Version Control State',
            description: 'Current branches, commits, and pull requests',
            mimeType: 'application/json',
          },
        ],
      };
    });

    // Read specific resources
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;
      
      if (uri === 'story://infinity-reach/full') {
        return {
          contents: [{
            uri,
            mimeType: 'application/json',
            text: JSON.stringify({
              story: dataStore.getStory(),
              chapters: dataStore.getAllChapters(),
              characters: dataStore.getAllCharacters(),
              locations: dataStore.getAllLocations(),
              timeline: dataStore.getAllTimelineEvents(),
              notes: dataStore.getAllNotes(),
            }, null, 2),
          }],
        };
      }

      if (uri.startsWith('story://infinity-reach/chapter/')) {
        const chapterId = uri.split('/').pop();
        const chapter = dataStore.getChapter(chapterId!);
        if (!chapter) {
          throw new Error(`Chapter not found: ${chapterId}`);
        }
        
        return {
          contents: [{
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(chapter, null, 2),
          }],
        };
      }

      if (uri.startsWith('story://infinity-reach/character/')) {
        const charId = uri.split('/').pop();
        const character = dataStore.getCharacter(charId!);
        if (!character) {
          throw new Error(`Character not found: ${charId}`);
        }
        
        return {
          contents: [{
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(character, null, 2),
          }],
        };
      }

      if (uri === 'story://infinity-reach/version-control') {
        return {
          contents: [{
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(versionControl.export(), null, 2),
          }],
        };
      }

      throw new Error(`Unknown resource: ${uri}`);
    });
  }

  // Tool implementation methods
  private async getStoryContext(args: any) {
    const context: any = {
      story: dataStore.getStory(),
      stats: dataStore.getStats(),
    };

    if (args.includeChapters !== false) {
      context.chapters = dataStore.getAllChapters();
    }
    if (args.includeCharacters !== false) {
      context.characters = dataStore.getAllCharacters();
    }
    if (args.includeLocations !== false) {
      context.locations = dataStore.getAllLocations();
    }
    if (args.includeNotes !== false) {
      context.notes = dataStore.getAllNotes();
    }

    if (args.branch) {
      context.branch = args.branch;
      context.commitHistory = versionControl.getCommitHistory(args.branch, 5);
    }

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(context, null, 2),
      }],
    };
  }

  private async getSceneContext(args: any) {
    const scene = dataStore.getScene(args.sceneId);
    if (!scene) {
      throw new Error(`Scene not found: ${args.sceneId}`);
    }

    const chapter = dataStore.getChapter(scene.chapterId);
    const allScenes = chapter ? dataStore.getScenesByChapter(chapter.id) : [];
    
    const sceneIndex = allScenes.findIndex(s => s.id === args.sceneId);
    const previousSceneCount = args.includePreviousScenes || 2;
    const previousScenes = sceneIndex > 0 
      ? allScenes.slice(Math.max(0, sceneIndex - previousSceneCount), sceneIndex)
      : [];

    // Get active characters if scene has POV
    const activeCharacters = scene.pov 
      ? [dataStore.getCharacter(scene.pov)]
      : [];

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          currentScene: scene,
          chapter,
          previousScenes,
          activeCharacters,
          scenePosition: `${sceneIndex + 1} of ${allScenes.length}`,
        }, null, 2),
      }],
    };
  }

  private async getCharacterDetails(args: any) {
    const characters = args.characterIds.map((id: string) => 
      dataStore.getCharacter(id)
    ).filter(Boolean);

    if (args.includeRelationships) {
      // Relationships are already included in character data
    }

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({ characters }, null, 2),
      }],
    };
  }

  private async searchStoryContent(args: any) {
    const searchIn = args.searchIn || ['chapters', 'scenes', 'characters', 'locations', 'notes'];
    const results = dataStore.searchContent(args.query);

    const filteredResults: any = {};
    if (searchIn.includes('chapters')) filteredResults.chapters = results.chapters;
    if (searchIn.includes('scenes')) filteredResults.scenes = results.scenes;
    if (searchIn.includes('characters')) filteredResults.characters = results.characters;
    if (searchIn.includes('locations')) filteredResults.locations = results.locations;
    if (searchIn.includes('notes')) filteredResults.notes = results.notes;

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(filteredResults, null, 2),
      }],
    };
  }

  private async getCommitHistory(args: any) {
    const history = versionControl.getCommitHistory(args.branch, args.limit || 10);

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({ commits: history }, null, 2),
      }],
    };
  }

  private async createBranch(args: any) {
    const branch = versionControl.createBranch(
      args.name,
      args.fromBranch || 'main',
      args.description
    );

    return {
      content: [{
        type: 'text',
        text: `Created branch '${branch.name}' from '${branch.createdFrom}'`,
      }],
    };
  }

  private async commitChanges(args: any) {
    const commit = versionControl.commit(args.message, args.changes);

    return {
      content: [{
        type: 'text',
        text: `Committed: ${commit.message} (${commit.id})`,
      }],
    };
  }

  private async getWritingSuggestions(args: any) {
    // This would integrate with an actual LLM API
    // For now, return a structured placeholder
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          type: args.type,
          context: args.context,
          suggestions: [
            'This is where LLM-generated suggestions would appear',
            'Based on the current scene context and story state',
          ],
          note: 'Connect this to OpenAI, Anthropic, or other LLM API',
        }, null, 2),
      }],
    };
  }

  private async analyzeContinuity(args: any) {
    // Basic continuity checking
    const issues: string[] = [];

    if (args.scope === 'full-story') {
      const timeline = dataStore.getAllTimelineEvents();
      const chapters = dataStore.getAllChapters();
      
      // Check timeline consistency
      const sortedEvents = [...timeline].sort((a, b) => 
        a.order - b.order
      );

      issues.push(`Timeline has ${sortedEvents.length} events spanning the story`);
      issues.push(`Story contains ${chapters.length} chapters`);
    }

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          scope: args.scope,
          issues,
          note: 'Continuity checking would be more sophisticated with full implementation',
        }, null, 2),
      }],
    };
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Infinity Reach MCP Server running on stdio');
  }
}

// Export for use
export const mcpServer = new InfinityReachMCPServer();

// Start server if run directly
if (require.main === module) {
  mcpServer.start().catch(console.error);
}
