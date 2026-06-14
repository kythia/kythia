# Kythia Core — Configuration Reference

> Complete reference for `kythia.config.js` — every field, its type, default value, and example — **v26.1.0**

---

## Table of Contents

- [Overview](#overview)
- [Full Template](#full-template)
- [Top-Level Fields](#top-level-fields)
- [bot Block](#bot-block)
- [db Block](#db-block)
  - [SQLite](#sqlite-example)
  - [MySQL](#mysql-example)
  - [PostgreSQL](#postgresql-example)
  - [Redis Cache](#redis-cache)
  - [Connection Pooling](#connection-pooling)
- [legal Block](#legal-block)
- [licenseKey](#licensekey)
- [sentry Block](#sentry-block)
- [owner Block](#owner-block)
- [settings Block](#settings-block)
- [emojis Block](#emojis-block)
- [addons Block](#addons-block)
  - [Per-Addon Config Reference](#per-addon-config-reference)
- [api Block](#api-block)
- [Environment Variables Pattern](#environment-variables-pattern)

---

## Overview

`kythia.config.js` is the single configuration file for your Kythia bot. It is typically placed in your project root and loaded via `require('./kythia.config.js')` in your `index.js` entry file.

```javascript
// index.js
const config = require('./kythia.config.js');
const kythia = new Kythia({ client, config, ... });
```

The config object must conform to the `KythiaConfig` TypeScript interface (`src/types/KythiaConfig.ts`).

---

## Full Template

```javascript
// kythia.config.js
require('@dotenvx/dotenvx').config(); // or require('dotenv').config()

module.exports = {
  // ── Required ─────────────────────────────────────────────────────────────
  env: process.env.NODE_ENV || 'production', // 'development' | 'production' | 'test'
  licenseKey: process.env.LICENSE_KEY,

  legal: {
    acceptTOS: true,       // REQUIRED — must be true
    dataCollection: true,  // REQUIRED — must be true
  },

  version: '1.0.0', // Your bot's version

  // ── Bot ──────────────────────────────────────────────────────────────────
  bot: {
    name: 'MyBot',
    token: process.env.DISCORD_TOKEN,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    totalShards: 'auto',
    mainGuildId: process.env.MAIN_GUILD_ID,
    devGuildId: process.env.DEV_GUILD_ID,
    color: '#5865F2',
    prefixes: ['!'],
    status: 'online',
    activityType: 3, // 0=Playing 1=Streaming 2=Listening 3=Watching 5=Competing
    activity: 'the server',
    globalCommandCooldown: 3000,
    language: 'en',
    locale: 'en-US',
    timezone: 'UTC',
  },

  // ── Database ─────────────────────────────────────────────────────────────
  db: {
    driver: 'sqlite',    // 'sqlite' | 'mysql' | 'postgres'
    name: 'kythia.sqlite',
    timezone: '+00:00',
    redis: process.env.REDIS_URL,
    redisCacheVersion: 'v1',
    useRedis: true,
  },

  // ── Owner ─────────────────────────────────────────────────────────────────
  owner: {
    ids: process.env.OWNER_IDS,   // comma-separated Discord user IDs
    names: process.env.OWNER_NAMES,
  },

  // ── Sentry Error Tracking ─────────────────────────────────────────────────
  sentry: {
    dsn: process.env.SENTRY_DSN,
  },

  // ── Addons ────────────────────────────────────────────────────────────────
  addons: {
    core: { active: true },
    economy: { active: false },
    // ... per-addon config
  },

  // ── API Integrations ──────────────────────────────────────────────────────
  api: {
    webhookGuildInviteLeave: process.env.WEBHOOK_GUILD_INVITE_LEAVE,
    webhookErrorLogs: process.env.WEBHOOK_ERROR_LOGS,
    webhookVoteLogs: process.env.WEBHOOK_VOTE_LOGS,
    topgg: {
      authToken: process.env.TOPGG_AUTH_TOKEN,
      apiKey: process.env.TOPGG_API_KEY,
    },
  },

  // ── Settings ──────────────────────────────────────────────────────────────
  settings: {
    logConsoleFilter: 'info',
    logFormat: 'simple',
    supportServer: 'https://discord.gg/your-server',
    inviteLink: 'https://discord.com/oauth2/authorize?...',
    ownerWeb: 'https://yourwebsite.com',
    kythiaWeb: 'https://kythia.my.id',
    bannerImage: 'https://yourcdn.com/banner.png',
    statusPage: '',
    webhookErrorLogs: true,
    webhookLogFilter: 'warn,error',
    webhookGuildInviteLeave: false,
    ownerSkipCooldown: true,
    // antispam thresholds (see settings block reference)
    spamThreshold: 5,
    duplicateThreshold: 3,
    mentionThreshold: 5,
    fastTimeWindow: 5000,
    duplicateTimeWindow: 10000,
    cacheExpirationTime: 30000,
    shortMessageThreshold: 10,
    punishmentCooldown: 60000,
    antiAllCapsMinLength: 10,
    antiAllCapsRatio: 0.7,
    antiEmojiMinTotal: 10,
    antiEmojiRatio: 0.5,
    antiZalgoMin: 5,
  },

  // ── Emojis ────────────────────────────────────────────────────────────────
  emojis: {
    musicPlayPause: '⏯️',
    musicPlay: '▶️',
    musicPause: '⏸️',
    musicSkip: '⏭️',
    musicStop: '⏹️',
    musicLoop: '🔁',
    musicAutoplay: '🔀',
    musicLyrics: '📜',
    musicQueue: '📋',
    musicShuffle: '🔀',
    musicFilter: '🎛️',
    musicFavorite: '❤️',
    musicBack: '⏮️',
    // your custom emojis
  },
};
```

---

## Top-Level Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `env` | `'development' \| 'production' \| 'test' \| 'local'` | ✅ | Determines command deployment target. `development` → deploy to `devGuildId`; `production` → deploy globally. |
| `licenseKey` | `string` | ✅ | Kythia license key. The bot will not start without a valid key. |
| `version` | `string` | ✅ | Your bot's semantic version string. |
| `legal` | `object` | ✅ | TOS acceptance flags — both must be `true`. |
| `bot` | `object` | ✅ | Discord bot credentials and behavior settings. |
| `db` | `object` | ✅ | Database driver and connection settings. |
| `owner` | `object` | ✅ | Owner user IDs and names. |
| `sentry` | `object` | — | Sentry error tracking configuration. |
| `addons` | `object` | — | Per-addon enable/disable and configuration. |
| `api` | `object` | — | Webhook and third-party API credentials. |
| `settings` | `object` | — | Logging, antispam, and UI settings. |
| `emojis` | `object` | — | Custom emoji strings for music and UI components. |

---

## `bot` Block

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `name` | `string` | ✅ | — | Display name of the bot |
| `token` | `string` | ✅ | — | Discord bot token |
| `clientId` | `string` | ✅ | — | Discord application client ID |
| `clientSecret` | `string` | — | — | Discord OAuth2 client secret |
| `totalShards` | `number \| 'auto'` | ✅ | `'auto'` | Total shard count; `'auto'` lets Discord decide |
| `mainGuildId` | `string` | ✅ | — | The bot's main/home guild ID |
| `devGuildId` | `string` | — | — | Dev guild for instant command deployment in `development` env |
| `color` | `string` | ✅ | — | Default embed color (hex string, e.g. `'#5865F2'`) |
| `prefixes` | `string[]` | ✅ | — | Legacy prefix array (kept for compatibility) |
| `status` | `'online' \| 'idle' \| 'dnd' \| 'invisible'` | ✅ | `'online'` | Bot presence status |
| `activityType` | `ActivityType` | ✅ | — | `0`=Playing `1`=Streaming `2`=Listening `3`=Watching `5`=Competing |
| `activity` | `string` | ✅ | — | Activity text shown in the bot's presence |
| `globalCommandCooldown` | `number` | ✅ | `3000` | Global per-user cooldown in ms (applied if command has no `cooldown`) |
| `language` | `string` | ✅ | `'en'` | Default locale fallback (BCP-47 code, e.g. `'en'`, `'ja'`, `'id'`) |
| `locale` | `string` | ✅ | `'en-US'` | Full locale code (e.g. `'en-US'`, `'ja-JP'`) |
| `timezone` | `string` | ✅ | `'UTC'` | IANA timezone string (e.g. `'Asia/Jakarta'`) |
| `hasActivityEntryPoint` | `boolean` | — | `false` | Set `true` if your app has an Activity (type-4) Entry Point command. Kythia will auto-detect and re-inject it on global deploys to avoid the Discord bulk overwrite error. |

---

## `db` Block

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `driver` | `'sqlite' \| 'mysql' \| 'postgres'` | ✅ | `'sqlite'` | Database engine |
| `name` | `string` | ✅ | `'kythiadata.sqlite'` | Database name (or SQLite filename) |
| `host` | `string` | For MySQL/PG | — | Database host |
| `port` | `number` | For MySQL/PG | — | Database port |
| `user` | `string` | For MySQL/PG | — | Database username |
| `pass` | `string` | For MySQL/PG | — | Database password |
| `storagePath` | `string` | — | — | Custom path for SQLite file |
| `socketPath` | `string` | — | — | Unix socket path (MySQL) |
| `pool` | `object` | — | — | Sequelize connection pool config |
| `pool.max` | `number` | — | `5` | Max pool connections |
| `pool.min` | `number` | — | `0` | Min pool connections |
| `pool.acquire` | `number` | — | `30000` | Max ms to acquire connection before error |
| `pool.idle` | `number` | — | `10000` | Ms a connection can sit idle before release |
| `dialectOptions` | `object` | — | — | Raw Sequelize dialect options (e.g. SSL certs) |
| `timezone` | `string` | ✅ | `'+00:00'` | Database timezone offset |
| `redis` | `string \| object` | — | — | Redis connection string or ioredis options |
| `redisCacheVersion` | `string` | ✅ | `'v1'` | Cache namespace prefix; bump to invalidate all cached data |
| `ssl` | `boolean` | — | — | Enable SSL for DB connection |
| `useRedis` | `boolean` | — | — | Explicitly enable/disable Redis caching |

### SQLite Example

```javascript
db: {
  driver: 'sqlite',
  name: 'kythia.sqlite',        // filename in project root (or storagePath)
  storagePath: './data',        // optional: store in ./data/kythia.sqlite
  timezone: '+00:00',
  redisCacheVersion: 'v1',
}
```

### MySQL Example

```javascript
db: {
  driver: 'mysql',
  name: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  pass: process.env.DB_PASS,
  timezone: '+00:00',
  redis: process.env.REDIS_URL,
  redisCacheVersion: 'v1',
  pool: {
    max: 10,
    min: 2,
    acquire: 30000,
    idle: 10000,
  },
}
```

### PostgreSQL Example

```javascript
db: {
  driver: 'postgres',
  name: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER,
  pass: process.env.DB_PASS,
  ssl: true,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  timezone: '+00:00',
  redisCacheVersion: 'v1',
}
```

### Redis Cache

The `redis` field accepts either a connection URL (string) or an `ioredis` options object:

```javascript
// Connection URL
redis: 'redis://localhost:6379'
redis: 'redis://:password@host:6379/0'

// ioredis options object
redis: {
  host: 'localhost',
  port: 6379,
  password: process.env.REDIS_PASS,
  db: 0,
  shard: true,   // Optional: enables shard-isolated cache namespacing
}
```

When `redis` is set, `KythiaModel`'s caching methods automatically use Redis as the primary cache with LRU Map as fallback.

> **Bump `redisCacheVersion`** (e.g., `'v2'`) whenever you need to invalidate all cached data across all shards — for example after a breaking schema change.

### Connection Pooling

For MySQL and PostgreSQL, connection pooling is managed by Sequelize:

```javascript
pool: {
  max: 10,      // Maximum concurrent connections
  min: 2,       // Always keep 2 connections alive
  acquire: 30000,   // Wait up to 30s for a connection
  idle: 10000,      // Release inactive connections after 10s
}
```

---

## `legal` Block

**Both fields MUST be `true` or the bot will refuse to start.**

| Field | Type | Required | Description |
|---|---|---|---|
| `acceptTOS` | `boolean` | ✅ | Accept the Kythia Terms of Service |
| `dataCollection` | `boolean` | ✅ | Accept telemetry/data collection (license heartbeat, error reporting) |

```javascript
legal: {
  acceptTOS: true,
  dataCollection: true,
},
```

> Setting either to `false` triggers `process.exit(1)` before the bot connects to Discord.

---

## `licenseKey`

| Field | Type | Required | Description |
|---|---|---|---|
| `licenseKey` | `string` | ✅ | Your Kythia license key |

```javascript
licenseKey: process.env.LICENSE_KEY,  // e.g. 'KY-XXXX-XXXX-XXXX-XXXX'
```

The license key is verified by `KythiaEngine` against the Kythia license server during boot. If verification fails (invalid key or repeated network errors), `process.exit(1)` is called.

---

## `sentry` Block

| Field | Type | Required | Description |
|---|---|---|---|
| `dsn` | `string` | — | Sentry Data Source Name URL |

```javascript
sentry: {
  dsn: process.env.SENTRY_DSN,
  // e.g. 'https://abcd1234@o123456.ingest.sentry.io/789'
},
```

If `dsn` is provided, Sentry is initialized during boot and all unhandled exceptions are automatically captured.

---

## `owner` Block

| Field | Type | Required | Description |
|---|---|---|---|
| `ids` | `string` | ✅ | Comma-separated Discord user IDs of bot owners |
| `names` | `string` | ✅ | Comma-separated display names (informational) |

```javascript
owner: {
  ids: process.env.OWNER_IDS,   // e.g. '123456789012345678,987654321098765432'
  names: 'Alice, Bob',
},
```

Owner IDs are used by the `ownerOnly` command middleware — commands with `ownerOnly: true` are only executable by users in this list.

---

## `settings` Block

General bot behavior and antispam thresholds.

### Logging & Webhooks

| Field | Type | Default | Description |
|---|---|---|---|
| `logConsoleFilter` | `string` | `'info'` | Minimum log level for console output (`'debug'`, `'info'`, `'warn'`, `'error'`) |
| `logFormat` | `string` | `'simple'` | Winston log format (`'simple'` or `'json'`) |
| `webhookErrorLogs` | `boolean` | `false` | Forward `warn`/`error` logs to Discord webhook |
| `webhookLogFilter` | `string` | `'warn,error'` | Comma-separated log levels to forward to webhook |
| `webhookGuildInviteLeave` | `boolean` | `false` | Send guild join/leave notifications to webhook |

### Links & Branding

| Field | Type | Description |
|---|---|---|
| `supportServer` | `string` | URL of your support Discord server |
| `inviteLink` | `string` | Bot invite link |
| `ownerWeb` | `string` | Owner's website URL |
| `kythiaWeb` | `string` | Kythia website URL |
| `bannerImage` | `string` | Default banner image URL |
| `voteBannerImage` | `string` | Vote page banner URL |
| `gcBannerImage` | `string` | Global chat banner URL |
| `statsBannerImage` | `string` | Stats page banner URL |
| `helpBannerImage` | `string` | Help page banner URL |
| `aboutBannerImage` | `string` | About page banner URL |
| `tempvoiceBannerImage` | `string` | Temp voice banner URL |
| `statusPage` | `string` | Status page URL |

### Permission & Cooldown

| Field | Type | Default | Description |
|---|---|---|---|
| `ownerSkipCooldown` | `boolean` | `true` | Bot owners bypass command cooldowns |

### Antispam Thresholds

| Field | Type | Default | Description |
|---|---|---|---|
| `spamThreshold` | `number` | `5` | Messages per time window before spam detection triggers |
| `duplicateThreshold` | `number` | `3` | Duplicate messages before detection triggers |
| `mentionThreshold` | `number` | `5` | @mentions per message before detection triggers |
| `fastTimeWindow` | `number` (ms) | `5000` | Time window for fast-message spam detection |
| `duplicateTimeWindow` | `number` (ms) | `10000` | Time window for duplicate message detection |
| `cacheExpirationTime` | `number` (ms) | `30000` | How long antispam tracking data is cached |
| `shortMessageThreshold` | `number` | `10` | Minimum character length to apply antispam checks |
| `punishmentCooldown` | `number` (ms) | `60000` | Minimum time between antispam actions for same user |
| `antiAllCapsMinLength` | `number` | `10` | Minimum message length to check for all-caps |
| `antiAllCapsRatio` | `number` | `0.7` | Fraction of uppercase chars (0–1) that triggers all-caps filter |
| `antiEmojiMinTotal` | `number` | `10` | Minimum total chars before emoji ratio is checked |
| `antiEmojiRatio` | `number` | `0.5` | Fraction of emojis (0–1) that triggers emoji spam filter |
| `antiZalgoMin` | `number` | `5` | Minimum zalgo characters before filter triggers |

---

## `emojis` Block

Custom emoji strings for bot UI components (especially the music player). Use standard Unicode emojis or Discord custom emoji format (`<:name:id>`).

| Field | Description |
|---|---|
| `musicPlayPause` | Play/pause toggle |
| `musicPlay` | Play button |
| `musicPause` | Pause button |
| `musicSkip` | Skip track |
| `musicStop` | Stop playback |
| `musicLoop` | Toggle loop |
| `musicAutoplay` | Toggle autoplay |
| `musicLyrics` | Show lyrics |
| `musicQueue` | Show queue |
| `musicShuffle` | Shuffle queue |
| `musicFilter` | Audio filters |
| `musicFavorite` | Add to favorites |
| `musicBack` | Previous track |

You can add any additional custom emoji keys:

```javascript
emojis: {
  musicPlay: '<:play:1234567890123456789>',
  // ... other music emojis
  
  // Custom emojis for your bot
  xp: '<:xp:1234567890>',
  coin: '🪙',
  success: '✅',
},
```

Access them in addon code via:

```javascript
const { emojis } = container.kythiaConfig;
await interaction.reply(`${emojis.success} Done!`);
```

---

## `addons` Block

Enable, disable, and configure individual addons. Every addon key corresponds to the `name` in its `addon.json`.

```javascript
addons: {
  // Disable the 'all' flag (applies config to ALL addons)
  all: { active: true },

  // Core addon (always recommended)
  core: { active: true },

  // Economy addon with custom cooldowns
  economy: {
    active: true,
    dailyCooldown: 86400000,   // 24h in ms
    begCooldown: 30000,
    lootboxCooldown: 3600000,
    workCooldown: 1800000,
    robCooldown: 86400000,
    hackCooldown: 86400000,
  },

  // Disable an addon
  nsfw: { active: false },
},
```

### Per-Addon Config Reference

#### `ai`
| Field | Type | Description |
|---|---|---|
| `active` | `boolean` | Enable/disable |
| `model` | `string` | Gemini model name (e.g. `'gemini-pro'`) |
| `geminiApiKeys` | `string` | Comma-separated Gemini API keys |
| `getMessageHistoryLength` | `number` | Message history context length |
| `perMinuteAiLimit` | `number` | Rate limit per user per minute |
| `safeCommands` | `string[]` | Command names exempt from AI processing |
| `additionalCommandKeywords` | `string[]` | Additional trigger keywords for AI |
| `personaPrompt` | `string` | System persona prompt |
| `ownerInteractionPrompt` | `string` | Special prompt for owner interactions |
| `dailyGreeter` | `boolean` | Enable daily greeting message |
| `dailyGreeterSchedule` | `string` | Cron schedule for daily greeter |
| `dailyGreeterPrompt` | `string` | Prompt for the daily greeter |
| `ownerBypassFilter` | `boolean` | Owners bypass content filters |

#### `economy`
| Field | Type | Description |
|---|---|---|
| `active` | `boolean` | Enable/disable |
| `dailyCooldown` | `number` (ms) | `/daily` command cooldown |
| `begCooldown` | `number` (ms) | `/beg` command cooldown |
| `lootboxCooldown` | `number` (ms) | Lootbox cooldown |
| `workCooldown` | `number` (ms) | `/work` command cooldown |
| `robCooldown` | `number` (ms) | `/rob` command cooldown |
| `hackCooldown` | `number` (ms) | `/hack` command cooldown |

#### `music`
| Field | Type | Description |
|---|---|---|
| `active` | `boolean` | Enable/disable |
| `defaultPlatform` | `string` | Default search platform (e.g. `'youtube'`) |
| `useAI` | `boolean` | Enable AI-powered music suggestions |
| `playlistLimit` | `number` | Max tracks to import from a playlist |
| `autocompleteLimit` | `number` | Max autocomplete results |
| `suggestionLimit` | `number` | Max track suggestions shown |
| `lavalink.hosts` | `string` | Comma-separated Lavalink hostnames |
| `lavalink.ports` | `string` | Comma-separated Lavalink ports |
| `lavalink.passwords` | `string` | Comma-separated Lavalink passwords |
| `lavalink.secures` | `string` | Comma-separated SSL flags (`'true,false'`) |
| `spotify.clientId` | `string` | Spotify API client ID |
| `spotify.clientSecret` | `string` | Spotify API client secret |
| `audd.apiKey` | `string` | Audd.io API key for song recognition |
| `artworkUrlStyle` | `'thumbnail' \| 'banner'` | Track artwork display style |

#### `dashboard`
| Field | Type | Description |
|---|---|---|
| `active` | `boolean` | Enable/disable |
| `url` | `string` | Public URL of the dashboard |
| `port` | `number` | HTTP server port |
| `sessionSecret` | `string` | Express session secret |

#### `leveling`
| Field | Type | Description |
|---|---|---|
| `active` | `boolean` | Enable/disable |
| `backgroundUrl` | `string` | Default rank card background image URL |

#### `globalchat`
| Field | Type | Description |
|---|---|---|
| `active` | `boolean` | Enable/disable |
| `apiUrl` | `string` | Global chat API base URL |
| `healthCheckSchedule` | `string` | Cron schedule for health checks |
| `healthCheckDelay` | `number` (ms) | Startup delay before first health check |
| `apiKey` | `string` | API authentication key |

#### `giveaway`
| Field | Type | Description |
|---|---|---|
| `active` | `boolean` | Enable/disable |
| `checkInterval` | `number` (ms) | Interval to check giveaway endings |

#### `pet`
| Field | Type | Description |
|---|---|---|
| `active` | `boolean` | Enable/disable |
| `useCooldown` | `number` (ms) | Pet interaction cooldown |
| `gachaCooldown` | `number` (ms) | Pet gacha cooldown |

#### `pro`
| Field | Type | Description |
|---|---|---|
| `active` | `boolean` | Enable/disable |
| `cloudflare.token` | `string` | Cloudflare API token |
| `cloudflare.zoneId` | `string` | Cloudflare zone ID |
| `cloudflare.domain` | `string` | Base domain for subdomain provisioning |
| `maxSubdomains` | `number` | Max subdomains per user |

#### `quest`
| Field | Type | Description |
|---|---|---|
| `active` | `boolean` | Enable/disable |
| `apiUrls` | `string` | Comma-separated API URLs |

#### `core`
| Field | Type | Description |
|---|---|---|
| `active` | `boolean` | Enable/disable |
| `exchangerateApi` | `string` | Exchange rate API key for currency commands |

---

## `api` Block

| Field | Type | Description |
|---|---|---|
| `webhookGuildInviteLeave` | `string` | Discord webhook URL for guild join/leave events |
| `webhookErrorLogs` | `string` | Discord webhook URL for error logs |
| `webhookVoteLogs` | `string` | Discord webhook URL for top.gg vote events |
| `topgg.authToken` | `string` | top.gg webhook authorization token |
| `topgg.apiKey` | `string` | top.gg REST API key |

```javascript
api: {
  webhookErrorLogs: process.env.WEBHOOK_ERROR_LOGS,
  webhookVoteLogs: process.env.WEBHOOK_VOTE_LOGS,
  topgg: {
    authToken: process.env.TOPGG_WEBHOOK_AUTH,
    apiKey: process.env.TOPGG_API_KEY,
  },
},
```

---

## Environment Variables Pattern

**Never hardcode secrets in `kythia.config.js`.** Use `.env` files with `@dotenvx/dotenvx` (recommended) or `dotenv`:

```env
# .env
NODE_ENV=production
LICENSE_KEY=KY-XXXX-XXXX-XXXX-XXXX

DISCORD_TOKEN=Bot_Token_Here
CLIENT_ID=123456789012345678
CLIENT_SECRET=your_client_secret

MAIN_GUILD_ID=123456789012345678
DEV_GUILD_ID=987654321098765432
OWNER_IDS=123456789012345678

DB_HOST=localhost
DB_PORT=3306
DB_NAME=kythia
DB_USER=kythia_user
DB_PASS=secure_password

REDIS_URL=redis://localhost:6379

SENTRY_DSN=https://abc@sentry.io/123

WEBHOOK_ERROR_LOGS=https://discord.com/api/webhooks/...
TOPGG_API_KEY=your_topgg_api_key
```

Load in your entry file:

```javascript
// index.js — load FIRST, before requiring anything else
require('@dotenvx/dotenvx').config();
// or: require('dotenv').config();

const config = require('./kythia.config.js');
```

---

For how to use config values inside addons, see [CONTAINER.md](./CONTAINER.md#kythiaconfig).  
For CLI commands that use config, see [CLI_REFERENCE.md](./CLI_REFERENCE.md).
