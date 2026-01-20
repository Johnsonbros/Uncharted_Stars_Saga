# Infinity's Reach - Complete Writing System

## Overview

This is a comprehensive story management and writing system for "Uncharted Stars Saga: Infinity's Reach" by Nate Johnson. It combines a modern web interface with AI-powered writing assistance through the Model Context Protocol (MCP).

## 🎯 What You Have

### 1. Story Management Interface (NovelCrafter-style)
A complete web application for organizing your novel:

- **Dashboard** - Overview with statistics and quick access
- **Chapters** - Manage all chapters and scenes
- **Characters** - Detailed character profiles and relationships
- **Locations** - Track settings and places
- **Timeline** - Chronological event tracking
- **Notes** - Organized research and plot notes
- **Ask Agent** - AI-powered Q&A about your story

### 2. Version Control System (GitHub-style)
Professional version control for creative writing:

- **Branches** - Create alternative plotlines or experimental changes
- **Commits** - Track every change with detailed history
- **Pull Requests** - Review and merge changes between branches
- **Diff Viewing** - See exactly what changed between versions
- **Branch Switching** - Move between different story versions

### 3. Writing Assistant (AI-Powered)
Get help from AI while writing:

- **Continue Writing** - AI continues from where you left off
- **Revise** - Get suggestions for pacing, dialogue, character voice
- **Suggest** - Brainstorm plot and character development ideas
- **Analyze** - Check for continuity issues and plot holes
- **Custom Prompts** - Ask specific questions about your story

### 4. MCP Server (LLM Integration)
Background server that provides story context to AI:

- Connects to Claude Desktop, ChatGPT, or other MCP clients
- Provides complete story context automatically
- 9 specialized tools for different writing tasks
- Real-time access to all story data
- Search and analysis capabilities

## 🚀 Quick Start

### Installation
```bash
cd infinity-reach-app
npm install
```

### Running the App
```bash
# Just the web interface
npm run dev

# Web interface + MCP server
npm run dev:with-mcp
```

### Access the App
Open http://localhost:3000 in your browser

## 📝 How to Use It

### For Writing Your Novel

1. **Add Your Content**
   - Navigate to `src/data/sampleData.ts`
   - Replace sample data with your actual manuscript
   - Include chapters, scenes, characters, locations

2. **Organize Your Story**
   - Use the Chapters page to structure your content
   - Add character profiles in the Characters section
   - Document locations and world-building
   - Create notes for research and plot threads

3. **Track Your Progress**
   - Dashboard shows word counts and statistics
   - Timeline tracks story events chronologically
   - Notes keep research organized

### For Version Control

1. **Create a Branch**
   - Go to Version Control page
   - Click "New Branch"
   - Name it (e.g., "alternative-ending", "chapter-revision")
   - Write in that branch

2. **Make Changes**
   - Edit your story content
   - Changes happen in the current branch

3. **Commit Your Changes**
   - Use the commit function to save snapshots
   - Write descriptive commit messages
   - View history to see evolution

4. **Merge Branches**
   - Create a pull request
   - Review changes
   - Merge successful experiments into main

### For AI Writing Assistance

#### Option 1: In-App Assistant
1. Go to Writing Assistant page
2. Select chapter/scene you're working on
3. Choose what you need help with
4. Get AI suggestions (requires LLM API integration)

#### Option 2: MCP with External LLM

1. **Start the MCP Server**
   ```bash
   npm run mcp
   ```

2. **Configure Your LLM Client**
   
   For Claude Desktop:
   - Find config file:
     - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
     - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
   
   - Add this configuration:
   ```json
   {
     "mcpServers": {
       "infinity-reach-writer": {
         "command": "node",
         "args": [
           "/full/path/to/Uncharted_Stars_Saga/infinity-reach-app/bin/mcp-server.ts"
         ]
       }
     }
   }
   ```
   
   - Restart Claude Desktop

3. **Use AI with Full Story Context**
   
   Ask Claude questions like:
   ```
   "Help me continue the scene where McCarran confronts Maria Santos. 
   Use get_scene_context to understand what happened before."
   
   "Check Chapter 2 for continuity issues using analyze_continuity."
   
   "Search for all mentions of shimmer drugs and help ensure consistency."
   
   "Get Elara's character profile and suggest how she'd react to Alice 
   developing new abilities."
   ```

## 🛠 MCP Tools Available

When connected via MCP, these tools are available to your LLM:

1. **get_story_context** - Full story overview with chapters, characters, locations
2. **get_scene_context** - Detailed scene info including previous scenes
3. **get_character_details** - Complete character profiles
4. **search_story_content** - Search across all content
5. **get_commit_history** - View version control history
6. **create_branch** - Create new story branches
7. **commit_changes** - Save story changes
8. **get_writing_suggestions** - AI writing help
9. **analyze_continuity** - Check for plot holes

## 📁 Project Structure

```
infinity-reach-app/
├── src/
│   ├── app/                     # Pages
│   │   ├── page.tsx            # Dashboard
│   │   ├── chapters/           # Chapters page
│   │   ├── characters/         # Characters page
│   │   ├── version-control/    # Version control UI
│   │   └── writing-assistant/  # Writing assistant UI
│   ├── components/             # React components
│   ├── data/
│   │   └── sampleData.ts       # Your story data (edit this!)
│   ├── lib/
│   │   ├── mcpServer.ts        # MCP server
│   │   ├── versionControl.ts   # Version control logic
│   │   ├── dataStore.ts        # Data management
│   │   └── agent.ts            # Story Q&A agent
│   └── types/                  # TypeScript types
├── bin/
│   └── mcp-server.ts           # MCP server entry point
├── mcp-config.json             # MCP configuration
├── MCP-README.md               # Detailed MCP documentation
└── README.md                   # General app documentation
```

## 🎨 Features Summary

### ✅ Story Management
- Complete chapter and scene organization
- Character profiles with relationships
- Location tracking
- Timeline management
- Research notes with tags and categories
- Statistics dashboard

### ✅ Version Control
- GitHub-style branching and merging
- Commit history with diffs
- Pull request workflow
- Branch comparison
- Safe experimentation

### ✅ AI Integration
- MCP server for LLM connectivity
- Full story context delivery
- 9 specialized writing tools
- Search and analysis
- Real-time synchronization

### ✅ Writing Tools
- Continue writing assistance
- Revision suggestions
- Plot brainstorming
- Continuity checking
- Custom prompt support

## 🔧 Customization

### Adding Your Story Content

Edit `src/data/sampleData.ts`:

```typescript
export const infinityReachStory: Story = {
  id: 'story-1',
  title: "Your Title",
  author: 'Nate Johnson',
  genre: 'Science Fiction',
  synopsis: 'Your synopsis...',
  // ... more fields
};

export const sampleChapters: Chapter[] = [
  {
    id: 'chapter-1',
    title: 'Your Chapter Title',
    synopsis: 'Your chapter synopsis...',
    // ... more fields
  },
  // ... more chapters
];

// Add scenes, characters, locations, etc.
```

### Integrating Real LLM APIs

To add actual AI functionality to the in-app Writing Assistant:

1. Choose an LLM provider (OpenAI, Anthropic, etc.)
2. Add API key to `.env.local`:
   ```
   OPENAI_API_KEY=your_key_here
   ```
3. Update `src/app/writing-assistant/page.tsx` to call the API
4. Use the MCP context in your prompts

## 📚 Documentation

- `README.md` - General application documentation
- `MCP-README.md` - Detailed MCP server documentation
- In-app help - Tooltips and guidance throughout the UI

## 🎯 Recommended Workflow

1. **Initial Setup**
   - Add your existing manuscript to `sampleData.ts`
   - Populate character profiles
   - Document locations and world-building

2. **Daily Writing**
   - Start MCP server: `npm run dev:with-mcp`
   - Write in your favorite editor or use the web interface
   - Ask AI for help via Claude Desktop

3. **Experimentation**
   - Create a branch for alternative versions
   - Try different approaches without losing original
   - Merge successful changes back

4. **Organization**
   - Use Notes for research and plot threads
   - Timeline tracks story chronology
   - Characters page maintains consistency

5. **Review & Edit**
   - Use version control to see what changed
   - Ask AI for continuity checks
   - Compare branches to choose best version

## 🚀 Future Enhancements

Potential improvements:
- [ ] Database backend for persistence
- [ ] Real-time collaboration
- [ ] Export to EPUB/PDF
- [ ] Advanced diff visualization
- [ ] Cloud backup and sync
- [ ] Mobile app
- [ ] Automated backups

## 💡 Tips for Success

1. **Commit Often** - Save snapshots of your work regularly
2. **Use Branches** - Experiment without fear
3. **Ask the AI** - Get continuity checks and suggestions
4. **Stay Organized** - Keep notes and research documented
5. **Track Progress** - Use Dashboard to monitor word counts

## 🆘 Support

For issues or questions:
1. Check the documentation in `/MCP-README.md`
2. Review the inline comments in the code
3. Open an issue on GitHub

## 📄 License

Part of the Uncharted Stars Saga project by Nate Johnson.

---

**Built for writers, by writers. Happy writing! ✍️**
