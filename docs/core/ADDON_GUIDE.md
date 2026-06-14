# Kythia Core — Addon Authoring Guide

> Complete step-by-step guide to creating, structuring, and publishing addons — **v26.1.0**

---

## Table of Contents

- [What is an Addon?](#what-is-an-addon)
- [Auto-Loading System](#auto-loading-system)
- [Directory Structure](#directory-structure)
- [addon.json Schema](#addonjson-schema)
- [Commands](#commands)
  - [Simple Command](#simple-command)
  - [Subcommands (Split Folder)](#subcommands-split-folder)
  - [Subcommand Groups](#subcommand-groups)
  - [Context Menu Commands](#context-menu-commands)
  - [Autocomplete](#autocomplete)
  - [Command Middleware Properties](#command-middleware-properties)
- [Events](#events)
- [Buttons](#buttons)
- [Modals](#modals)
- [Select Menus](#select-menus)
- [Tasks (Cron & Interval)](#tasks-cron--interval)
- [Queues (BullMQ)](#queues-bullmq)
- [register.js Hook](#registerjs-hook)
- [Database Models](#database-models)
- [Migrations](#migrations)
- [Seeders](#seeders)
- [Localization (Lang Files)](#localization-lang-files)
- [Dependency Declaration & Load Order](#dependency-declaration--load-order)
- [Disabling an Addon](#disabling-an-addon)

---

## What is an Addon?

An addon is a self-contained feature module that Kythia Core discovers and loads automatically. Each addon can provide:

- Slash commands, context menu commands
- Event handlers
- Button, modal, and select menu handlers
- Scheduled tasks (cron or interval)
- Database models and migrations
- i18n locale strings
- A `register.js` hook for custom initialization

Addons are isolated from each other. They communicate through the shared `KythiaContainer` (DI container), not through direct imports.

---

## Auto-Loading System

**You never register anything manually.** When `kythia.start()` runs, `AddonManager` scans every folder inside `addons/` (folders prefixed with `_` are skipped) and wires up everything it finds automatically. Here is exactly what gets discovered and how:

### What is auto-loaded?

| Folder / File | Auto-loaded as | How it's matched |
|---|---|---|
| `commands/*.js` | Slash commands, context menu commands | Filename (or `data.name`) → Discord command name |
| `commands/<name>/_command.js` | Parent command (subcommand container) | Folder name → parent command name |
| `commands/<name>/<sub>.js` | Subcommand (`/parent sub`) | Folder + filename → `parent sub` key |
| `commands/<name>/<group>/_group.js` | Subcommand group | Three-level folder nesting |
| `commands/<name>/<group>/<sub>.js` | Subcommand in group (`/parent group sub`) | Three-level folder + filename |
| `events/<eventName>.js` | Discord event listener | Filename (without `.js`) = Discord.js event name |
| `buttons/<customId>.js` | Button interaction handler | Filename (without `.js`) = `customId` |
| `modals/<prefix>.js` | Modal submit handler | Filename (without `.js`) = `customId` prefix |
| `select_menus/<prefix>.js` | Select menu handler | Filename (without `.js`) = `customId` prefix |
| `tasks/<name>.js` | Scheduled task (cron or interval) | Filename = task name, `schedule` field drives timing |
| `queues/*.js` | BullMQ queue processor contract | Auto-registers queue, worker, and events |
| `database/models/*.js` | Sequelize models → `container.models` | Class name → model key |
| `database/migrations/*.js` | Database migrations (via `npx kythia migrate`) | Timestamp prefix for ordering |
| `database/seeders/*.js` | Database seeders (via `npx kythia db:seed`) | Class name |
| `lang/<locale>.json` | Translation strings → `TranslatorManager` | Filename = BCP-47 locale code (e.g. `en-US`, `id`) |
| `register.js` | Addon init hook | Runs once before commands/events registration |
| `addon.json` | Metadata, priority, dependencies | Parsed to determine load order |

### How the load sequence works

When `kythia.start()` is called, `AddonManager.loadAddons()` runs the following steps in order:

```
1. Scan addons/ directory
   └── Read addon.json from each folder (priority, dependencies)

2. Resolve load order
   └── Topological sort (Kahn's algorithm) with priority as tiebreaker
   └── Disabled or invalid-dependency addons are skipped with an error log

For each addon (in resolved order):
   3. Run register.js  ← your custom init hook
   4. Scan commands/  ← auto-register slash + context menu commands
   5. Scan events/    ← auto-register Discord event listeners
   6. Scan buttons/   ← auto-register button handlers
   7. Scan modals/    ← auto-register modal handlers
   8. Scan select_menus/ ← auto-register select menu handlers
   9. Scan tasks/     ← auto-register cron/interval tasks
  10. Scan queues/    ← auto-register BullMQ processors
  11. Scan lang/      ← merge locale JSON into TranslatorManager
  12. Scan database/models/ ← load & sync Sequelize models

13. Deploy slash commands to Discord (global or guild-scoped)
14. Initialize EventManager (attach all collected event listeners)
15. Initialize InteractionManager (attach interactionCreate listener)
16. Initialize QueueManager (spin up BullMQ queues & workers)
```

### Component routing — how `customId` matching works

For buttons, modals, and select menus, the framework extracts the **prefix** from the incoming `customId` before looking up the handler:

```
customId: "confirm-delete|123"    → prefix: "confirm-delete"
customId: "confirm-delete:123"   → prefix: "confirm-delete"
customId: "confirm-delete"       → prefix: "confirm-delete"
```

The split is on `|` first, then `:`. So a button file named `confirm-delete.js` will match **all three** patterns above. This lets you embed dynamic data (like a record ID) in the `customId` after the delimiter while keeping handler files simple.

### Event handler stacking

Multiple addons **can and do** register handlers for the same Discord event. All handlers for the same event run in sequence (in addon load order). A handler can return `true` to stop further handlers from running (acts like `event.stopPropagation()`):

```javascript
// addons/antispam/events/messageCreate.js
module.exports = async (eventManager, message) => {
  const isSpam = checkSpam(message);
  if (isSpam) {
    await message.delete();
    return true; // stops any subsequent messageCreate handlers in other addons
  }
};
```

### Intent validation

`AddonManager` checks at load time that the Discord client has the required `GatewayIntent` for each event handler. If the intent is missing, a warning is logged — the handler is still registered but will never fire in practice.

### i18n / locale merging

Lang files from all addons are **merged together** into a single `TranslatorManager` collection per locale code. If two addons both define the same key, the **later-loaded addon wins**. The translator normalises short locale codes automatically — e.g. if your DB stores `"en"`, it resolves to `"en-US"` (or whichever `en-*` file is loaded).

---

## Directory Structure

```
addons/my-feature/
├── addon.json               # Required: metadata & dependency declaration
├── register.js              # Optional: runs once during addon load
│
├── commands/
│   ├── ping.js              # Simple top-level command
│   ├── user/                # Folder = parent command group
│   │   ├── _command.js      # Parent command definition
│   │   ├── profile.js       # Subcommand
│   │   └── settings/
│   │       ├── _group.js    # Subcommand group definition
│   │       └── privacy.js   # Subcommand in group
│   └── ban.js               # Another top-level slash command
│
├── events/
│   ├── messageCreate.js     # Filename = event name
│   └── guildMemberAdd.js
│
├── buttons/
│   └── confirm-delete.js    # Filename = customId (exact or prefix)
│
├── modals/
│   └── feedback.js          # Filename = customId prefix
│
├── select_menus/
│   └── role-select.js       # Filename = customId prefix
│
├── tasks/
│   └── daily-cleanup.js     # Scheduled task
│
├── queues/
│   ├── image.js             # Queue contract
│   └── processors/
│       └── imageProcessor.js # Sandboxed worker
│
├── lang/
│   ├── en.json              # English translations (master)
│   └── ja.json              # Japanese translations
│
└── database/
    ├── models/
    │   └── UserData.js      # Sequelize model extending KythiaModel
    ├── migrations/
    │   └── 20250128_create_user_data.js
    └── seeders/
        └── UserDataSeeder.js
```

> **Naming convention:** Addon folders prefixed with `_` (e.g., `_disabled-addon`) are ignored during discovery.

---

## addon.json Schema

```json
{
  "name": "my-feature",
  "version": "1.0.0",
  "description": "Feature description",
  "author": "Your Name",
  "priority": 50,
  "dependencies": ["core"],
  "active": true
}
```

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `name` | `string` | ✅ | — | Unique addon identifier (must match folder name) |
| `version` | `string` | ✅ | — | Semantic version string |
| `description` | `string` | — | — | Human-readable description |
| `author` | `string` | — | — | Addon author |
| `priority` | `number` | — | `50` | Load order (0–9999). **Lower number = loads first.** |
| `dependencies` | `string[]` | — | `[]` | Other addon names that must be loaded before this one |
| `active` | `boolean` | — | `true` | Set to `false` to disable the addon |

Addons can also be toggled from `kythia.config.js`:

```javascript
addons: {
  'my-feature': { active: false }
}
```

The config file takes precedence over `addon.json`.

---

## Commands

### Simple Command

The most common pattern — a single `.js` file in the `commands/` folder.

```javascript
// addons/my-feature/commands/ping.js
const { SlashCommandBuilder } = require('discord.js');
const { BaseCommand } = require('kythia-core');

class PingCommand extends BaseCommand {
  slashCommand = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check bot latency');

  // Optional middleware properties
  cooldown = 5000;      // 5s per-user cooldown
  ownerOnly = false;

  async execute(interaction) {
    const container = this.container;
    const { logger } = container;
    const latency = Date.now() - interaction.createdTimestamp;

    logger.info(`Ping: ${latency}ms`);
    await interaction.reply(`🏓 Pong! Latency: **${latency}ms**`);
  }
}

exports.default = PingCommand;
```

### Subcommands (Split Folder)

For commands with subcommands, create a folder with the parent command name and place a `_command.js` file inside it.

```
commands/user/
├── _command.js    ← parent command definition
├── profile.js     ← /user profile
└── info.js        ← /user info
```

```javascript
// addons/my-feature/commands/user/_command.js
const { SlashCommandBuilder } = require('discord.js');
const { BaseCommand } = require('kythia-core');

class UserCommand extends BaseCommand {
  subcommand = true;

  slashCommand = (group) =>
    group
      .setName('user')
      .setDescription('User management commands');
  // No execute() — parent commands are containers only
}

exports.default = UserCommand;
```

```javascript
// addons/my-feature/commands/user/profile.js
const { SlashCommandBuilder } = require('discord.js');
const { BaseCommand } = require('kythia-core');

class ProfileCommand extends BaseCommand {
  subcommand = true;

  slashCommand = (subcommand) =>
    subcommand
      .setName('profile')
      .setDescription('View a user profile');

  async execute(interaction) {
    const container = this.container;
    const { models, t } = container;
    const { User } = models;

    const user = await User.getCache({ where: { userId: interaction.user.id } });
    const title = await t(interaction, 'profile.title', { name: interaction.user.username });

    await interaction.reply({ content: title });
  }
}

exports.default = ProfileCommand;
```

### Subcommand Groups

Add another level of nesting with `_group.js`:

```
commands/settings/
├── _command.js
└── privacy/
    ├── _group.js   ← subcommand group definition
    └── toggle.js   ← /settings privacy toggle
```

```javascript
// commands/settings/privacy/_group.js
const { SlashCommandBuilder } = require('discord.js');
const { BaseCommand } = require('kythia-core');

class PrivacyGroupCommand extends BaseCommand {
  subcommandGroup = true;

  slashCommand = (group) =>
    group
      .setName('privacy')
      .setDescription('Privacy settings');
}

exports.default = PrivacyGroupCommand;
```

### Context Menu Commands

Context menu commands (Right-click on User or Message) use the same `commands/` folder:

```javascript
// addons/my-feature/commands/user-info.js
const { ContextMenuCommandBuilder, ApplicationCommandType } = require('discord.js');
const { BaseCommand } = require('kythia-core');

class UserInfoCommand extends BaseCommand {
  contextMenuCommand = new ContextMenuCommandBuilder()
    .setName('Get User Info')
    .setType(ApplicationCommandType.User);

  async execute(interaction) {
    const targetUser = interaction.targetUser;
    await interaction.reply({ content: `User: ${targetUser.tag}`, ephemeral: true });
  }
}

exports.default = UserInfoCommand;
```

### Autocomplete

Add an `autocomplete` method to any command module:

```javascript
const { SlashCommandBuilder } = require('discord.js');
const { BaseCommand } = require('kythia-core');

class PlayCommand extends BaseCommand {
  slashCommand = new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play a song')
    .addStringOption((opt) =>
      opt.setName('query').setDescription('Song name or URL').setAutocomplete(true)
    );

  async autocomplete(interaction) {
    const query = interaction.options.getFocused();
    const results = await searchSongs(query);

    await interaction.respond(
      results.map((r) => ({ name: r.title, value: r.url })).slice(0, 25)
    );
  }

  async execute(interaction) {
    const url = interaction.options.getString('query');
    // ...
  }
}

exports.default = PlayCommand;
```

### Command Middleware Properties

Add these properties to any command module to apply built-in middleware:

| Property | Type | Description |
|---|---|---|
| `botPermissions` | `string[]` | Discord permission flags the bot must have |
| `userPermissions` | `string[]` | Discord permission flags the invoking user must have |
| `cooldown` | `number` (ms) | Per-user cooldown in milliseconds |
| `ownerOnly` | `boolean` | Restrict to `config.owner.ids` |
| `isInMainGuild` | `boolean` | Command only usable inside `config.bot.mainGuildId` |
| `mainGuildOnly` | `boolean` | Deploy command only to the main guild (not globally) |

```javascript
const { SlashCommandBuilder } = require('discord.js');
const { BaseCommand } = require('kythia-core');

class BanCommand extends BaseCommand {
  slashCommand = new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a user');

  botPermissions = ['BanMembers'];
  userPermissions = ['BanMembers'];
  cooldown = 10000;
  mainGuildOnly = true;

  async execute(interaction) { /* ... */ }
}

exports.default = BanCommand;
```

---

## Events

Event handler filenames must exactly match the Discord.js event name (e.g., `messageCreate`, `guildMemberAdd`).

```javascript
// addons/my-feature/events/guildMemberAdd.js
module.exports = async (member, container) => {
  const { logger, models } = container;
  const { GuildSetting } = models;

  const setting = await GuildSetting.getCache({ where: { guildId: member.guild.id } });
  if (!setting?.welcomeChannelId) return;

  const channel = member.guild.channels.cache.get(setting.welcomeChannelId);
  await channel?.send(`Welcome <@${member.id}>! 👋`);

  logger.info(`New member: ${member.user.tag} in ${member.guild.name}`);
};
```

**Multiple addons can handle the same event.** Handlers run concurrently (`Promise.all`). Errors in one handler do not affect others.

**Common Discord.js events:**

| Event | Arguments | Requires Intent |
|---|---|---|
| `messageCreate` | `message, container` | `GuildMessages` + `MessageContent` |
| `guildMemberAdd` | `member, container` | `GuildMembers` |
| `guildMemberRemove` | `member, container` | `GuildMembers` |
| `interactionCreate` | handled by `InteractionManager` | `Guilds` |
| `guildCreate` | `guild, container` | `Guilds` |
| `guildDelete` | `guild, container` | `Guilds` |
| `messageReactionAdd` | `reaction, user, container` | `GuildMessageReactions` |
| `voiceStateUpdate` | `oldState, newState, container` | `GuildVoiceStates` |
| `presenceUpdate` | `oldPresence, newPresence, container` | `GuildPresences` |

> **Intent validation:** `AddonManager` checks that the required intent is enabled on the Discord client when the event handler is loaded. A warning is logged if the intent is missing.

---

## Buttons

Button handlers are matched by the component's `customId`. The filename (without `.js`) is used as the match key.

**Exact match** (file: `confirm-delete.js`):
```javascript
// addons/my-feature/buttons/confirm-delete.js
module.exports = {
  // Required: customId to match (exact)
  customId: 'confirm-delete',

  async execute(interaction) {
    const { models } = interaction.client.container;
    const recordId = interaction.message.embeds[0]?.footer?.text;

    await models.Record.destroy({ where: { id: recordId } });
    await interaction.update({ content: '✅ Deleted!', components: [] });
  },
};
```

**Prefix match** — register in `register.js` for dynamic customIds (e.g., `confirm-delete:123`):

```javascript
// addons/my-feature/register.js
module.exports = async function register({ addonManager }) {
  addonManager.registerButtonHandler('confirm-delete:', async (interaction) => {
    const recordId = interaction.customId.split(':')[1];
    await interaction.reply({ content: `Deleting ${recordId}...`, ephemeral: true });
  });
};
```

The handler for `'confirm-delete:'` (ending with `:`) will match any customId starting with that prefix.

---

## Modals

Modal handlers match by `customId` prefix. Register them in `register.js`:

```javascript
// addons/my-feature/register.js
module.exports = async function register({ addonManager }) {
  addonManager.registerModalHandler('feedback:', async (interaction) => {
    const text = interaction.fields.getTextInputValue('feedback-text');
    const rating = interaction.fields.getTextInputValue('feedback-rating');

    const { models, logger } = interaction.client.container;
    await models.Feedback.create({
      userId: interaction.user.id,
      text,
      rating: parseInt(rating),
    });

    logger.info(`Feedback submitted by ${interaction.user.tag}`);
    await interaction.reply({ content: '✅ Thank you for your feedback!', ephemeral: true });
  });
};
```

Trigger the modal from a command:
```javascript
const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

const modal = new ModalBuilder()
  .setCustomId('feedback:' + interaction.user.id)  // prefix matches
  .setTitle('Feedback Form');

const feedbackInput = new TextInputBuilder()
  .setCustomId('feedback-text')
  .setLabel('Your feedback')
  .setStyle(TextInputStyle.Paragraph);

modal.addComponents(new ActionRowBuilder().addComponents(feedbackInput));
await interaction.showModal(modal);
```

---

## Select Menus

Select menu handlers also match by prefix. Register them in `register.js`:

```javascript
module.exports = async function register({ addonManager }) {
  addonManager.registerSelectMenuHandler('role-select:', async (interaction) => {
    const selectedRoles = interaction.values; // Array of selected values
    const { logger } = interaction.client.container;

    for (const roleId of selectedRoles) {
      await interaction.member.roles.add(roleId).catch(() => {});
    }

    logger.info(`Roles assigned to ${interaction.user.tag}: ${selectedRoles.join(', ')}`);
    await interaction.reply({ content: '✅ Roles updated!', ephemeral: true });
  });
};
```

**Supported select menu types:** string, user, role, channel, mentionable — all dispatched to the same handler.

---

## Tasks (Cron & Interval)

Task files export an object with `execute` and `schedule`.

### Cron Task

```javascript
// addons/my-feature/tasks/daily-cleanup.js
const { Op } = require('sequelize');

module.exports = {
  taskName: 'daily-cleanup',   // Optional — filename is used if not set
  schedule: '0 0 * * *',       // Cron syntax: every day at midnight UTC

  async execute(container) {
    const { logger, models } = container;
    const { TempLog } = models;

    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
    const deleted = await TempLog.destroy({ where: { createdAt: { [Op.lt]: cutoff } } });

    logger.info(`[daily-cleanup] Removed ${deleted} temp log entries`);
  },
};
```

### Interval Task

```javascript
// addons/my-feature/tasks/heartbeat.js
module.exports = {
  taskName: 'heartbeat',
  schedule: 30000,   // Every 30 seconds (milliseconds)

  async execute(container) {
    const { logger } = container;
    logger.debug('Heartbeat tick');
  },
};
```

> **Cron string validation:** Kythia validates your cron string with `node-cron` at load time and logs an error if invalid.  
> **Interval tracking:** Interval tasks are tracked by `ShutdownManager` and automatically cleared on graceful shutdown.

---

## Queues (BullMQ)

Kythia Core features a plug-and-play BullMQ Queue Manager. To offload heavy or background operations (like generating images) without blocking the bot's event loop, you create a queue contract and a sandboxed processor.

1. **Queue Contract File** (in `queues/` directory):

```javascript
// addons/leveling/queues/image.js
const path = require('path');

module.exports = {
  queueName: 'kythia-image-queue',      // Required: Unique name for your queue
  processorPath: path.join(__dirname, 'processors', 'imageProcessor.js'), // Required: Path to the sandboxed worker
  concurrency: 2,                        // Optional: Defaults to 1
};
```

2. **Sandboxed Worker File** (in `queues/processors/`):

> Sandboxed workers run in separate Node.js threads, meaning they **cannot access the DI Container directly**. You must pass all required data inside the job payload.

```javascript
// addons/leveling/queues/processors/imageProcessor.js
module.exports = async (job) => {
  // Heavy computation goes here
  const { type, userId, options } = job.data;
  
  if (type === 'profileImage') {
    // Generate image buffer...
    return buffer; // BullMQ converts this to { type: 'Buffer', data: [...] }
  }
};
```

3. **Dispatching and Waiting in a Command**:

```javascript
// Inside your execute(interaction) function
const { queueManager } = interaction.client.container;

// 1. Dispatch the job
const job = await queueManager.dispatch('kythia-image-queue', 'profile', {
  type: 'profileImage',
  userId: interaction.user.id,
  options: { /* ... */ }
});

// 2. Wait for it to finish (ideal for deferred interactions)
const result = await queueManager.waitFor(job, 'kythia-image-queue');

// 3. Reconstruct buffer from the result
const buffer = Buffer.from(result.data);
```

---

## register.js Hook

`register.js` is an optional file in your addon root that runs once during addon loading, **before** commands and events are registered.

Use it to:
- Register button, modal, and select menu handlers programmatically
- Register cron/interval tasks programmatically
- Perform one-time async initialization
- Load embed templates (draft embeds)

```javascript
// addons/my-feature/register.js
module.exports = async function register({ addonManager, container }) {
  const { logger, kythiaConfig } = container;

  logger.info('[my-feature] Initializing...');

  // Register handlers
  addonManager.registerButtonHandler('my-confirm', async (interaction) => {
    await interaction.reply({ content: '✅ Confirmed!', ephemeral: true });
  });

  addonManager.registerModalHandler('my-modal:', async (interaction) => {
    const value = interaction.fields.getTextInputValue('input-field');
    await interaction.reply({ content: `Got: ${value}`, ephemeral: true });
  });

  addonManager.registerSelectMenuHandler('my-select:', async (interaction) => {
    await interaction.reply({ content: `Selected: ${interaction.values[0]}`, ephemeral: true });
  });

  // Register a programmatic task
  addonManager.registerTaskHandler(
    'my-task',
    async (container) => { logger.info('My task ran'); },
    '*/10 * * * *' // Every 10 minutes
  );

  logger.info('[my-feature] Ready ✅');
};
```

**The `register` function receives:**

```typescript
{
  addonManager: IAddonManager;
  container: KythiaContainer;
}
```

---

## Database Models

Create models by extending `KythiaModel`. This gives your model automatic Redis/LRU caching.

```javascript
// addons/my-feature/database/models/UserData.js
const { KythiaModel } = require('kythia-core');
const { DataTypes } = require('sequelize');

class UserData extends KythiaModel {
  static tableName = 'user_data';

  static init(sequelize) {
    return super.init(
      {
        userId: {
          type: DataTypes.STRING(30),
          allowNull: false,
          unique: true,
        },
        points: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
        },
        level: {
          type: DataTypes.INTEGER,
          defaultValue: 1,
        },
        lastClaim: {
          type: DataTypes.DATE,
          allowNull: true,
        },
      },
      {
        sequelize,
        modelName: 'UserData',
        tableName: UserData.tableName,
        timestamps: true,  // adds createdAt / updatedAt
      }
    );
  }
}

module.exports = UserData;
```

### Using Models in Commands

```javascript
const { models } = interaction.client.container;
const { UserData } = models;

// Find one with cache (Redis → LRU → DB)
const user = await UserData.getCache({ where: { userId: interaction.user.id } });

// Find or create with cache
const [user, created] = await UserData.findOrCreateCache({
  where: { userId: interaction.user.id },
  defaults: { points: 0, level: 1 },
});

// Update (automatically invalidates cache via afterSave hook)
await user.update({ points: user.points + 10 });

// Find all with cache
const topUsers = await UserData.getAllCache({
  order: [['points', 'DESC']],
  limit: 10,
});

// Count with cache
const totalUsers = await UserData.countCache({ where: { level: { [Op.gte]: 10 } } });
```

### Defining Associations

Use `addDbReadyHook` in your bot's entry file to define associations after all models are loaded:

```javascript
// index.js
kythia.addDbReadyHook((seq) => {
  const { UserData, GuildSetting } = seq.models;
  // Define your associations here
  UserData.hasMany(GuildSetting, { foreignKey: 'userId' });
  GuildSetting.belongsTo(UserData, { foreignKey: 'userId' });
});
```

---

## Migrations

Migrations use the `umzug` library (Laravel-style batch tracking). Create via CLI:

```bash
npx kythia make:migration --name create_user_data --addon my-feature
```

**Generated file:** `addons/my-feature/database/migrations/20250304120000_create_user_data.js`

```javascript
// addons/my-feature/database/migrations/20250304120000_create_user_data.js
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable('user_data', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.STRING(30),
        allowNull: false,
        unique: true,
      },
      points: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      level: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },
      lastClaim: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('user_data');
  },
};
```

**Adding a column to an existing table:**

```javascript
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.addColumn('user_data', 'streak', {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('user_data', 'streak');
  },
};
```

**Running migrations:**

```bash
npx kythia migrate              # Run pending
npx kythia migrate --rollback   # Rollback last batch
npx kythia migrate --fresh      # ⚠️ Drop all + re-run (DATA LOSS in production)
```

> **Filename format:** `YYYYMMDDHHMMSS_description.js` — migration files are sorted by this timestamp prefix.

---

## Seeders

Seeders populate initial/test data. Create via CLI:

```bash
npx kythia make:seeder UserDataSeeder --addon my-feature
```

```javascript
// addons/my-feature/database/seeders/UserDataSeeder.js
const { Seeder } = require('kythia-core');

class UserDataSeeder extends Seeder {
  async run() {
    const { UserData } = this.container.models;
    await UserData.bulkCreate([
      { userId: '111111111111111111', points: 1000, level: 5 },
      { userId: '222222222222222222', points: 500, level: 3 },
    ]);
  }
}

module.exports = UserDataSeeder;
```

Run seeders:

```bash
npx kythia db:seed                                   # All seeders
npx kythia db:seed --class UserDataSeeder            # Specific seeder
npx kythia db:seed --addon my-feature                # All seeders from addon
```

---

## Localization (Lang Files)

Place JSON locale files in `addons/my-feature/lang/`. The filename is the BCP-47 locale code.

```json
// addons/my-feature/lang/en.json
{
  "ping": {
    "response": "Pong! 🏓",
    "latency": "Gateway latency: {{ms}}ms"
  },
  "profile": {
    "title": "{{name}}'s Profile",
    "points": "Points: **{{points}}**",
    "level": "Level: **{{level}}**",
    "not_found": "You don't have a profile yet. Use `/profile create` to get started!"
  },
  "errors": {
    "permission_denied": "❌ You don't have permission to do that.",
    "unknown": "❌ Something went wrong. Please try again."
  }
}
```

**Variable syntax:** `{{variableName}}` — replaced at runtime with the values you pass to `t()`.

**Creating other language files:**

```bash
# Auto-translate en.json to Japanese with Gemini AI
npx kythia lang:translate --target ja

# Sync all language files with en.json (add missing keys, remove obsolete keys)
npx kythia lang:sync

# Check for missing/unused translation keys
npx kythia lang:check
```

**Using translations in a command:**

```javascript
async execute(interaction) {
  const { t } = interaction.client.container;

  // Basic
  const response = await t(interaction, 'ping.response');

  // With variables
  const latency = Date.now() - interaction.createdTimestamp;
  const msg = await t(interaction, 'ping.latency', { ms: latency });

  await interaction.reply(msg);
},
```

---

## Dependency Declaration & Load Order

Declare other addons that must be loaded before yours in `addon.json`:

```json
{
  "name": "economy",
  "priority": 50,
  "dependencies": ["core", "database"]
}
```

Kythia uses **Kahn's topological sort algorithm** with `priority` as a tiebreaker:

- Missing dependencies → the dependent addon is disabled with an error log
- Circular dependencies → detected and logged; both addons are disabled
- Lower `priority` number → loads earlier when no dependency constraint exists

**Priority conventions:**

| Priority Range | Convention |
|---|---|
| `0–9` | Core framework addons |
| `10–49` | Foundation addons (database abstractions, auth) |
| `50–99` | Standard feature addons (economy, leveling, etc.) |
| `100+` | Dependent/overlay addons |

---

## Disabling an Addon

**Option 1 — `addon.json`:**
```json
{
  "name": "nsfw",
  "active": false
}
```

**Option 2 — `kythia.config.js`** (overrides `addon.json`):
```javascript
addons: {
  nsfw: { active: false },
  economy: { active: false },
}
```

Disabled addons are completely skipped — their commands, events, models, and migrations are not loaded.

---

For the full container API, see [CONTAINER.md](./CONTAINER.md).  
For configuration reference, see [CONFIG.md](./CONFIG.md).  
For CLI tools to scaffold addon files, see [CLI_REFERENCE.md](./CLI_REFERENCE.md).  
For system architecture and flow diagrams, see [ARCHITECTURE.md](./ARCHITECTURE.md).
