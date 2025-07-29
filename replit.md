# Crux - replit.md

## Overview

Crux is a modern React + Express web application that serves as an AI-powered contextual learning companion. It transforms any text content into comprehensive learning materials including summaries, personalized learning paths, interactive key terms, flashcards, quizzes, mind maps, and curated additional resources. The app features a clean, modern UI built with shadcn/ui components and provides export functionality for study materials.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Router**: Wouter for client-side routing
- **State Management**: TanStack Query for server state, React hooks for local state
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens
- **Build Tool**: Vite with HMR and development optimizations

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js with middleware for JSON parsing and logging
- **AI Integration**: OpenAI GPT-4o for content generation
- **File Handling**: Multer for file uploads
- **Data Storage**: In-memory storage with interface for future database integration

## Key Components

### Frontend Components
- **ContentInput**: Handles text input, file uploads, and drag-and-drop functionality
- **Summary**: Displays AI-generated summaries with clean typography
- **Flashcards**: Interactive flashcard system with flip animations and progress tracking
- **Quiz**: Multi-choice quiz interface with progress tracking and feedback
- **MindMap**: SVG-based mind map visualization with download functionality
- **ExportSection**: PDF and Anki CSV export capabilities
- **Navigation**: Sticky navigation with smooth scrolling to sections

### Backend Services
- **Content Extractor**: Detects and validates different content types (text, URL, YouTube)
- **OpenAI Service**: Integrates with OpenAI API for generating learning materials
- **Storage Interface**: Abstracted storage layer currently using in-memory implementation

## Data Flow

1. **Content Input**: User submits text, URL, or file through ContentInput component
2. **Validation**: Content is validated for type and length constraints
3. **AI Processing**: Content is sent to OpenAI service to generate:
   - Summary (2-paragraph overview)
   - Flashcards (5-10 question-answer pairs)
   - Quiz (multiple choice questions with explanations)
   - Mind Map (hierarchical topic structure)
4. **Storage**: Learning content is stored with generated materials
5. **Display**: Frontend components render the learning materials with interactive features
6. **Export**: Users can export materials as PDF or Anki-compatible CSV

## External Dependencies

### Frontend Dependencies
- React ecosystem (React, React DOM, React Query)
- Radix UI components for accessible primitives
- Tailwind CSS for styling
- Lucide React for icons
- jsPDF for PDF generation
- Date-fns for date utilities

### Backend Dependencies
- Express.js framework
- OpenAI SDK for AI integration
- Multer for file handling
- Drizzle ORM (configured but using in-memory storage)
- @neondatabase/serverless (prepared for Postgres integration)

### Development Dependencies
- TypeScript for type safety
- Vite for build tooling and HMR
- ESBuild for production builds
- PostCSS and Autoprefixer for CSS processing

## Deployment Strategy

### Development Setup
- Vite dev server for frontend with HMR
- Express server with TSX for TypeScript execution
- Concurrent development with proxy setup

### Production Build
- Frontend: Vite builds optimized React bundle to `dist/public`
- Backend: ESBuild bundles server code to `dist/index.js`
- Static file serving from Express in production

### Environment Configuration
- `DATABASE_URL` for future Postgres connection
- `OPENAI_API_KEY` for AI functionality
- `NODE_ENV` for environment-specific behavior

### Database Migration Ready
- Drizzle configuration points to PostgreSQL
- Schema defined for learning content with proper types
- Migration directory structure in place (`./migrations`)
- Ready to switch from in-memory to Postgres storage

## Recent Changes

### July 29, 2025 - Crux Rebranding & Enhanced Learning Features
- **Rebranding**: App renamed to "Crux" with "AI-powered contextual learning companion" tagline
- **Enhanced Learning Features**:
  - Personalized learning path recommendations with step-by-step guidance
  - Additional resources discovery with curated links and difficulty ratings
  - Interactive key terms dictionary with search and categorization
  - Comprehensive AI processing for all enhanced learning materials
- **UI Improvements**: 
  - Crux logo integration in header navigation
  - Updated navigation with all 7 learning sections
  - Footer attribution to Hrudvi Bandla with portfolio link
  - Enhanced success messages reflecting comprehensive toolkit

### July 25, 2025 - Enhanced YouTube Features & Security
- **Content Complexity Slider**: Added 5-level adaptive difficulty system (Beginner to Academic)
- **Enhanced Security**: Implemented DOMPurify sanitization to prevent XSS attacks
- **YouTube Enhancements**: 
  - Rich metadata extraction (title, channel, views, duration, description)
  - Chapter/timestamp detection in transcripts
  - Video thumbnail previews
  - Tabbed interface for different input types
  - Playlist processor framework (in development)
- **User Experience**: Added first-time user onboarding guide with interactive walkthrough

## Notable Architectural Decisions

### Why Drizzle + Postgres Ready
- Prepared for production database needs while allowing rapid development with in-memory storage
- Type-safe database schema with Zod validation
- Easy migration path when database is needed

### Why In-Memory Storage Initially
- Enables immediate development and testing without database setup
- Clean interface allows easy swapping to database implementation
- Reduces deployment complexity for initial versions

### Why shadcn/ui
- Provides consistent, accessible components
- Built on Radix UI for solid accessibility foundation
- Customizable with Tailwind for design system integration
- Modern React patterns with proper TypeScript support

### Why Single-Page Application
- Better user experience with smooth transitions
- Simplified deployment (single static bundle + API)
- Real-time updates during AI content generation
- Local storage for user preferences and progress

### Why Content Complexity Levels
- Adapts learning materials to user's knowledge level
- Ensures accessibility for beginners while providing depth for experts
- Uses tailored language and examples appropriate to each level
- Enhances learning outcomes through personalized content delivery