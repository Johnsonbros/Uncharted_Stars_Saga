# Infinity's Reach - MCP Writing System

This project includes a Model Context Protocol (MCP) server that provides comprehensive story context to LLMs for AI-assisted writing.

## Features

### 🌿 Version Control (GitHub-style)
- **Branches**: Create alternative plotlines or experimental changes
- **Commits**: Track story evolution with detailed commit history
- **Pull Requests**: Merge changes between branches
- **Diff View**: See what changed between commits

### ✍️ Writing Assistant
- **Continue Writing**: Get AI to continue from where you left off
- **Revision Suggestions**: Get feedback on pacing, character voice, dialogue
- **Story Brainstorming**: Generate plot ideas and character development suggestions
- **Continuity Analysis**: Check for plot holes and inconsistencies

### 🤖 MCP Server
The MCP server provides story context to any LLM that supports the Model Context Protocol.

#### Available Tools:
1. **get_story_context** - Get complete story overview with all chapters, characters, locations
2. **get_scene_context** - Get detailed context for a specific scene including previous scenes
3. **get_character_details** - Retrieve comprehensive character profiles
4. **search_story_content** - Search across all story content
5. **get_commit_history** - View recent commits (GitHub-style history)
6. **create_branch** - Create new story branches
7. **commit_changes** - Commit story changes
8. **get_writing_suggestions** - Get AI-powered writing help
9. **analyze_continuity** - Check for plot holes and inconsistencies

#### Available Resources:
- `story://infinity-reach/full` - Complete story data
- `story://infinity-reach/chapter/{id}` - Individual chapters
- `story://infinity-reach/character/{id}` - Character profiles
- `story://infinity-reach/version-control` - Version control state

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the App
```bash
npm run dev
```

The app will be available at http://localhost:3000

### 3. Run the MCP Server (Optional)
To enable LLM integration:

```bash
npm run mcp
```

Or run both simultaneously:
```bash
npm run dev:with-mcp
```

### 4. Connect Your LLM Client

#### For Claude Desktop:
1. Locate your Claude Desktop config file:
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`

2. Add the MCP server configuration:
```json
{
  "mcpServers": {
    "infinity-reach-writer": {
      "command": "node",
      "args": [
        "/path/to/Uncharted_Stars_Saga/infinity-reach-app/bin/mcp-server.ts"
      ]
    }
  }
}
```

3. Restart Claude Desktop

#### For Other LLM Clients:
Configure your client to connect to the MCP server using the provided mcp-config.json file.

## Usage Examples

### Writing with AI Assistance

1. Navigate to **Writing Assistant** in the sidebar
2. Select the chapter/scene you're working on
3. Choose what you need:
   - **Continue Writing**: AI continues from your last paragraph
   - **Revise**: Get suggestions for improvement
   - **Suggest**: Brainstorm plot and character ideas
   - **Analyze**: Check continuity and consistency

### Version Control Workflow

1. Navigate to **Version Control** in the sidebar
2. Create a new branch for experimental changes:
   ```
   Branch name: alternative-ending
   Description: Exploring what happens if Elara discovers the truth earlier
   ```
3. Make your changes in that branch
4. Switch between branches to compare versions
5. Merge successful experiments back to main

### Using MCP Tools with Claude

Once connected, you can ask Claude questions like:

```
"Can you help me continue the scene where McCarran confronts Maria Santos in Processing Area Seven? Use the get_scene_context tool to understand what happened before."

"Check for any continuity issues in Chapter 2 using the analyze_continuity tool."

"Search the story for all mentions of 'shimmer drugs' and help me ensure the description is consistent."

"Get Elara's complete character profile and suggest how she might react to discovering Alice has developed new abilities."
```

## Architecture

### Data Flow
```
Story Data (sampleData.ts)
    ↓
DataStore (dataStore.ts)
    ↓
MCP Server (mcpServer.ts) ← LLM Client (Claude, etc.)
    ↓
Version Control (versionControl.ts)
    ↓
UI Components (React/Next.js)
```

### Key Files
- `src/data/sampleData.ts` - Story content and data
- `src/lib/dataStore.ts` - Data management
- `src/lib/mcpServer.ts` - MCP server implementation
- `src/lib/versionControl.ts` - Git-style version control
- `src/lib/agent.ts` - Story agent for Q&A
- `src/types/versionControl.ts` - Version control types
- `bin/mcp-server.ts` - Server startup script

## Development

### Project Structure
```
infinity-reach-app/
├── src/
│   ├── app/                    # Next.js pages
│   │   ├── version-control/   # Version control UI
│   │   ├── writing-assistant/ # Writing assistant UI
│   │   └── ...               # Other pages
│   ├── components/            # React components
│   ├── data/                 # Story data
│   ├── lib/                  # Core logic
│   │   ├── mcpServer.ts      # MCP server
│   │   ├── versionControl.ts # Version control
│   │   ├── dataStore.ts      # Data management
│   │   └── agent.ts          # Story agent
│   └── types/                # TypeScript types
├── bin/                      # Scripts
│   └── mcp-server.ts        # MCP server entry point
└── mcp-config.json          # MCP configuration
```

### Adding Story Content

To add your manuscript content:

1. Update `src/data/sampleData.ts` with your chapters, scenes, and characters
2. The MCP server will automatically provide this context to LLMs
3. Version control will track all changes

### Extending MCP Tools

To add new MCP tools:

1. Add the tool definition in `mcpServer.ts` `setupToolHandlers()`
2. Implement the handler method
3. Update this README with the new tool documentation

## Technologies

- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **@modelcontextprotocol/sdk** - MCP protocol implementation
- **Zod** - Schema validation

## Troubleshooting

### MCP Server Won't Start
- Ensure all dependencies are installed: `npm install`
- Check that TypeScript compiles: `npm run build`
- Verify Node.js version is 20.x or higher

### LLM Can't Connect
- Verify the MCP server is running: `npm run mcp`
- Check the path in your LLM client config matches your installation
- Restart your LLM client after configuration changes

### Version Control Issues
- Version control state is stored in memory - restart resets history
- For production, implement persistence to save/load version control state

## Future Enhancements

- [ ] Persistent storage for version control
- [ ] Real-time collaboration features
- [ ] Export to standard formats (EPUB, PDF, etc.)
- [ ] Advanced diff visualization
- [ ] Conflict resolution for merges
- [ ] Integration with actual LLM APIs for in-app writing assistance
- [ ] Backup and sync to cloud storage

## License

Part of the Uncharted Stars Saga project.

## Author

Nate Johnson

---

Built with ❤️ for writers and storytellers
