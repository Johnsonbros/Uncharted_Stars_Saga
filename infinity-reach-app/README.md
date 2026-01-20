# Infinity's Reach - Story Management System

An agent SDK-based UI system for organizing, tracking, and interacting with the audiobook/novel "Infinity's Reach". This application is a structural clone of NovelCrafter.com, built with modern web technologies.

## 🌟 Features

### Core Functionality

- **Dashboard** - Overview of your story with key statistics and quick access to recent content
- **Chapter Management** - Organize chapters with scenes, word counts, and metadata
- **Character Profiles** - Detailed character management with relationships, backgrounds, and character arcs
- **Location Database** - Track settings, places, and their significance in your story
- **Timeline** - Chronological view of story events with related characters and locations
- **Notes System** - Categorized notes for research, plot, world-building, and general information
- **AI Agent Integration** - Ask questions about your story content and get intelligent responses

### Key Features

- 📊 **Dashboard View** - Get a quick overview of your entire project
- 📖 **Chapter & Scene Organization** - Hierarchical structure for your content
- 👥 **Character Management** - Track protagonists, antagonists, supporting, and minor characters
- 🌍 **Location Tracking** - Document all the places in your story
- ⏱️ **Timeline Management** - Keep track of when events happen
- 📝 **Smart Notes** - Organize research and plot notes with tags and categories
- 🤖 **Story Agent** - AI-powered question answering about your story

## 🚀 Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm 10.x or higher

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Johnsonbros/Uncharted_Stars_Saga.git
cd Uncharted_Stars_Saga/infinity-reach-app
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
infinity-reach-app/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── agent/             # AI Agent page
│   │   ├── chapters/          # Chapters page
│   │   ├── characters/        # Characters page
│   │   ├── locations/         # Locations page
│   │   ├── notes/             # Notes page
│   │   ├── timeline/          # Timeline page
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Dashboard page
│   ├── components/            # React components
│   │   ├── layout/           # Layout components (Sidebar, MainLayout)
│   │   └── ui/               # Reusable UI components
│   ├── data/                 # Sample data
│   │   └── sampleData.ts     # Infinity's Reach story data
│   ├── lib/                  # Utility libraries
│   │   ├── agent.ts          # Story agent/AI integration
│   │   └── dataStore.ts      # Data management
│   └── types/                # TypeScript type definitions
│       └── index.ts          # Type definitions for the app
├── public/                   # Static assets
├── package.json             # Dependencies and scripts
└── README.md               # This file
```

## 🎨 Technology Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (React 19)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Deployment**: Optimized for [Vercel](https://vercel.com/)

## 📖 Story Content: Infinity's Reach

The application comes pre-loaded with sample content from "Infinity's Reach", an epic space opera exploring the boundaries of human potential and the mysteries of the cosmos.

### Story Overview

- **Genre**: Science Fiction
- **Setting**: 2347, Deep Space
- **Protagonist**: Commander Elena Voss
- **Premise**: The crew of the research vessel Prometheus journeys to the edge of known space, where they encounter an ancient alien artifact that challenges humanity's understanding of existence

### Included Content

- 3 Chapters with detailed scenes
- 4 Main characters with full profiles
- 4 Key locations
- Timeline of story events
- Research and plot notes

## 🤖 Agent SDK Integration

The Story Agent provides intelligent responses to questions about your story:

### Example Questions

- "Who is Commander Elena Voss?"
- "What is the Prometheus?"
- "Tell me about the plot"
- "What happens in Chapter 1?"
- "Describe the Helix Nebula"
- "Who is ARIA?"
- "What are the main themes?"
- "When does the story take place?"

The agent uses pattern matching and context-aware responses. In a production environment, this could be integrated with advanced AI APIs like OpenAI, Anthropic, or other LLM providers.

## 🎯 Usage

### Dashboard

View an overview of your story with:
- Total word count and statistics
- Recent chapters
- Main characters
- Quick action buttons

### Chapter Management

- View all chapters in order
- See word counts and scene breakdowns
- Track chapter progress and metadata

### Character Profiles

- Create detailed character profiles
- Track relationships between characters
- Organize by role (protagonist, antagonist, supporting, minor)

### Locations

- Document important places in your story
- Track location significance and descriptions

### Timeline

- View chronological events
- Link events to characters, locations, and chapters

### Notes

- Create categorized notes (research, plot, worldbuilding, general)
- Tag notes for easy searching
- Link notes to related story elements

### Story Agent

- Ask natural language questions
- Get intelligent responses based on story content
- View conversation history

## 🔧 Customization

### Adding Your Own Story

To replace the sample data with your own story:

1. Edit `src/data/sampleData.ts`
2. Update the story, chapters, characters, locations, timeline, and notes
3. Follow the TypeScript interfaces defined in `src/types/index.ts`

### Extending the Agent

To integrate with a real AI API:

1. Edit `src/lib/agent.ts`
2. Replace the `generateResponse` method with API calls to your chosen LLM provider
3. Add API keys via environment variables

Example:
```typescript
// .env.local
OPENAI_API_KEY=your_api_key_here
```

## 📝 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 🤝 Contributing

This is a personal project for managing the "Infinity's Reach" novel, but suggestions and improvements are welcome!

## 📄 License

This project is part of the Uncharted Stars Saga repository.

## 🙏 Acknowledgments

- Inspired by [NovelCrafter.com](https://novelcrafter.com)
- Built with Next.js and React
- Styled with Tailwind CSS

## 📞 Support

For questions or issues, please open an issue in the GitHub repository.

---

Built with ❤️ for writers and storytellers
