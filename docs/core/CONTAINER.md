# Kythia Core — KythiaContainer Reference

> Complete reference for the `KythiaContainer` interface — every property, when it is available, and how to use it — **v26.1.0**

---

## Table of Contents

- [What is KythiaContainer?](#what-is-kythiacontainer)
- [Accessing the Container](#accessing-the-container)
- [Property Reference](#property-reference)
  - [client](#client)
  - [sequelize](#sequelize)
  - [logger](#logger)
  - [redis](#redis)
  - [kythiaConfig](#kythiaconfig)
  - [helpers](#helpers)
  - [appRoot](#approot)
  - [engine](#engine)
  - [metrics](#metrics)
  - [engineToken](#enginetoken)
  - [translator](#translator)
  - [t (Translate Function)](#t-translate-function)
  - [models](#models)
  - [middlewareManager](#middlewaremanager)
  - [interactionManager](#interactionmanager)
  - [addonManager](#addonmanager)
  - [eventManager](#eventmanager)
  - [shutdownManager](#shutdownmanager)
  - [_degraded](#_degraded)
- [Property Availability Timeline](#property-availability-timeline)
- [Usage Patterns](#usage-patterns)
  - [In Commands (Slash / Context Menu)](#in-commands-slash--context-menu)
  - [In Event Handlers](#in-event-handlers)
  - [In Button / Modal / Select Menu Handlers](#in-button--modal--select-menu-handlers)
  - [In Tasks](#in-tasks)
  - [In register.js](#in-registerjs)
  - [In Hooks (addDbReadyHook / addClientReadyHook)](#in-hooks)
- [The `t()` Translation Function](#the-t-translation-function)
- [The `helpers.discord` Built-in Helpers](#the-helpersdiscord-built-in-helpers)
- [Dependency Injection vs Direct Imports](#dependency-injection-vs-direct-imports)

---

## What is KythiaContainer?

`KythiaContainer` is the **central dependency injection (DI) container** for the entire Kythia bot. It is constructed by the `Kythia` class during boot and attached to the Discord `client` as `client.container`.

Every service, manager, model, configuration object, and utility your addon code needs lives inside this one object — no need to import anything from `kythia-core` directly in your addon files.

```
KythiaContainer
 ├── client        (Discord.js Client + Kythia extensions)
 ├── sequelize     (Sequelize ORM instance)
 ├── logger        (Winston logger)
 ├── redis         (ioredis instance)
 ├── kythiaConfig  (full config object)
 ├── helpers       (discord + custom helpers)
 ├── models        (all loaded Sequelize models)
 ├── t             (translation function)
 ├── translator    (TranslatorManager)
 ├── metrics       (MetricsManager / prom-client)
 ├── engine      (KythiaEngine — license system)
 ├── addonManager
 ├── interactionManager
 ├── eventManager
 ├── middlewareManager
 └── shutdownManager
```

**TypeScript definition:** `src/types/KythiaContainer.ts`

---

## Accessing the Container

The container is attached to `client.container` and is available in every interaction, event, and task via the `client` reference.

### From any interaction (commands, buttons, modals, selects)
```javascript
async execute(interaction) {
  const container = interaction.client.container;
  const { logger, models, t, kythiaConfig } = container;
}
```

### From event handlers
```javascript
// addons/myaddon/events/guildMemberAdd.js
module.exports = async (member, container) => {
  const { logger, models } = container;
  logger.info(`New member: ${member.user.tag}`);
};
```

### From tasks
```javascript
// addons/myaddon/tasks/cleanup.js
module.exports = {
  schedule: '0 0 * * *',
  async execute(container) {
    const { logger, models } = container;
  },
};
```

### From register.js
```javascript
// addons/myaddon/register.js
module.exports = async function register({ addonManager, container }) {
  const { logger } = container;
};
```

---

## Property Reference

### `client`

**Type:** `IKythiaClient` (extends `discord.js Client`)  
**Available:** From constructor  

The Discord.js client with two additional properties:
- `client.container` — the `KythiaContainer` itself (circular reference for convenience)
- `client.commands` — `Collection<string, KythiaCommandModule>` of all registered commands
- `client.cooldowns` — `Collection<string, Collection<string, number>>` of per-user cooldowns

```javascript
const { client } = container;
const guild = await client.guilds.fetch('1234567890');
```

---

### `sequelize`

**Type:** `Sequelize | undefined`  
**Available:** From `Kythia` constructor (if provided); `undefined` if no DB is configured  

Direct access to the Sequelize ORM instance. Useful for raw queries, transactions, and defining associations.

```javascript
const { sequelize } = container;

// Raw query
const [results] = await sequelize.query('SELECT COUNT(*) FROM users');

// Transaction
await sequelize.transaction(async (t) => {
  await User.create({ userId: '123' }, { transaction: t });
  await Profile.create({ userId: '123' }, { transaction: t });
});
```

> **Prefer `models.*` methods** (`getCache`, `getAllCache`, etc.) for standard CRUD — they include caching automatically.

---

### `logger`

**Type:** `KythiaLogger`  
**Available:** From constructor  

The Winston logger instance (or a custom logger if you provided one). Used for structured application logging.

```typescript
interface KythiaLogger {
  info(message: string, meta?: object): void;
  warn(message: string, meta?: object): void;
  error(message: string, meta?: object): void;
  debug(message: string, meta?: object): void;
}
```

```javascript
const { logger } = container;

logger.info('Command executed', { userId: interaction.user.id, command: 'profile' });
logger.warn('Rate limit approaching for guild', { guildId });
logger.error('Failed to fetch user data', { error: err.message });
```

> **Note:** `warn` and `error` level logs are automatically forwarded to the Discord webhook if `api.webhookErrorLogs` is set in config.

---

### `redis`

**Type:** `Redis | undefined`  
**Available:** From constructor (if provided)  

The `ioredis` client. Generally you do not need to interact with Redis directly — `KythiaModel` caching methods use it automatically. Use it for custom caching, pub/sub, or rate limiting.

```javascript
const { redis } = container;

if (redis) {
  await redis.set('custom:key', JSON.stringify({ data: 'value' }), 'EX', 300);
  const cached = await redis.get('custom:key');
}
```

---

### `kythiaConfig`

**Type:** `KythiaConfig`  
**Available:** From constructor  

The full configuration object loaded from `kythia.config.js`. See [CONFIG.md](./CONFIG.md) for the complete field reference.

```javascript
const { kythiaConfig } = container;

const botName = kythiaConfig.bot.name;
const mainGuild = kythiaConfig.bot.mainGuildId;
const isProduction = kythiaConfig.env === 'production';
const myAddonConfig = kythiaConfig.addons.myaddon;
```

---

### `helpers`

**Type:** `KythiaHelpersCollection`  
**Available:** From constructor  

Helper functions injected at bot startup. The `discord` sub-object is always present (populated from `src/utils/discord.ts`). You can add your own helpers via the `helpers` constructor parameter.

```typescript
interface KythiaHelpersCollection {
  discord: DiscordHelpers;
  [key: string]: unknown;   // your custom helpers
}
```

```javascript
const { helpers } = container;

// Built-in discord helpers
const embed = helpers.discord.createEmbed({ title: 'Hello', color: 0x5865F2 });

// Your custom helpers
const formattedCurrency = helpers.currency.format(1234.5);
```

See [Built-in Discord Helpers](#the-helpersdiscord-built-in-helpers) for the full list.

---

### `appRoot`

**Type:** `string`  
**Available:** From constructor  

Absolute path to the bot's project root directory. Equivalent to `process.cwd()` (or the value provided to `new Kythia({ appRoot }))`).

```javascript
const { appRoot } = container;

const configPath = path.join(appRoot, 'kythia.config.js');
const langDir = path.join(appRoot, 'lang');
```

---

### `engine`

**Type:** `KythiaEngine`  
**Available:** From constructor  

The internal license verification system. **Do not use directly in addon code.** It is populated automatically during `kythia.start()`.

---

### `metrics`

**Type:** `MetricsManager`  
**Available:** From constructor  

Prometheus-compatible metrics collector backed by `prom-client`.

```javascript
const { metrics } = container;

// Expose a /metrics endpoint (e.g., in an Express server in your dashboard addon)
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', metrics.getContentType());
  res.end(await metrics.getMetrics());
});
```

See [METRICS.md](./METRICS.md) for a full list of tracked metrics and Grafana query examples.

---

### `engineToken`

**Type:** `string | null`  
**Available:** After `kythia.start()` completes license validation  

The encrypted license verification token. **Internal use only — do not read or modify.**

---

### `translator`

**Type:** `ITranslatorManager`  
**Available:** After `start()` loads locale files  

The `TranslatorManager` instance. Provides lower-level locale management methods.

```javascript
const { translator } = container;

// Load additional locale files at runtime
translator.loadLocalesFromDir('./custom/lang');

// Get all loaded locales
const locales = translator.getLocales();
```

For translating strings in command responses, use `container.t` (see below) instead.

---

### `t` (Translate Function)

**Type:** `(interaction: Interaction, key: string, variables?: TranslationVars) => Promise<string>`  
**Available:** After `start()` loads locale files  

The bound translation function. This is the primary way to get localized strings in your addon.

```javascript
const { t } = container;

// Basic translation
const msg = await t(interaction, 'ping.response');

// With variable interpolation
const welcome = await t(interaction, 'welcome.message', {
  user: interaction.user.username,
  guild: interaction.guild.name,
  count: 42,
});
```

**Locale resolution order:**
1. User's Discord locale (e.g., `ja`)
2. Guild's preferred locale (if enabled)
3. `bot.language` from `kythiaConfig`
4. `en` (English fallback)

**Lang file format (`addons/myaddon/lang/en.json`):**
```json
{
  "ping": {
    "response": "Pong! 🏓",
    "latency": "Gateway latency: {{ms}}ms"
  },
  "welcome": {
    "message": "Welcome, {{user}}! You are member #{{count}} of {{guild}}."
  }
}
```

Variables are interpolated with `{{variableName}}` syntax.

---

### `models`

**Type:** `KythiaModelsCollection` (`Record<string, AnySequelizeModel>`)  
**Available:** After `bootModels()` runs during `start()` (use `addDbReadyHook` to define associations)

All Sequelize models discovered across all enabled addons. Keys are the model class name.

```javascript
const { models } = container;
const { User, GuildSetting, Streak } = models;

// Fetch with cache
const user = await User.getCache({ where: { userId: interaction.user.id } });

// Standard Sequelize operations
const allUsers = await User.findAll({ limit: 100 });
```

> **Important:** `models` is populated gradually as each addon's models are booted. Do **not** access models at the top level of a module — always access them inside `async execute()` or hook callbacks.

---

### `middlewareManager`

**Type:** `IMiddlewareManager | undefined`  
**Available:** After `start()` initializes `MiddlewareManager`  

The middleware pipeline manager. **Not typically used directly in addon code.** Command middleware is applied declaratively via command module properties (`botPermissions`, `cooldown`, etc.).

---

### `interactionManager`

**Type:** `IInteractionManager | undefined`  
**Available:** After `start()` initializes `InteractionManager`  

Routes all Discord interactions. **Internal use only.**

---

### `addonManager`

**Type:** `IAddonManager | undefined`  
**Available:** After `start()` calls `loadAddons()`

Manages all loaded addons and their handler registrations. Useful in `register.js` for registering handlers programmatically.

```javascript
// addons/myaddon/register.js
module.exports = async function register({ addonManager }) {
  addonManager.registerButtonHandler('confirm-delete', async (interaction) => {
    await interaction.reply({ content: '✅ Deleted!', ephemeral: true });
  });

  addonManager.registerTaskHandler(
    'hourly-stats',
    async (container) => { /* ... */ },
    '0 * * * *'
  );
};
```

---

### `eventManager`

**Type:** `IEventManager | undefined`  
**Available:** After `start()` initializes `EventManager`  

Routes Discord gateway events to all registered addon handlers. **Internal use only.**

---

### `shutdownManager`

**Type:** `IShutdownManager | undefined`  
**Available:** After `start()` initializes `ShutdownManager`

Manages graceful shutdown and resource cleanup.

```javascript
// Register a cleanup hook
container.shutdownManager.registerShutdownHook(async () => {
  await myExternalConnection.close();
  logger.info('External connection closed.');
});

// Get per-shard process uptime
const uptimeSecs = container.shutdownManager.getMasterUptime();
```

---

### `_degraded`

**Type:** `boolean | undefined`  
**Available:** Internally set  

Internal flag used by the license system. **Do not read or modify.** When `true`, the system is in a degraded/unlicensed state.

---

## Property Availability Timeline

| Property | Available at |
|---|---|
| `client` | Constructor |
| `kythiaConfig` | Constructor |
| `logger` | Constructor |
| `redis` | Constructor |
| `sequelize` | Constructor |
| `models` | After `bootModels()` (use `addDbReadyHook`) |
| `helpers` | Constructor |
| `appRoot` | Constructor |
| `engine` | Constructor |
| `metrics` | Constructor |
| `translator` | After addon lang files loaded |
| `t` | After translator initialized |
| `addonManager` | After `loadAddons()` |
| `eventManager` | After `EventManager.initialize()` |
| `middlewareManager` | After `MiddlewareManager` init |
| `interactionManager` | After `InteractionManager.initialize()` |
| `shutdownManager` | After `ShutdownManager.initialize()` |
| `engineToken` | After license validated |

---

## Usage Patterns

### In Commands (Slash / Context Menu)

```javascript
// addons/myaddon/commands/profile.js
const { SlashCommandBuilder } = require('discord.js');
const { BaseCommand } = require('kythia-core');

class ProfileCommand extends BaseCommand {
  slashCommand = new SlashCommandBuilder()
    .setName('profile')
    .setDescription('View your profile');

  cooldown = 3000;

  async execute(interaction) {
    const container = this.container;
    const { logger, models, t, kythiaConfig } = container;
    const { User } = models;

    const user = await User.getCache({ where: { userId: interaction.user.id } });

    if (!user) {
      const msg = await t(interaction, 'profile.not_found');
      return interaction.reply({ content: msg, ephemeral: true });
    }

    const title = await t(interaction, 'profile.title', { name: interaction.user.username });
    logger.info(`Profile viewed: ${interaction.user.tag}`);

    await interaction.reply({ content: title });
  }
}

exports.default = ProfileCommand;
```

### In Event Handlers

```javascript
// addons/myaddon/events/guildMemberAdd.js
module.exports = async (member, container) => {
  const { logger, models, t } = container;
  const { GuildSetting } = models;

  const setting = await GuildSetting.getCache({ where: { guildId: member.guild.id } });
  if (!setting?.welcomeChannelId) return;

  const channel = member.guild.channels.cache.get(setting.welcomeChannelId);
  if (!channel) return;

  logger.info(`Member joined: ${member.user.tag} in ${member.guild.name}`);
  await channel.send(`Welcome <@${member.id}>!`);
};
```

### In Button / Modal / Select Menu Handlers

```javascript
// addons/myaddon/buttons/confirm.js
module.exports = {
  customId: 'confirm-action',

  async execute(interaction) {
    const { models, logger } = interaction.client.container;
    const { Ticket } = models;

    const ticketId = interaction.customId.split(':')[1];
    await Ticket.update({ status: 'confirmed' }, { where: { id: ticketId } });

    logger.info(`Ticket ${ticketId} confirmed by ${interaction.user.tag}`);
    await interaction.reply({ content: '✅ Confirmed!', ephemeral: true });
  },
};
```

### In Tasks

```javascript
// addons/myaddon/tasks/daily-cleanup.js
const { Op } = require('sequelize');

module.exports = {
  schedule: '0 0 * * *', // Every day at midnight UTC
  taskName: 'daily-cleanup',

  async execute(container) {
    const { logger, models } = container;
    const { TempData } = models;

    const deleted = await TempData.destroy({
      where: {
        createdAt: { [Op.lt]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    });

    logger.info(`Daily cleanup: removed ${deleted} temp records`);
  },
};
```

### In register.js

```javascript
// addons/myaddon/register.js
module.exports = async function register({ addonManager, container }) {
  const { logger } = container;

  logger.info('[myaddon] Registering handlers...');

  addonManager.registerButtonHandler('confirm-delete', async (interaction) => {
    await interaction.reply({ content: '✅ Deleted!', ephemeral: true });
  });

  addonManager.registerModalHandler('feedback:', async (interaction) => {
    const text = interaction.fields.getTextInputValue('feedback-text');
    await interaction.reply({ content: `Feedback received: ${text}`, ephemeral: true });
  });
};
```

### In Hooks

```javascript
// index.js (bot entry point)
const kythia = new Kythia({ client, config, sequelize, redis });

// DB ready: define model associations
kythia.addDbReadyHook((container) => {
  const { User, Profile, Streak } = container.models;
  User.hasOne(Profile, { foreignKey: 'userId' });
  Profile.belongsTo(User, { foreignKey: 'userId' });
  User.hasMany(Streak, { foreignKey: 'userId' });
});

// Client ready: bot is logged in
kythia.addClientReadyHook(async (container) => {
  const { logger, client } = container;
  logger.info(`✅ Logged in as ${client.user.tag}`);
});

await kythia.start();
```

---

## The `t()` Translation Function

This is the most commonly used function from the container.

### Signature
```typescript
t(
  interaction: Interaction,
  key: string,
  variables?: Record<string, string | number | boolean>
): Promise<string>
```

### Key Format

Keys use dot-notation to navigate nested JSON objects:

```
'ping.response'               → { ping: { response: "Pong!" } }
'errors.permission_denied'    → { errors: { permission_denied: "..." } }
'commands.profile.title'      → { commands: { profile: { title: "..." } } }
```

### Variable Interpolation

Use `{{variableName}}` in your JSON strings:

```json
{
  "welcome": {
    "dm": "Hey {{username}}! Welcome to **{{servername}}**. You are member #{{membercount}}."
  }
}
```

```javascript
const msg = await t(interaction, 'welcome.dm', {
  username: member.user.username,
  servername: member.guild.name,
  membercount: member.guild.memberCount,
});
```

### Lang File Loading Order

1. `<kythia-core>/src/lang/en.json` — core framework strings
2. `<appRoot>/lang/en.json` — bot-level overrides
3. `addons/*/lang/en.json` — per-addon strings (loaded during addon setup)

Later files override earlier ones, allowing bot-level customization of core strings.

---

## The `helpers.discord` Built-in Helpers

The `helpers.discord` object is always present and sourced from `src/utils/discord.ts`. It provides convenience wrappers for common Discord operations that require access to `kythiaConfig`.

```javascript
const { helpers } = container;
const { discord } = helpers;
```

> Check `src/utils/discord.ts` for the full list of available helpers, as it can vary across versions.

---

## Dependency Injection vs Direct Imports

**Always use the container** inside addon code. Never import directly from `kythia-core` inside addon handler files:

```javascript
// ✅ CORRECT — use DI container
const { BaseCommand } = require('kythia-core');

class MyCommand extends BaseCommand {
  async execute(interaction) {
    const container = this.container;
    const { logger, models, t } = container;
  }
}
exports.default = MyCommand;

// ❌ INCORRECT — creates tight coupling and bypasses container
const KythiaModel = require('kythia-core/dist/database/KythiaModel');
const logger = require('kythia-core/dist/utils/logger');
```

The only place where you **should** import from `kythia-core` is your bot's **entry file** (`index.js`) and **model files**:

```javascript
// ✅ OK in index.js (entry point) and model files
const { Kythia, KythiaModel, createSequelizeInstance } = require('kythia-core');
```

---

For the complete list of all managers and their methods, see [CLASS_REFERENCE.md](./CLASS_REFERENCE.md).  
For configuration field documentation, see [CONFIG.md](./CONFIG.md).  
For addon authoring patterns, see [ADDON_GUIDE.md](./ADDON_GUIDE.md).
