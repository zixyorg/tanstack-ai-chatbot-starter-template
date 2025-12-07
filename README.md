# TanStack AI Chatbot Starter Template

A production-ready, full-stack chatbot application built with TanStack AI, featuring real-time streaming responses, model selection, and a modern UI. This template provides everything you need to build AI-powered chat applications with TypeScript, React, and TanStack Start.

## Features

- **TanStack AI Integration** - Seamless AI chat with streaming responses
- **Multi-Provider Support** - OpenAI, Anthropic (Claude), and Google Gemini
- **Modern UI** - Beautiful, responsive interface with model selection
- **Real-time Streaming** - Server-Sent Events (SSE) for live responses
- **Model Selection** - Switch between different AI models on the fly
- **Monorepo Architecture** - Clean separation of concerns with workspaces
- **Type Safety** - End-to-end TypeScript with tRPC
- **TanStack Start** - SSR framework with TanStack Router
- **TailwindCSS** - Utility-first CSS for rapid UI development
- **shadcn/ui** - Reusable, accessible UI components
- **Drizzle ORM** - TypeScript-first database queries
- **PostgreSQL** - Robust database engine

## Getting Started

First, install the dependencies:

```bash
bun install
```
## Environment Variables

This project supports multiple AI providers. You need at least one API key configured, depending on which models you want to use.

1. Create a `.env` file in the root directory or `apps/web/.env`
2. Add the API keys for the providers you want to use:

```bash
# OpenAI (required for GPT-4-1, GPT-4-1 Mini, o3-mini)
OPENAI_API_KEY=sk-your-openai-api-key-here

# Anthropic (required for Claude 3.5 Sonnet)
ANTHROPIC_API_KEY=sk-ant-your-anthropic-api-key-here

# Google Gemini (required for Gemini 2.5 Flash)
GEMINI_API_KEY=your-gemini-api-key-here
```

### Getting API Keys

- **OpenAI**: Get your API key from [OpenAI's platform](https://platform.openai.com/api-keys)
- **Anthropic**: Get your API key from [Anthropic Console](https://console.anthropic.com/)
- **Google Gemini**: Get your API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

**Note**: You only need to configure the API keys for the models you plan to use. The application will automatically use the correct provider based on the selected model.

## Database Setup

This project uses PostgreSQL with Drizzle ORM.

1. Make sure you have a PostgreSQL database set up.
2. Update your `apps/web/.env` file with your PostgreSQL connection details.

3. Apply the schema to your database:
```bash
bun run db:push
```


Then, run the development server:

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see your fullstack application.







## Architecture

This application follows a modern full-stack architecture with clear separation between frontend, API, and data layers:

### Request Flow

1. **Frontend (React)** - User interacts with the chat interface
   - `useChat` hook from `@tanstack/ai-react` manages chat state
   - Sends messages via Server-Sent Events (SSE) to `/api/chat`
   - Receives streaming responses and updates UI in real-time

2. **API Route** - TanStack Router handles the chat endpoint
   - `/api/chat` receives POST requests with messages and model selection
   - Validates request and maps UI model names to provider-specific model IDs
   - Selects the appropriate AI adapter based on the chosen model
   - Creates streaming chat response using TanStack AI

3. **AI Adapters** - Multi-provider support
   - **OpenAI**: `@tanstack/ai-openai` adapter for GPT-4 and o3 models
   - **Anthropic**: `@tanstack/ai-anthropic` adapter for Claude models
   - **Google Gemini**: `@tanstack/ai-gemini` adapter for Gemini models
   - Automatically reads API keys from environment variables
   - Streams responses back to the client

4. **State Management** - TanStack Query + tRPC
   - TanStack Query for server state caching
   - tRPC for type-safe API calls (extensible for future features)

### Supported Models

- **OpenAI**: GPT-4-1, GPT-4-1 Mini, o3-mini
- **Anthropic**: Claude 3.5 Sonnet
- **Google Gemini**: Gemini 2.5 Flash

### Key Technologies

- **Frontend**: React 19, TanStack Router, TanStack Query, TanStack AI React
- **Backend**: TanStack Start (SSR), TanStack AI, Multi-provider adapters
- **AI Providers**: OpenAI, Anthropic, Google Gemini
- **API**: tRPC for type-safe endpoints
- **Database**: Drizzle ORM with PostgreSQL
- **Styling**: TailwindCSS with shadcn/ui components
- **Animations**: Motion (Framer Motion)

## Project Structure

```
tanstack-ai-chatbot-starter-template/
├── apps/
│   └── web/                          # Fullstack application
│       ├── src/
│       │   ├── components/           # React components
│       │   │   ├── ui/               # shadcn/ui components
│       │   │   │   ├── animated-ai-input.tsx  # Main chat input component
│       │   │   │   ├── button.tsx
│       │   │   │   └── ...
│       │   │   ├── app-sidebar.tsx   # Sidebar navigation
│       │   │   └── header.tsx        # Header component
│       │   ├── routes/               # TanStack Router routes
│       │   │   ├── api/
│       │   │   │   ├── chat.ts        # Chat API endpoint (SSE)
│       │   │   │   └── trpc/
│       │   │   │       └── $.ts      # tRPC endpoint handler
│       │   │   ├── index.tsx         # Home page
│       │   │   └── __root.tsx        # Root layout
│       │   ├── lib/                  # Utility functions
│       │   ├── utils/               # Helper utilities
│       │   ├── router.tsx            # Router configuration
│       │   └── index.css             # Global styles
│       ├── public/                   # Static assets
│       ├── package.json
│       └── vite.config.ts            # Vite configuration
│
├── packages/
│   ├── api/                          # API layer / business logic
│   │   └── src/
│   │       ├── routers/             # tRPC routers
│   │       │   └── index.ts        # Main router definition
│   │       ├── context.ts           # tRPC context
│   │       └── index.ts             # tRPC setup
│   │
│   ├── db/                          # Database layer
│   │   └── src/
│   │       └── index.ts            # Drizzle database instance
│   │
│   └── config/                      # Shared configuration
│       └── tsconfig.base.json       # Base TypeScript config
│
├── package.json                     # Root package.json (workspace config)
├── bun.lock                         # Bun lockfile
└── README.md                        # This file
```

### Directory Breakdown

- **`apps/web`** - Main application containing both frontend and API routes
  - Uses TanStack Start for SSR and file-based routing
  - API routes are co-located with frontend code for better DX
  
- **`packages/api`** - Shared API logic using tRPC
  - Type-safe procedures that can be called from frontend
  - Currently includes health check, extensible for more endpoints
  
- **`packages/db`** - Database configuration and schema
  - Drizzle ORM setup with PostgreSQL
  - Database connection and query utilities

- **`packages/config`** - Shared TypeScript configuration
  - Base tsconfig used across all packages

## Available Scripts

- `bun run dev` - Start all applications in development mode
- `bun run dev:web` - Start only the web application
- `bun run build` - Build all applications for production
- `bun run check-types` - Check TypeScript types across all apps
- `bun run db:push` - Push schema changes to database
- `bun run db:studio` - Open Drizzle Studio (database UI)
- `bun run db:generate` - Generate database migrations
- `bun run db:migrate` - Run database migrations

## Credits

This project was built using:

- **[Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack)** - Created by [Aman Varshney](https://github.com/AmanVarshney01)
  - A modern TypeScript stack generator that bootstrapped this project

- **TanStack AI** - The core AI framework powering the chatbot functionality
  - [TanStack AI Documentation](https://tanstack.com/ai)

- **OpenAI** - AI model provider
  - [OpenAI Platform](https://platform.openai.com)

### Additional Technologies

- **TanStack** - Suite of high-quality open-source React components
- **shadcn/ui** - Beautifully designed components built with Radix UI
- **Drizzle ORM** - TypeScript ORM for SQL databases
- **Motion** - Production-ready motion library for React

### Build by

- [Karan Kendre](https://github.com/kendrekaran)
- [Kartik Labhshetwar](https://github.com/KartikLabhshetwar)
- [Pranav Patil](https://github.com/21prnv)

## License

See [LICENSE](LICENSE) file for details.
