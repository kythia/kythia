# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

**Kythia** is a feature-rich, modular Discord bot built with Discord.js v14. It uses a plugin-based addon system where features are organized as independent addons (music, economy, AI, moderation, etc.). The architecture emphasizes modularity, allowing addons to be enabled/disabled via configuration.

## Common Development Commands

### Starting the Bot
```bash
# Quick test (foreground)
npm start

# Using Kythia CLI
npx kythia start
npx kythia start --deploy  # Start with slash command deployment
```

### PM2 Process Management (24/7 hosting)
```bash
# First time setup - ONLY run once
npm run pm2:startup
# OR
npx kythia pm2 startup

# Manage running bot
npx kythia pm2 start     # Start bot
npx kythia pm2 restart   # Restart bot
npx kythia pm2 stop      # Stop bot
npx kythia pm2 delete    # Remove from PM2
npx kythia pm2 logs      # View logs
```

### Command Deployment
```bash
npx kythia deploy  # Deploy slash commands to Discord
```

### Database Management
```bash
npx kythia db seed   # Seed database with initial data
npx kythia db flush  # Flush Redis cache (CAUTION: deletes all data)
```

### Code Quality & Formatting
```bash
npx kythia format format  # Format all JS/JSON files with Prettier
npx prettier --write "**/*.{js,json}"
```

### Testing
```bash
npx kythia test test  # Run Jest test suite
jest
```

### Documentation & Build
```bash
npx kythia docs generate      # Generate command documentation
npx kythia build build        # Full build: upversion + docs + obfuscate
npx kythia build upversion    # Update version numbers
npx kythia build obfuscate    # Obfuscate code for production
```

### Development Utilities
```bash
npx kythia check e            # Check for unused translation keys
npx kythia check t            # Check translations
npx kythia audit permissions  # Audit command permissions
npx kythia gen structure      # Generate project structure docs
```

### Code Generation
```bash
# Create a new command file in an addon
npx kythia make:command <addon> <command-name>

# Examples:
npx kythia make:command core test-command
npx kythia make:command economy daily-reward
```

## High-Level Architecture

### Core Entry Points

- **`index.js`**: Main entry point that initializes the bot
- **`src/Kythia.js`**: Core bot class handling command registration, event management, and addon loading
- **`src/KythiaClient.js`**: Creates and configures the Discord.js client instance
- **`src/KythiaManager.js`**: Manages per-guild settings with caching
- **`kythia.config.js`**: Central configuration file (copy from `example.kythia.config.js`)

### Addon System Architecture

Addons are self-contained feature modules located in the `addons/` directory. Each addon follows a consistent structure:

```
addons/<addon-name>/
  ├── addon.json           # Addon metadata and feature flag
  ├── register.js          # Initialization logic (buttons, events, intervals)
  ├── permissions.js       # Permission definitions
  ├── commands/            # Slash commands
  ├── events/              # Discord event handlers
  ├── buttons/             # Button interaction handlers
  ├── helpers/             # Utility functions
  └── database/
      └── models/          # Sequelize database models
```

**Available Addons:** adventure, ai, checklist, core, dashboard, economy, fun, giveaway, globalchat, image, invite, leveling, music, pet, server, streak

#### Key Addon Concepts

1. **Feature Flags**: Each addon has a feature flag in `kythia.config.js` under `addons.<name>.active`
2. **Registration Hook**: `register.js` exports an `initialize(bot)` function called during bot startup
3. **Command Structure**: Commands use Discord.js SlashCommandBuilder and must export `data` and `execute` properties
4. **Database Models**: Extend `KythiaModel` (see Database Layer section) for automatic Redis + in-memory caching

### Configuration System

- **`.env`**: Environment variables (secrets, tokens, API keys)
- **`kythia.config.js`**: Main configuration (copy from `example.kythia.config.js`)
- **`global.kythia`**: Runtime-accessible configuration object

Configuration is loaded at startup and available globally via `global.kythia` or just `kythia`.

### Database Layer (KythiaModel)

The bot uses **Sequelize ORM** with a custom caching layer (`src/database/KythiaModel.js`):

- **Hybrid Redis + In-Memory Cache**: Automatically falls back to in-memory Map if Redis is unavailable
- **Zero-Downtime Caching**: Always has a caching layer available
- **Smart Cache Invalidation**: Tag-aware cache busting via Sequelize hooks
- **Automatic Reconnection**: Redis auto-reconnects after downtime

Models should extend `KythiaModel` instead of Sequelize's base `Model` to inherit caching behavior.

### Event System

Events are registered per-addon in the `events/` directory:
- Discord.js events: `messageCreate.js`, `guildMemberAdd.js`, etc.
- The `register.js` file can also set up intervals, scheduled tasks, or custom event handlers

### Interaction Handlers

The bot supports multiple interaction types:
- **Commands**: Registered via `client.commands` Collection
- **Buttons**: Registered via `bot.registerButtonHandler(customId, handler)`
- **Modals**: Registered via `bot.registerModalHandler(customIdPrefix, handler)`
- **Select Menus**: Registered via `selectMenuHandlers` Map
- **Autocomplete**: Registered via `_registerAutocompleteHandler(commandName, handler)`

### Translation System

- Located in `src/lang/` as JSON files (e.g., `en.json`)
- Use `t(interaction, 'translation.key.path', { variables })` for translations
- Supports nested keys with dot notation
- Check for unused keys: `npx kythia check e`

### Module Aliases

Defined in `package.json` under `_moduleAliases`:
```javascript
@src         -> src/
@addons      -> addons/
@utils       -> src/utils/
@coreHelpers -> addons/core/helpers/
@coreModels  -> addons/core/database/models/
@coreDatabase -> addons/core/database/
@srcDatabase -> src/database/
```

Use these in imports: `require('@coreHelpers/logger')` instead of relative paths.

## Development Workflow

### Adding a New Command

1. Generate command scaffold:
   ```bash
   npx kythia make:command <addon> <command-name>
   ```

2. Edit the generated file in `addons/<addon>/commands/<command-name>.js`

3. Implement the `execute` function with your command logic

4. Deploy commands:
   ```bash
   npx kythia deploy
   ```

### Adding a New Addon

1. Create directory structure in `addons/<addon-name>/`
2. Create `addon.json` with metadata and feature flag name
3. Add `register.js` with `initialize(bot)` export
4. Configure addon in `kythia.config.js` under `addons.<addon-name>`
5. Add commands in `commands/` directory
6. (Optional) Add database models extending `KythiaModel`

### Working with Database Models

Models should extend `KythiaModel` for caching:

```javascript
const KythiaModel = require('@srcDatabase/KythiaModel');

class MyModel extends KythiaModel {
    // Your model definition
}

// Use cache-aware methods:
await MyModel.findOrCreateWithCache({ where: { id: 1 } });
await MyModel.findOneWithCache({ where: { id: 1 } });
```

Cache is automatically invalidated on updates/deletes via Sequelize hooks.

### Code Style

- **Prettier configuration**: `.prettierrc` (printWidth: 140, tabWidth: 4, singleQuote: true)
- **Namespace comments**: All files include `@namespace` annotation
- **Copyright headers**: Include copyright, version, and assistant info
- **Permission handling**: Commands specify `permissions` and `botPermissions` properties

## Important Technical Details

### Command Registration Flow

1. `src/Kythia.js` loads all addons from `addons/` directory
2. Each addon's `commands/` folder is recursively scanned
3. Commands are validated and added to `client.commands` Collection
4. REST API deploys commands to Discord if `--deploy` flag is present
5. Autocomplete handlers are registered separately

### Cooldown System

- Global cooldown: `kythia.bot.globalCommandCooldown` (default: 5 seconds)
- Per-command cooldowns: Define in individual commands
- Owner skip: `kythia.settings.ownerSkipCooldown` allows bot owner to bypass cooldowns

### Permission System

- Bot checks both user permissions and bot permissions before executing commands
- Permissions defined using `PermissionFlagsBits` from Discord.js
- Owner-only commands: Check with `isOwner(userId)` from `@coreHelpers/discord`

### Logging

- Uses Winston logger with daily rotation (`winston-daily-rotate-file`)
- Logs stored in `logs/` directory
- Log format configured via `kythia.settings.logFormat`
- Filter levels via `kythia.settings.logConsoleFilter`

### Error Handling

- Sentry integration for error tracking (configure `kythia.sentry.dsn`)
- Webhook notifications for errors (configure `kythia.api.webhookErrorLogs`)
- Graceful exit hooks via `async-exit-hook`

### Music System (Lavalink)

- Uses Poru library with Lavalink v4.2.0+
- Plugins: lavasrc, youtube, lavasearch, sponsorblock
- Multiple platform support: Spotify, Apple Music, Deezer
- Configure in `kythia.config.js` under `addons.music.lavalink`

### AI Integration (Google Gemini)

- Multiple API key rotation support
- Persona customization via `addons.ai.personaPrompt`
- Rate limiting: `addons.ai.perMinuteAiLimit`
- Safe command whitelist: `addons.ai.safeCommands`
- Daily greeter with cron scheduling

## Prerequisites

- **Node.js**: v22 LTS recommended
- **Database**: MySQL, PostgreSQL, or MSSQL
- **Redis**: Optional but recommended for caching (auto-falls back to in-memory)
- **PM2**: Optional for production deployment (`npm install pm2 -g`)
- **Discord Bot Token**: From Discord Developer Portal

## Configuration Steps

1. Copy `example.env` to `.env` and fill in required values
2. Copy `example.kythia.config.js` to `kythia.config.js` and configure
3. Install dependencies: `npm install`
4. Start bot: `npm start` or `npx kythia start`

## Testing Approach

- Test framework: Jest (configured in `package.json`)
- Run tests: `npx kythia test test` or `jest`
- Test configuration includes module name mapping for aliases
