# Discord Geometry Dash Bot

## Overview

This is a Discord bot designed to serve the Vietnamese Geometry Dash community (GDVN). The bot provides level search functionality, detailed level information retrieval, and Vietnamese language support for the popular rhythm-based platformer game Geometry Dash.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (July 2025)

✓ **Added AI Integration** - OpenAI-powered chatbot for Geometry Dash questions
✓ **Web Configuration Interface** - Accessible at localhost:5000 for bot settings  
✓ **Auto Role System** - Automatic role assignment for new server members
✓ **Moderation Commands** - Ban command with detailed logging to designated channels
✓ **Fun Commands** - Funny responses and update information
✓ **Enhanced Responses** - Vietnamese funny responses when bot is mentioned
✓ **Comprehensive Help System** - Updated help command with categorized commands
✓ **Database Integration** - PostgreSQL database with Drizzle ORM for data persistence
✓ **Statistics System** - User stats, command usage tracking, and server analytics
✓ **Demon List Integration** - Interactive Pointercrate demon list with navigation buttons ✅ TESTED & WORKING
✓ **24/7 Uptime System** - Keep-alive server with self-ping, UptimeRobot ready, secured endpoints

## System Architecture

### Backend Architecture
- **Framework**: Node.js with Discord.js v14
- **Architecture Pattern**: Modular command and event handling system
- **Language**: JavaScript (ES6+)
- **API Integration**: Direct integration with Geometry Dash's official API and fallback services

### Key Technologies
- **Discord.js v14**: Primary Discord API wrapper with Gateway intents
- **Axios**: HTTP client for external API calls
- **Node.js**: Runtime environment

## Key Components

### 1. Bot Core (`index.js`)
- Initializes Discord client with necessary intents (Guilds, GuildMessages, MessageContent, GuildMembers)
- Sets up command and cooldown collections
- Handles global error management with unhandled rejection and exception catching
- Manages bot login and startup process

### 2. Command System
**Location**: `/commands/` directory

**Available Commands**:

*Geometry Dash Commands:*
- `/help` - Displays command list and usage guide in Vietnamese
- `/level <id>` - Retrieves detailed level information by ID
- `/search <name> [limit]` - Searches for levels by name with optional result limit
- `/demonlist [page]` - Shows top demons from Pointercrate with interactive navigation
- `/ping` - Shows bot latency and API response times

*AI & Fun Commands:*
- `/ai <message>` - Chat with AI assistant about Geometry Dash
- `/ask <question>` - Ask AI questions with enhanced GD knowledge
- `/funny` - Display funny Geometry Dash memes and jokes
- `/update` - Show latest bot updates and features

*Moderation Commands:*
- `/ban <user> [reason]` - Ban members with detailed logging (requires permissions)

*Statistics & Analytics:*
- `/stats user [target]` - View user command usage and activity statistics
- `/stats server` - View server statistics and recent moderation logs
- `/stats commands` - View most popular commands and success rates

**Command Structure**: Each command exports a `data` object (SlashCommandBuilder) and an `execute` function

### 3. Event Handling System
**Location**: `/events/` directory

**Event Handlers**:
- `ready.js` - Bot initialization, command registration, activity setting
- `interactionCreate.js` - Handles slash commands, buttons, and select menus
- `messageCreate.js` - Legacy prefix command handling and bot mentions

### 4. Geometry Dash API Service
**Location**: `/services/geometryDashAPI.js`

**Functionality**:
- Primary API: Direct connection to Boomlings database (`http://www.boomlings.com/database`)
- Fallback API: Alternative service for reliability (`https://gdutils.com/api`)
- Level data parsing and formatting
- Error handling with automatic fallback switching

### 5. AI Service Integration
**Location**: `/services/aiService.js`

**Functionality**:
- OpenAI API integration for intelligent responses
- Geometry Dash specialized knowledge base
- Vietnamese language support for AI responses
- Error handling with quota and API key validation
- Token usage monitoring and logging

### 6. Web Configuration Interface
**Location**: `/server.js`, `/public/index.html`

**Features**:
- Web-based configuration panel on port 5000
- Real-time bot status monitoring
- API key management (Discord, OpenAI)
- Auto role and log channel configuration
- Secure credential storage and validation

### 7. Database Layer
**Location**: `/server/db.ts`, `/server/storage.ts`, `/shared/schema.ts`

**Components**:
- PostgreSQL database with Neon serverless connection
- Drizzle ORM for type-safe database operations
- Comprehensive schema for users, guilds, command usage, AI chats, and moderation logs
- Database utilities for caching and performance optimization

**Tables**:
- `users` - Discord user profiles with activity tracking
- `guilds` - Server configurations and settings
- `command_usage` - Command execution statistics and performance metrics  
- `ai_chat_history` - AI conversation logs with token usage
- `moderation_logs` - Moderation actions with detailed audit trail

### 8. Utility Modules

**Database Utilities** (`/utils/database.js`):
- User and guild management with automatic registration
- Command usage logging and statistics collection
- AI chat history and analytics
- In-memory caching for improved performance

**Vietnamese Language Support** (`/utils/vietnamese.js`):
- Difficulty name translation (Easy → Dễ, Normal → Bình thường, etc.)
- Difficulty icon mapping with emoji representation
- Length categorization in Vietnamese
- Cultural localization for Vietnamese community

**Logging System** (`/utils/logger.js`):
- Timestamp formatting for Vietnam timezone (Asia/Ho_Chi_Minh)
- Multi-level logging (error, warn, info, debug)
- Structured message formatting
- Memory usage monitoring

### 6. Configuration Management
**Location**: `/config/config.js`

**Settings Include**:
- Discord bot credentials and IDs
- API endpoints and timeouts
- Vietnamese flag-themed color scheme for embeds
- Command cooldowns and rate limiting
- Localization preferences

## Data Flow

### Command Execution Flow
1. User invokes slash command
2. `interactionCreate.js` receives interaction
3. Command validation and cooldown checking
4. Command execution with error handling
5. API calls to Geometry Dash services (if needed)
6. Vietnamese localization of response data
7. Discord embed creation and reply

### Level Information Retrieval
1. User requests level by ID or search term
2. Primary API call to Boomlings database
3. If primary fails, automatic fallback to alternative API
4. Raw data parsing and Vietnamese translation
5. Formatted embed response with localized content

## External Dependencies

### Discord Integration
- **discord.js v14**: Core Discord API functionality
- **@discordjs/rest**: REST API handling for command registration
- **discord-api-types**: TypeScript definitions for Discord API

### HTTP Client
- **axios**: API requests with timeout and error handling

### Geometry Dash APIs
- **Primary**: Boomlings official database
- **Fallback**: GDUtils community API service

## Deployment Strategy

### Environment Configuration
- Environment variables for sensitive data (DISCORD_TOKEN, CLIENT_ID)
- Configurable logging levels and bot settings
- Timezone-aware logging for Vietnamese users

### Error Resilience
- Global unhandled rejection and exception catching
- Automatic API fallback mechanisms
- Command cooldown system to prevent spam
- Graceful error messages in Vietnamese

### Monitoring and Logging
- Comprehensive logging system with Vietnamese timezone
- Memory usage monitoring with periodic reporting
- Command usage tracking and error logging
- Bot status and uptime monitoring

### Scalability Considerations
- Modular command loading system for easy expansion
- Configurable rate limiting and cooldowns
- Collection-based command and cooldown management
- Efficient memory usage with periodic monitoring

The bot is specifically designed to serve the Vietnamese Geometry Dash community with localized content, Vietnamese language support, and culturally appropriate responses while maintaining high reliability through fallback systems and comprehensive error handling.