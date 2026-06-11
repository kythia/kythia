# Kythia API Documentation

> **Version:** 0.11.0-beta  
> **Author:** kenndeclouv  
> **Runtime:** Node.js / Bun  
> **Framework:** [Hono](https://hono.dev/) + Socket.IO

The **Kythia API** is an internal REST API addon that acts as the bridge between a running Kythia Discord bot instance and the Kythia Dashboard. It also exposes a Socket.IO server for real-time guild event streaming.

---

## Table of Contents

- [Overview](#overview)
- [Server Startup](#server-startup)
- [Authentication](#authentication)
- [Socket.IO Real-Time Events](#socketio-real-time-events)
- [Routes](#routes)
- [GET /](#get-)
- [GET /api/list](#get-apilist)
- [GET /api/stats](#get-apistats)
- [GET /api/metrics](#get-apimetrics)
- [GET /api/meta/stats](#get-apimetastats)
- [GET /api/meta/growth](#get-apimetagrowth)
- [GET /api/meta/commands](#get-apimetacommands)
- [GET /api/meta/changelog](#get-apimetachangelog)
- [GET /api/meta/shards](#get-apimetashards)
- [GET /api/meta/locales](#get-apimetalocales)
- [GET /api/meta/logs](#get-apimetalogs)
- [GET /api/chat/:guildId/channels](#get-apichatguildidchannels)
- [GET /api/chat/messages/:channelId](#get-apichatmessageschannelid)
- [POST /api/chat/messages/:channelId](#post-apichatmessageschannelidest)
- [POST /api/canvas/preview](#post-apicanvaspreview)
- [GET /api/guilds](#get-apiguilds)
- [GET /api/guilds/:id](#get-apiguildsid)
- [GET /api/guilds/:id/members](#get-apiguildsidmembers)
- [GET /api/guilds/settings/:guildId](#get-apiguildssettingsguildid)
- [PATCH /api/guilds/settings/:guildId](#patch-apiguildssettingsguildid)
- [PATCH /api/guilds/branding/:guildId](#patch-apiguildsbrandingguildid)
- [Ticket API (`/api/tickets`)](#ticket-api-apitickets)
- [Modmail API (`/api/modmail`)](#modmail-api-apimodmail)
  - [Threads](#modmail-threads-apimodmail)
  - [Open / Close](#modmail-actions-open--close)
  - [Staff Reply](#modmail-action-staff-reply)
  - [Internal Notes](#modmail-action-internal-note)
  - [Config](#modmail-config-apimodmailconfigsguildid)
  - [Block / Unblock](#modmail-block--unblock)
  - [Snippets](#modmail-snippets)
- [AutoReact API (`/api/autoreact`)](#autoreact-api-apiautoreact)
- [AutoReply API (`/api/autoreply`)](#autoreply-api-apiautoreply)
- [Counting API (`/api/counting`)](#counting-api-apicounting)
- [Invite API (`/api/invite`)](#invite-api-apiinvite)
  - [Invite Settings](#invite-settings-apiinvitesettingsguildid)
  - [Invite Stats / Leaderboard](#invite-stats-apiinviteguildid)
  - [Invite History](#invite-history-apiinviteguildidhistory)
  - [Invite Milestones](#invite-milestones-apiinviteguildidmilestones)
- [Reaction Roles API (`/api/reaction-roles`)](#reaction-roles-api-apireaction-roles)
- [Reaction Role Panels API (`/api/reaction-roles/panels`)](#reaction-role-panels-api-apireaction-rolespanels)
- [Birthday API (`/api/birthday`)](#birthday-api-apibirthday)
- [Tempvoice API (`/api/tempvoice`)](#tempvoice-api-apitempvoice)
- [Image API (`/api/image`)](#image-api-apiimage)
- [Booster API (`/api/booster`)](#booster-api-apibooster)
- [Welcomer API (`/api/welcome`)](#welcomer-api-apiwelcome)
- [POST /api/webhooks/topgg](#post-apiwebhookstopgg)
- [POST /api/webhooks/license-created](#post-apiwebhookslicense-created)
- [Addon Status API (`/api/addons`)](#addon-status-api-apiaddons)
- [Social Alerts API (`/api/social-alerts`)](#social-alerts-api-apisocial-alerts)
- [Pro API (`/api/pro`)](#pro-api-apipro)
  - [Subdomains (`/api/pro/subdomains`)](#subdomains-apiprosubdomains)
  - [DNS Records (`/api/pro/dns`)](#dns-records-apiprodns)
  - [Monitors (`/api/pro/monitors`)](#monitors-apipromonitors)
- [Quest API (`/api/quest`)](#quest-api-apiquest)
  - [Quest Configs (`/api/quest/configs`)](#quest-configs-apiquestconfigs)
  - [Quest Guild Logs (`/api/quest/logs`)](#quest-guild-logs-apiquestlogs)
- [Giveaway API (`/api/giveaway`)](#giveaway-api-apigiveaway)
  - [Giveaway Actions](#giveaway-actions)
  - [Giveaway List / Get](#giveaway-list--get)
  - [Participants Sub-resource](#participants-sub-resource)
  - [Customization & CRUD](#customization--crud)
- [Sticky API (`/api/sticky`)](#sticky-api-apisticky)
- [Embed Builder API (`/api/embed-builder`)](#embed-builder-api-apiembed-builder)
  - [List / Get](#embed-builder-list--get)
  - [Create / Update / Delete](#embed-builder-create--update--delete)
  - [Send to Discord](#embed-builder-send--resend)
- [AI Settings API (`/api/ai`)](#ai-settings-api-apiai)
  - [Facts (`/api/ai/facts/:userId`)](#facts-apiaifactsuserid)
  - [Personality (`/api/ai/personality/:userId`)](#personality-apiaipersonalityuserid)
- [Leveling API (`/api/leveling`)](#leveling-api-apileveling)
  - [Get / Update Settings](#get-apilevelingguildidsettings)
  - [Leaderboard](#get-apilevelingguildid)
  - [Single User Profile](#get-apilevelingguildididuserid)
  - [Create User Entry](#post-apilevelingguildididuserid)
  - [Update (set/add level or xp)](#patch-apilevelingguildididuserid)
  - [Delete User Entry](#delete-apilevelingguildididuserid)
  - [Reset Guild Leaderboard](#delete-apilevelingguildid)
- [Streak API (`/api/streak`)](#streak-api-apistreak)
  - [Leaderboard](#get-apistreakguildid)
  - [Single User Profile](#get-apistreakguildididuserid)
  - [Create Streak Entry](#post-apistreakguildididuserid)
  - [Update (claim/reset/set/freeze)](#patch-apistreakguildididuserid)
  - [Delete Streak Entry](#delete-apistreakguildididuserid)
  - [Wipe Guild Streaks](#delete-apistreakguildid)
- [Activity API (`/api/activity`)](#activity-api-apiactivity)
  - [Toggle Activity Tracking](#patch-apiacitivityguildidtoggle)
  - [Leaderboard](#get-apiactivityguildid)
  - [Single User Stats](#get-apiactivityguildididuserid)
  - [Reset User Stats](#delete-apiactivityguildididuserid)
  - [Reset Guild Stats](#delete-apiactivityguildid)
- [Music API (`/api/music`)](#music-api-apimusic)
  - [Search Tracks](#get-apimusicsearch)
  - [Playlists](#playlists)
  - [Playlist Tracks](#playlist-tracks)
  - [Favorites](#favorites)
  - [24/7 Mode](#247-mode)
- [Automod API (`/api/automod`)](#automod-api-apiautomod)
  - [Get Settings](#get-apiautomodguildid)
  - [Update Settings](#patch-apiautomodguildid)
  - [Badwords](#badwords)
  - [Whitelist](#whitelist)
  - [Ignored Channels](#ignored-channels)
  - [Mod Logs](#mod-logs)
  - [AntiNuke](#antinuke)
    - [Get AntiNuke Config](#get-apiautomodguildidantinuke)
    - [Replace AntiNuke Config](#put-apiautomodguildidantinuke)
    - [Toggle AntiNuke](#patch-apiautomodguildidantinuketoggle)
    - [Set Log Channel](#patch-apiautomodguildidantinukelog-channel)
    - [Modules](#antinuke-modules)
    - [Whitelist](#antinuke-whitelist)
- [Verification API (`/api/verification`)](#verification-api-apiverification)
  - [Get Config](#get-apiverificationguildid)
  - [Replace Config](#put-apiverificationguildid)
  - [Toggle System](#patch-apiverificationguildidtoggle)
  - [Configuration Endpoints](#verification-configuration-endpoints)
  - [Member Action Endpoints](#member-action-endpoints)
- [Global Chat API (`/api/globalchat`)](#global-chat-api-apiglobalchat)
  - [List Guilds](#get-apiglobalchatlist)
  - [Get Single Guild](#get-apiglobalchatguildid)
  - [Register/Update Guild](#post-apiglobalchatadd)
  - [Remove Guild](#delete-apiglobalchatremoveguildid)
  - [Update Webhook](#patch-apiglobalchatguildidwebhook)
- [Music WebSocket API](#music-websocket-api)
  - [Overview](#music-ws-overview)
  - [Connecting & Joining a Guild Room](#connecting--joining-a-guild-room)
  - [Server → Client: `player_update`](#server--client-player_update)
    - [Event Types](#event-types)
    - [Full Payload Schema](#full-payload-schema)
    - [Track Object Schema](#track-object-schema)
    - [Queue Item Schema](#queue-item-schema)
    - [Status Values](#status-values)
    - [Per-Event Payload Examples](#per-event-payload-examples)
  - [Ticker Mechanism](#ticker-mechanism)
  - [Player Lifecycle & Event Flow](#player-lifecycle--event-flow)
  - [Button Custom IDs Reference](#button-custom-ids-reference)
  - [Guild State (In-Memory)](#guild-state-in-memory)
  - [Integration Example (Dashboard)](#integration-example-dashboard)
- [Backup API (`/api/backup`)](#backup-api-apibackup)
- [Owner API (`/api/owner`)](#owner-api-apiowner)
  - [Maintenance](#maintenance-apionwermaintenance)
  - [Flush Redis](#flush-redis-apiownerflush)
  - [Servers](#servers-apiownerservers)
  - [Mass Leave](#mass-leave-apiownermass-leave)
  - [Blacklist — Guilds](#blacklist--guilds-apiownerblacklistguilds)
  - [Blacklist — Users](#blacklist--users-apiownerblacklistusers)
  - [Premium](#premium-apiownerpremium)
  - [Team](#team-apiownerteam)
  - [Presence](#presence-apiownerpresence)
  - [Chat (DM as bot)](#chat-dm-as-bot-apiownerchat)
  - [Setup Wizard](#setup-wizard-apiownersetup)
  - [Live Config Patcher](#live-config-patcher-apiownerconfig)
  - [Restart](#restart-apiownerrestart)
    - [Check Schedule](#get-apiownerrestart)
    - [Cancel Schedule](#delete-apiownerrestart)
    - [Trigger Restart](#post-apiownerrestart)
  - [Global Profile](#global-profile-apiownerprofile)
- [Economy API (`/api/economy`)](#economy-api-apieconomy)
  - [Pool Status](#pool-status-apieconomypool)
  - [Global Stats](#global-stats-apieconomystats)
  - [Leaderboard](#leaderboard-apieconomyleaderboard)
  - [User Portfolio](#user-portfolio-apieconomyusersuserid)
  - [Market Transactions](#market-transactions-apieconomymarkettransactions)
  - [Trading Chart Data](#trading-chart-data-apieconomychart)
- [Error Reference](#error-reference)

---

### Rate Limiting

The API implements a global rate limit of **60 requests per minute per IP**.

If you exceed this limit, the server will return a `429 Too Many Requests` status:

```json
{
  "success": false,
  "error": "Too many requests, please try again later."
}
```

---

## Overview

The API server is only started on **Shard 0** to avoid port conflicts when the bot is running in sharded mode. All other shards skip initialization silently.

All routes under `/api/*` (except `/api/webhooks/*`) require a bearer token. The webhooks routes use their own dedicated authentication mechanisms.

**Base URL:** `http://localhost:{PORT}` (default port: `3000`)

---

## Server Startup

The API server is registered as a Kythia addon via `register.js`, which calls `server.js` during bot initialization. Route files are loaded dynamically from the `routes/` directory.

**Route loading rules:**

- Files named `index.js` map to the directory path (e.g., `routes/guilds/index.js` → `/api/guilds`)
- All other `.js` files map to their filename (e.g., `routes/chat.js` → `/api/chat`)
- Files prefixed with `_` are skipped
- Subdirectories create nested URL prefixes (e.g., `routes/guilds/settings.js` → `/api/guilds/settings`)

---

## Authentication

### Protected Routes (`/api/*`)

All routes under `/api/*` **except** `/api/webhooks/*` require the following header:

| Header          | Value                 |
| --------------- | --------------------- |
| `Authorization` | `Bearer <API_SECRET>` |

The `API_SECRET` is read from `kythiaConfig.addons.api.secret` or the `API_SECRET` environment variable.

**Unauthorized response:**

```json
HTTP 401
{ "message": "Unauthorized: Invalid Token" }
```

### Feature Gating & User Identification

For state-mutating requests (POST, PATCH, PUT, DELETE) that correspond to premium or vote-locked commands, the dashboard must identify the acting user using the `X-User-Id` header.

| Header | Value | Description |
| --- | --- | --- |
| `X-User-Id` | `<discord_user_id>` | The Discord ID of the user performing the action on the dashboard. |

The API uses this ID to check Redis cache for the user's Premium Tier and Top.gg voting status. **Bot owners and team members automatically bypass these locks.**

If the user fails the authorization check, the API returns a structured HTTP 403 response:

**Vote Locked Response:**
```json
HTTP 403 Forbidden
{
  "status": "error",
  "error": "Top.gg Vote Required",
  "code": "VOTE_LOCKED"
}
```

**Premium Locked Response:**
```json
HTTP 403 Forbidden
{
  "status": "error",
  "error": "Premium Required: powerful",
  "code": "PREMIUM_LOCKED",
  "requiredTier": "powerful"
}
```

### Webhook Routes (`/api/webhooks/*`)

Webhook endpoints use their own auth tokens (see per-route docs below). They are intentionally excluded from the global auth middleware so that external services (e.g. Top.gg) can call them.

---

## Socket.IO Real-Time Events

The API server embeds a **Socket.IO** server on the same HTTP port. The dashboard connects to this to receive real-time guild updates.

**CORS:** All origins are allowed (`*`) for `GET` and `POST` methods.

### Connection

```js
const socket = io("http://localhost:3000");
```

### Client → Server Events

| Event        | Payload           | Description                                                           |
| ------------ | ----------------- | --------------------------------------------------------------------- |
| `join_guild` | `guildId: string` | Joins a guild-specific room to receive guild-scoped real-time events. |

### Server → Client Events

| Event           | Emitted by     | Description                                                                                                  |
| --------------- | -------------- | ------------------------------------------------------------------------------------------------------------ |
| `player_update` | `MusicManager` | Real-time music player state update. See [Music WebSocket API](#music-websocket-api) for full documentation. |

All events are scoped to a guild room. Emit `join_guild` first to subscribe.

---

## Routes

---

### `GET /`

Health check. Returns the API status and detected runtime.

**Authentication:** None required.

**Response:**

```json
{
  "message": "Kythia API is running! 🚀",
  "runtime": "Bun"
}
```

| Field     | Type     | Description            |
| --------- | -------- | ---------------------- |
| `message` | `string` | Status message         |
| `runtime` | `string` | `"Bun"` or `"Node.js"` |

---

### `GET /api/list`

Returns a sorted list of all registered HTTP routes on the server.

**Authentication:** Bearer token required.

**Response:**

```json
{
  "success": true,
  "count": 18,
  "routes": [
    { "method": "GET", "path": "/api/chat/:guildId/channels" },
    { "method": "POST", "path": "/api/canvas/preview" }
  ]
}
```

| Field     | Type      | Description                               |
| --------- | --------- | ----------------------------------------- |
| `success` | `boolean` | Always `true`                             |
| `count`   | `number`  | Total number of registered routes         |
| `routes`  | `array`   | Sorted list of `{ method, path }` objects |

> Routes with method `ALL` are excluded from the list.

---

### `GET /api/stats`

Returns real-time bot statistics from the running Discord client.

**Authentication:** Bearer token required.

**Response:**

```json
{
  "ping": 42,
  "uptime": 3600000,
  "guilds": 150,
  "users": 4200,
  "ram_usage": "128.45 MB"
}
```

| Field       | Type     | Description                                       |
| ----------- | -------- | ------------------------------------------------- |
| `ping`      | `number` | WebSocket heartbeat latency in milliseconds       |
| `uptime`    | `number` | Bot uptime in milliseconds since last ready event |
| `guilds`    | `number` | Number of guilds in the bot's cache               |
| `users`     | `number` | Number of users in the bot's cache                |
| `ram_usage` | `string` | Current RSS memory usage formatted as `"X.XX MB"` |

---

### `GET /api/metrics`

Returns raw Prometheus-compatible metrics from the bot's internal metrics collector.

**Authentication:** Bearer token required.

**Query Parameters:**

| Parameter | Type     | Default | Description                                                                           |
| --------- | -------- | ------- | ------------------------------------------------------------------------------------- |
| `format`  | `string` | `none`  | Optional format. Set to `json` to receive JSON formatted metrics instead of raw text. |

**Response (Default):** Raw text in Prometheus exposition format (Content-Type depends on the metrics library).
**Response (format=json):** JSON object containing Prometheus metrics.

**Error (503):** If the metrics collector is not available:

```
Metrics unavailable
```

---

### `GET /api/meta/stats`

Returns aggregate statistics combining data from all cached guilds.

**Authentication:** Bearer token required.

**Response:**

```json
{
  "totalServers": 150,
  "totalMembers": 48200,
  "uptime": 3600000,
  "ping": 42,
  "ram_usage": "128.45 MB"
}
```

| Field          | Type     | Description                                       |
| -------------- | -------- | ------------------------------------------------- |
| `totalServers` | `number` | Total number of guilds the bot is in              |
| `totalMembers` | `number` | Sum of `memberCount` across all cached guilds     |
| `uptime`       | `number` | Bot uptime in milliseconds                        |
| `ping`         | `number` | WebSocket latency in milliseconds                 |
| `ram_usage`    | `string` | Current RSS memory usage formatted as `"X.XX MB"` |

---

### `GET /api/meta/growth`

Returns historical bot growth statistics (guild joins, leaves, and total servers count) over a specified time period. Perfect for rendering growth charts on the dashboard.

**Authentication:** Bearer token required.

**Query Parameters:**

| Parameter     | Type     | Default | Description                                                        |
| ------------- | -------- | ------- | ------------------------------------------------------------------ |
| `days`        | `number` | `30`    | Number of past days of history to retrieve (Min: `1`, Max: `365`). |
| `granularity` | `string` | `"day"` | The bucket time size. Can be `"day"`, `"week"`, or `"month"`.      |

**Response:**

```json
{
  "success": true,
  "period": {
    "from": "2026-04-24",
    "to": "2026-05-24",
    "days": 30,
    "granularity": "day"
  },
  "current": {
    "totalGuilds": 1247
  },
  "summary": {
    "totalJoins": 87,
    "totalLeaves": 12,
    "netGrowth": 75
  },
  "chart": [
    {
      "date": "2026-04-24",
      "joins": 3,
      "leaves": 1,
      "net": 2,
      "totalGuilds": 1230
    }
  ]
}
```

| Field                 | Type      | Description                                               |
| --------------------- | --------- | --------------------------------------------------------- |
| `success`             | `boolean` | Always `true` on success                                  |
| `period.from`         | `string`  | The start date of the period queried (YYYY-MM-DD)         |
| `period.to`           | `string`  | The end date of the period queried (YYYY-MM-DD)           |
| `period.days`         | `number`  | Number of days queried                                    |
| `period.granularity`  | `string`  | Time bucket size used                                     |
| `current.totalGuilds` | `number`  | The live server count across all shards                   |
| `summary.totalJoins`  | `number`  | Total guild joins during this period                      |
| `summary.totalLeaves` | `number`  | Total guild leaves during this period                     |
| `summary.netGrowth`   | `number`  | Net server count change during this period                |
| `chart`               | `array`   | Time-series data points grouped by granularity            |
| `chart[].date`        | `string`  | Bucket identifier (YYYY-MM-DD or YYYY-MM)                 |
| `chart[].joins`       | `number`  | Joins in this bucket                                      |
| `chart[].leaves`      | `number`  | Leaves in this bucket                                     |
| `chart[].net`         | `number`  | Net growth in this bucket                                 |
| `chart[].totalGuilds` | `number`  | Latest recorded running total server count in this bucket |

---

### `GET /api/meta/commands`

Returns a structured list of all publicly visible slash commands and context menu commands registered on the bot, organized by category with full option/subcommand metadata.

**Authentication:** Bearer token required.

**Response:**

```json
{
  "commands": [
    {
      "name": "adventure",
      "description": "Start an adventure!",
      "category": "adventure",
      "options": [],
      "subcommands": [
        {
          "name": "start",
          "description": "Start a new adventure",
          "options": [
            {
              "name": "type",
              "description": "Adventure type",
              "type": "Text",
              "required": true,
              "choices": "`forest` (`forest`), `dungeon` (`dungeon`)"
            }
          ],
          "aliases": [],
          "premiumLocked": false,
          "voteLocked": true
        }
      ],
      "aliases": [],
      "type": "slash",
      "isContextMenu": false,
      "premiumLocked": "powerful",
      "voteLocked": false
    },
    {
      "name": "Report Message",
      "description": "Right-click on a message to use this command.",
      "category": "moderation",
      "options": [],
      "subcommands": [],
      "aliases": [],
      "type": "message",
      "isContextMenu": true,
      "premiumLocked": false,
      "voteLocked": false
    }
  ],
  "categories": ["adventure", "moderation", "utility"],
  "totalCommands": 57
}
```

#### Command Object

| Field           | Type       | Description                                      |
| --------------- | ---------- | ------------------------------------------------ | -------------------------------------------------------------- |
| `name`          | `string`   | Command name                                     |
| `description`   | `string`   | Human-readable description                       |
| `category`      | `string`   | Category derived from the addon/folder structure |
| `options`       | `array`    | Top-level options (non-subcommand)               |
| `subcommands`   | `array`    | Subcommands and subcommand-group entries         |
| `aliases`       | `array`    | Prefix command aliases, if any                   |
| `type`          | `string`   | `"slash"`, `"user"`, or `"message"`              |
| `isContextMenu` | `boolean`  | Whether this is a context menu command           |
| `premiumLocked` | `string \\ | boolean`                                         | The required premium tier (`"cute"`, `"powerful"`), or `false` |
| `voteLocked`    | `boolean`  | Whether the command requires Top.gg voting       |

#### Option Object

| Field         | Type             | Description                                                                                                                          |
| ------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `name`        | `string`         | Option name                                                                                                                          |
| `description` | `string`         | Option description                                                                                                                   |
| `type`        | `string`         | Human-readable type: `"Text"`, `"Integer"`, `"Number"`, `"True/False"`, `"User"`, `"Channel"`, `"Role"`, `"Mention"`, `"Attachment"` |
| `required`    | `boolean`        | Whether the option is required                                                                                                       |
| `choices`     | `string \| null` | Formatted choices string, e.g. `` `name` (`value`) `` separated by commas                                                            |

> Commands marked `ownerOnly: true` are excluded. Commands with empty or placeholder descriptions are also excluded.

---

### `GET /api/meta/changelog`

Reads and parses `changelog.md` from the bot's **working directory** (`process.cwd()`), returning structured version entries.

**Authentication:** Bearer token required.

**Response:**

```json
[
  {
    "version": "0.11.0-beta",
    "date": "2025-01-15",
    "html": "<h2>What's New</h2><ul><li>Added canvas preview endpoint</li></ul>"
  }
]
```

| Field     | Type     | Description                                       |
| --------- | -------- | ------------------------------------------------- |
| `version` | `string` | Version string parsed from the changelog header   |
| `date`    | `string` | Release date in `YYYY-MM-DD` format               |
| `html`    | `string` | Full changelog body rendered as HTML via `marked` |

**Error (404):** If `changelog.md` does not exist:

```json
{ "error": "Changelog not found: Error: ENOENT: no such file or directory" }
```

#### Changelog Format

The parser expects entries in one of these header formats:

```markdown
## [0.11.0-beta](https://github.com/...) (2025-01-15)

## 0.11.0-beta (2025-01-15)
```

---

### `GET /api/meta/shards`

Returns detailed statistics and information about each individual shard.

**Authentication:** Bearer token required.

**Response:**

```json
{
  "shards": [
    {
      "id": 0,
      "ping": 42,
      "guilds": 150,
      "members": 48200,
      "uptime": 3600000,
      "ram_usage": 134689280
    }
  ],
  "totalShards": 1
}
```

| Field                | Type     | Description                                        |
| -------------------- | -------- | -------------------------------------------------- |
| `shards[].id`        | `number` | Shard ID                                           |
| `shards[].ping`      | `number` | WebSocket latency in milliseconds                  |
| `shards[].guilds`    | `number` | Number of guilds handled by this shard             |
| `shards[].members`   | `number` | Total member count across all guilds on this shard |
| `shards[].uptime`    | `number` | Uptime of the shard process in milliseconds        |
| `shards[].ram_usage` | `number` | Current RSS memory usage in bytes                  |
| `totalShards`        | `number` | Total number of shards                             |

---

### `GET /api/meta/locales`

Returns an array of objects containing all loaded Discord locales with their keys and human-readable names.

**Authentication:** Bearer token required.

**Response:**

```json
{
  "success": true,
  "count": 1,
  "locales": [
    {
      "locale": "en-US",
      "name": "EnglishUS"
    }
  ]
}
```

| Field              | Type      | Description                                         |
| ------------------ | --------- | --------------------------------------------------- |
| `success`          | `boolean` | Always `true` on success                            |
| `count`            | `number`  | Total number of returned locales                    |
| `locales[].locale` | `string`  | The Discord locale identifier key (e.g., `"en-US"`) |
| `locales[].name`   | `string`  | Human-readable name (e.g., `"EnglishUS"`)           |

---

### `GET /api/meta/logs`

Returns parsed logs from the latest active log file, ordered newest first.

**Authentication:** Bearer token required.

**Query Parameters:**

| Parameter | Type     | Default | Description                                                                    |
| --------- | -------- | ------- | ------------------------------------------------------------------------------ |
| `level`   | `string` | none    | Optional filter. Supports comma-separated multiple levels (e.g. `warn,error`). |
| `limit`   | `number` | `100`   | Optional limit for log entries to retrieve. Max: 1000.                         |

**Response:**

```json
{
  "success": true,
  "count": 1,
  "logs": [
    {
      "level": "warn",
      "message": "TOPGG_API_KEY is not set. Top.gg auto-posting is disabled.",
      "timestamp": "2026-05-04T10:48:35.447Z",
      "label": "core"
    }
  ]
}
```

| Field              | Type      | Description                              |
| ------------------ | --------- | ---------------------------------------- |
| `success`          | `boolean` | Always `true` on success                 |
| `count`            | `number`  | Number of returned logs                  |
| `logs`             | `array`   | Array of log entry objects               |
| `logs[].level`     | `string`  | Log level (e.g. `info`, `warn`, `error`) |
| `logs[].message`   | `string`  | The log message                          |
| `logs[].timestamp` | `string`  | ISO timestamp of the log entry           |
| `logs[].label`     | `string`  | Optional tag denoting the origin module  |

---

### `GET /api/chat/:guildId/channels`

Returns all **text channels** the bot can view in the specified guild, grouped by their parent category. Channels without a category are placed in a `"WITHOUT CATEGORY"` group at the end.

**Authentication:** Bearer token required.

**Path Parameters:**

| Parameter | Type     | Description                   |
| --------- | -------- | ----------------------------- |
| `guildId` | `string` | The Discord guild (server) ID |

**Response:**

```json
[
  {
    "id": "111111111111111111",
    "name": "GENERAL",
    "channels": [
      { "id": "222222222222222222", "name": "general" },
      { "id": "333333333333333333", "name": "announcements" }
    ]
  },
  {
    "id": "no-category",
    "name": "WITHOUT CATEGORY",
    "channels": [{ "id": "444444444444444444", "name": "bot-commands" }]
  }
]
```

Each category object:

| Field      | Type     | Description                                                      |
| ---------- | -------- | ---------------------------------------------------------------- |
| `id`       | `string` | Category channel ID, or `"no-category"` for uncategorized        |
| `name`     | `string` | Category name in UPPERCASE                                       |
| `channels` | `array`  | List of `{ id, name }` text channel objects within this category |

**Filtering:** Only `GuildText` channels that the bot has `ViewChannel` permission for are included. Categories with no visible text channels are omitted.

**Errors:**

| Status | Body                             | Condition                       |
| ------ | -------------------------------- | ------------------------------- |
| `404`  | `{ "error": "Guild not found" }` | Guild is not in the bot's cache |
| `500`  | `{ "error": "..." }`             | Internal fetch error            |

---

### `GET /api/chat/messages/:channelId`

Fetches recent messages from a text channel and returns them formatted with Discord markdown parsed into HTML.

**Authentication:** Bearer token required.

**Path Parameters:**

| Parameter   | Type     | Description            |
| ----------- | -------- | ---------------------- |
| `channelId` | `string` | The Discord channel ID |

**Query Parameters:**

| Parameter | Type     | Default | Description                                           |
| --------- | -------- | ------- | ----------------------------------------------------- |
| `limit`   | `number` | `50`    | Number of messages to fetch (max 100 per Discord API) |

**Response:** (array, returned in chronological order — oldest first)

```json
[
  {
    "id": "999999999999999999",
    "content": "<strong>Hello!</strong> Check out <span class=\"mention\">#general</span>",
    "author": {
      "username": "kenndeclouv",
      "avatar": "https://cdn.discordapp.com/avatars/.../avatar.png",
      "bot": false
    },
    "timestamp": "2025-01-15T08:30:00.000Z",
    "embeds": [],
    "attachments": ["https://cdn.discordapp.com/attachments/..."]
  }
]
```

| Field             | Type      | Description                                              |
| ----------------- | --------- | -------------------------------------------------------- |
| `id`              | `string`  | Discord message snowflake ID                             |
| `content`         | `string`  | Message text parsed via `parseDiscordMarkdown` into HTML |
| `author.username` | `string`  | Author's username                                        |
| `author.avatar`   | `string`  | Author's avatar CDN URL                                  |
| `author.bot`      | `boolean` | Whether the author is a bot                              |
| `timestamp`       | `string`  | ISO 8601 creation timestamp                              |
| `embeds`          | `array`   | Raw Discord embed objects                                |
| `attachments`     | `array`   | Array of attachment CDN URLs                             |

#### Discord Markdown → HTML Conversions

The `parseDiscordMarkdown` helper converts the following:

| Input                       | Output                                                             |
| --------------------------- | ------------------------------------------------------------------ |
| `**bold**`                  | `<strong>bold</strong>`                                            |
| `*italic*` or `_italic_`    | `<em>italic</em>`                                                  |
| `***bold italic***`         | `<strong><em>bold italic</em></strong>`                            |
| `__underline__`             | `<u>underline</u>`                                                 |
| `~~strikethrough~~`         | `<s>strikethrough</s>`                                             |
| `` `inline code` ``         | `<code>inline code</code>`                                         |
| `\|\|spoiler\|\|`           | `<span class="spoiler">spoiler</span>`                             |
| ` ``` code block ``` `      | `<pre class="discord-codeblock"><code>...</code></pre>`            |
| `> quote`                   | `<blockquote>quote</blockquote>`                                   |
| `# H1` / `## H2` / `### H3` | `<h2>` / `<h3>` / `<h4>`                                           |
| `[text](url)`               | `<a href="url">text</a>`                                           |
| `<@userId>`                 | `<span class="mention">@displayName</span>`                        |
| `<#channelId>`              | `<span class="mention">#channel-name</span>`                       |
| `<@&roleId>`                | `<span class="mention" style="color: #roleColor">@roleName</span>` |
| `<:name:id>`                | `<img class="emoji" src="...png">`                                 |
| `<a:name:id>`               | `<img class="emoji" src="...gif">`                                 |
| `<t:timestamp:flag>`        | `<span class="timestamp-tag" data-timestamp="...">`                |

**Errors:**

| Status | Body                                      | Condition                      |
| ------ | ----------------------------------------- | ------------------------------ |
| `403`  | `{ "error": "Missing Permissions" }`      | Bot lacks `ReadMessageHistory` |
| `500`  | `{ "error": "Failed to fetch messages" }` | Fetch error                    |

---

### `POST /api/chat/messages/:channelId`

Sends a message to the specified channel as the bot.

**Authentication:** Bearer token required.

**Path Parameters:**

| Parameter   | Type     | Description                                   |
| ----------- | -------- | --------------------------------------------- |
| `channelId` | `string` | The Discord channel ID to send the message to |

**Request Body:**

```json
{
  "message": "Hello from the dashboard!"
}
```

| Field     | Type     | Required | Description                 |
| --------- | -------- | -------- | --------------------------- |
| `message` | `string` | Yes      | The message content to send |

**Response (success):**

```json
{ "success": true }
```

**Error (500):**

```json
{ "error": "Failed to send" }
```

---

### `POST /api/canvas/preview`

Generates a **welcome banner image preview** using `kythia-arts`, substituting placeholder data for a real user. Returns the rendered image as a base64-encoded data URI.

**Authentication:** Bearer token required.

**Request Body:**

The body accepts a range of prefixed configuration fields. The `type` field determines the prefix used (`"In"` → `welcomeIn`, `"Out"` → `welcomeOut`). All fields are optional.

```json
{
  "type": "In",

  "welcomeInBannerWidth": 800,
  "welcomeInBannerHeight": 250,

  "welcomeInBackgroundUrl": "https://example.com/bg.png",
  "welcomeInOverlayColor": "#000000",

  "welcomeInAvatarEnabled": true,
  "welcomeInAvatarSize": 100,
  "welcomeInAvatarYOffset": 0,

  "welcomeInAvatarBorderWidth": 4,
  "welcomeInAvatarBorderColor": "#ffffff",

  "welcomeInMainTextContent": "Welcome, {username}!",
  "welcomeInMainTextColor": "#ffffff",
  "welcomeInMainTextFontFamily": "Arial",
  "welcomeInMainTextFontWeight": "bold",
  "welcomeInMainTextYOffset": 0,

  "welcomeInSubTextColor": "#cccccc",

  "welcomeInShadowColor": "#000000"
}
```

#### Request Fields

| Field                             | Type      | Description                                                |
| --------------------------------- | --------- | ---------------------------------------------------------- |
| `type`                            | `string`  | `"In"` (welcome) or `"Out"` (farewell). Defaults to `"In"` |
| `welcome{Type}BannerWidth`        | `integer` | Canvas width in pixels                                     |
| `welcome{Type}BannerHeight`       | `integer` | Canvas height in pixels                                    |
| `welcome{Type}BackgroundUrl`      | `string`  | URL of the background image                                |
| `welcome{Type}OverlayColor`       | `string`  | HEX color for a color overlay on the background            |
| `welcome{Type}AvatarEnabled`      | `boolean` | Set to `false` to hide the avatar                          |
| `welcome{Type}AvatarSize`         | `integer` | Avatar diameter in pixels                                  |
| `welcome{Type}AvatarYOffset`      | `integer` | Avatar vertical offset in pixels                           |
| `welcome{Type}AvatarBorderWidth`  | `integer` | Avatar border width in pixels                              |
| `welcome{Type}AvatarBorderColor`  | `string`  | HEX color for the avatar border                            |
| `welcome{Type}MainTextContent`    | `string`  | Main text with template variables (see below)              |
| `welcome{Type}MainTextColor`      | `string`  | HEX color for main text                                    |
| `welcome{Type}MainTextFontFamily` | `string`  | Font family name                                           |
| `welcome{Type}MainTextFontWeight` | `string`  | Font weight (e.g. `"bold"`, `"normal"`)                    |
| `welcome{Type}MainTextYOffset`    | `integer` | Main text vertical offset in pixels                        |
| `welcome{Type}SubTextColor`       | `string`  | HEX color for the username sub-text                        |
| `welcome{Type}ShadowColor`        | `string`  | Enables text shadow when set (any truthy value)            |

#### Template Variables in `MainTextContent`

| Variable      | Preview Replacement  |
| ------------- | -------------------- |
| `{username}`  | `Kythia User`        |
| `{tag}`       | `Kythia#0000`        |
| `{userId}`    | `123456789012345678` |
| `{guildName}` | `Kythia Universe`    |
| `{members}`   | `1,337`              |
| `{mention}`   | `@Kythia User`       |

Variables are replaced case-insensitively.

**Response (success):**

```json
{
  "success": true,
  "image": "data:image/png;base64,iVBORw0KGgoAAAANS..."
}
```

| Field     | Type      | Description                              |
| --------- | --------- | ---------------------------------------- |
| `success` | `boolean` | `true` on success                        |
| `image`   | `string`  | Full data URI of the generated PNG image |

**Error (500):**

```json
{
  "success": false,
  "message": "Failed to generate preview",
  "error": "Error message detail"
}
```

---

### `GET /api/guilds`

Returns a summary list of all guilds the bot is currently in (from cache).

**Authentication:** Bearer token required.

**Response:**

```json
[
  {
    "id": "123456789012345678",
    "name": "Kythia Universe",
    "icon": "https://cdn.discordapp.com/icons/123.../icon.png",
    "memberCount": 1337,
    "ownerId": "987654321098765432"
  }
]
```

| Field         | Type             | Description                              |
| ------------- | ---------------- | ---------------------------------------- |
| `id`          | `string`         | Guild snowflake ID                       |
| `name`        | `string`         | Guild name                               |
| `icon`        | `string \| null` | Guild icon CDN URL, or `null` if no icon |
| `memberCount` | `number`         | Approximate member count                 |
| `ownerId`     | `string`         | Snowflake ID of the guild owner          |

---

### `GET /api/guilds/:id`

Returns detailed information about a specific guild, including its server settings, full channel list, role list, and bot user info.

**Authentication:** Bearer token required.

**Path Parameters:**

| Parameter | Type     | Description          |
| --------- | -------- | -------------------- |
| `id`      | `string` | The Discord guild ID |

**Query Parameters:**

| Parameter | Type     | Description                                                                                    |
| --------- | -------- | ---------------------------------------------------------------------------------------------- |
| `data`    | `string` | Pass `"all"` to include the full raw Discord guild object instead of just `{ id, name, icon }` |

**Response:**

```json
{
  "guild": {
    "id": "123456789012345678",
    "name": "Kythia Universe",
    "icon": "https://cdn.discordapp.com/icons/..."
  },
  "settings": {
    "guildId": "123456789012345678",
    "lang": "en",
    "prefix": "!",
    "levelingOn": true
  },
  "channels": {
    "text": [{ "id": "111", "name": "general" }],
    "voice": [{ "id": "222", "name": "Voice Lounge" }],
    "categories": [{ "id": "333", "name": "General" }]
  },
  "roles": [
    {
      "id": "444444444444444444",
      "name": "Admin",
      "color": "#ff0000",
      "managed": false
    }
  ],
  "botUser": {
    "username": "Kythia",
    "avatar": "https://cdn.discordapp.com/avatars/...",
    "id": "555555555555555555",
    "discriminator": "0"
  }
}
```

| Field                   | Type     | Description                                                |
| ----------------------- | -------- | ---------------------------------------------------------- |
| `guild`                 | `object` | Basic or full guild object (depends on `?data=all`)        |
| `settings`              | `object` | The guild's `ServerSetting` record, or `{}` if none exists |
| `channels.text`         | `array`  | All text channels (type 0) — `{ id, name }`                |
| `channels.voice`        | `array`  | All voice channels (type 2) — `{ id, name }`               |
| `channels.categories`   | `array`  | All category channels (type 4) — `{ id, name }`            |
| `roles`                 | `array`  | All roles — `{ id, name, color, managed }`                 |
| `botUser.username`      | `string` | Bot's display username                                     |
| `botUser.avatar`        | `string` | Bot's avatar CDN URL                                       |
| `botUser.id`            | `string` | Bot's snowflake ID                                         |
| `botUser.discriminator` | `string` | Bot's discriminator (usually `"0"` on newer accounts)      |

**Error (404):**

```json
{ "error": "Bot is not in this guild" }
```

---

### `GET /api/guilds/:id/members`

Fetches all members of a specific guild by querying the appropriate shard. By default, it returns a simplified representation (only `id` and `username`) to reduce payload size. You can pass `?all=true` to include full details like avatar, roles, and join date.

**Authentication:** Bearer token required.

**Path Parameters:**

| Parameter | Type     | Description          |
| --------- | -------- | -------------------- |
| `id`      | `string` | The Discord guild ID |

**Query Parameters:**

| Parameter | Type      | Description                                                   |
| --------- | --------- | ------------------------------------------------------------- |
| `all`     | `boolean` | Set to `true` to include full member details (`avatar`, etc.) |

**Response (Default):**

```json
{
  "members": [
    {
      "id": "555555555555555555",
      "username": "kenndeclouv"
    }
  ]
}
```

**Response (`?all=true`):**

```json
{
  "members": [
    {
      "id": "555555555555555555",
      "username": "kenndeclouv",
      "discriminator": "0",
      "avatar": "https://cdn.discordapp.com/avatars/...",
      "bot": false,
      "roles": ["444444444444444444"],
      "joinedAt": 1690000000000
    }
  ]
}
```

| Field                     | Type      | Description                                              |
| ------------------------- | --------- | -------------------------------------------------------- |
| `members`                 | `array`   | Array of member objects                                  |
| `members[].id`            | `string`  | Member's user ID                                         |
| `members[].username`      | `string`  | Member's username                                        |
| `members[].discriminator` | `string`  | Member's discriminator _(if `all=true`)_                 |
| `members[].avatar`        | `string`  | Member's avatar CDN URL _(if `all=true`)_                |
| `members[].bot`           | `boolean` | Whether the user is a bot _(if `all=true`)_              |
| `members[].roles`         | `array`   | Array of role IDs assigned to the user _(if `all=true`)_ |
| `members[].joinedAt`      | `number`  | Unix timestamp of when the user joined _(if `all=true`)_ |

**Error (404):**

```json
{ "error": "Bot is not in this guild or could not fetch members" }
```

---

### `GET /api/guilds/settings/:guildId`

Fetches the stored `ServerSetting` for a guild.

**Authentication:** Bearer token required.

**Path Parameters:**

| Parameter | Type     | Description          |
| --------- | -------- | -------------------- |
| `guildId` | `string` | The Discord guild ID |

**Response:**

```json
{
  "settings": {
    "guildId": "123456789012345678",
    "lang": "en",
    "prefix": "!",
    "levelingOn": false,
    "welcomeInOn": true
  }
}
```

Returns `{ "settings": {} }` if no settings record exists for the guild yet.

---

### `PATCH /api/guilds/settings/:guildId`

Partially updates the `ServerSetting` for a guild. Only valid, known attributes are applied. Read-only fields (`id`, `guildId`, `createdAt`, `updatedAt`) are always skipped.

Values are automatically coerced to match the column's database type:

| DB Type                                   | Coercion                                                 |
| ----------------------------------------- | -------------------------------------------------------- |
| `BOOLEAN`                                 | `true` if `value === true` or `String(value) === "true"` |
| `INTEGER` / `BIGINT` / `FLOAT` / `DOUBLE` | Parsed with `parseInt`. `NaN` becomes `null`             |
| `JSON` / `JSONB`                          | Passed as-is if object, otherwise `[]`                   |
| `STRING` / others                         | Trimmed string. Empty string becomes `null`              |

**Authentication:** Bearer token required.

**Path Parameters:**

| Parameter | Type     | Description          |
| --------- | -------- | -------------------- |
| `guildId` | `string` | The Discord guild ID |

**Request Body:**

Any JSON object with valid `ServerSetting` attribute keys and their new values:

```json
{
  "lang": "id",
  "levelingOn": true,
  "welcomeInChannelId": "111111111111111111",
  "prefix": "?"
}
```

**Response (success):**

```json
{
  "success": true,
  "settings": {
    "guildId": "123456789012345678",
    "lang": "id",
    "levelingOn": true,
    "welcomeInChannelId": "111111111111111111"
  }
}
```

**Error (500):**

```json
{ "error": "Failed to save settings", "details": "Error message detail" }
```

> If no `ServerSetting` row exists for the guild, one is created automatically.

---

### `PATCH /api/guilds/branding/:guildId`

Updates the bot's in-guild appearance. This includes the bot's per-guild **nickname** and **avatar**, and also persists branding metadata (nickname, avatar URL, banner URL, bio) to the guild's `ServerSetting`.

**Authentication:** Bearer token required.

**Path Parameters:**

| Parameter | Type     | Description          |
| --------- | -------- | -------------------- |
| `guildId` | `string` | The Discord guild ID |

**Request Body:**

```json
{
  "nickname": "Kythia Bot",
  "avatar": "https://example.com/avatar.png",
  "banner": "https://example.com/banner.png",
  "bio": "Your friendly Discord companion."
}
```

| Field      | Type             | Required | Description                                                                                 |
| ---------- | ---------------- | -------- | ------------------------------------------------------------------------------------------- |
| `nickname` | `string \| null` | No       | New in-guild nickname. `null` or empty string resets to default                             |
| `avatar`   | `string \| null` | No       | New avatar URL. `null` or empty string resets to default                                    |
| `banner`   | `string \| null` | No       | Banner URL stored in settings only (Discord does not support per-guild bot banners via API) |
| `bio`      | `string \| null` | No       | Bio stored in settings only                                                                 |

**Response (success):**

```json
{ "success": true }
```

**Errors:**

| Status | Body                                                                     | Condition                |
| ------ | ------------------------------------------------------------------------ | ------------------------ |
| `404`  | `{ "error": "Guild not found" }`                                         | Guild not in cache       |
| `403`  | `{ "error": "Bot Missing Permissions: Cannot change nickname/avatar." }` | Discord error code 50013 |
| `500`  | `{ "error": "Failed to update bot profile.", "details": "..." }`         | Other Discord API error  |

> Only fields present in the request body are applied. Absent fields are ignored.

---

### `POST /api/webhooks/topgg`

**Top.gg vote webhook.** Called by the Top.gg service when a user votes for the bot. Updates the user's vote record in the database, grants 1,000 Kythia Coins, and sends a thank-you DM.

**Authentication:** Uses Top.gg's own webhook authorization header:

```
Authorization: <topgg.authToken from kythiaConfig>
```

**Request Body:** (sent by Top.gg)

```json
{
  "user": "123456789012345678",
  "type": "upvote",
  "isWeekend": false
}
```

> The `user` field is a large integer snowflake. The handler safely parses it as a string to avoid precision loss.

**Behavior:**

1. Validates the `Authorization` header against `config.api.topgg.authToken`.
2. Upserts a `KythiaVoter` record with the current timestamp.
3. Upserts or creates a `KythiaUser`, adding **+1,000** `kythiaCoin`, setting `isVoted: true`, setting `voteExpiresAt` to **12 hours from now**, and incrementing `votePoints` by 1.
4. Attempts to DM the user a thank-you message (silently fails if DMs are closed).
5. If `config.api.webhookVoteLogs` is set, posts a rich Components V2 vote log message to that webhook URL, including a vote banner image, user avatar thumbnail, and a link button to vote again.

**Response (success):**

```json
{ "success": true }
```

**Errors:**

| Status | Body                                 | Condition                     |
| ------ | ------------------------------------ | ----------------------------- |
| `401`  | `{ "error": "Unauthorized Top.gg" }` | Invalid auth header           |
| `400`  | `{ "error": "Invalid JSON Body" }`   | Malformed request body        |
| `400`  | `{ "error": "No User ID" }`          | Missing `user` field          |
| `500`  | `{ "error": "Internal Error" }`      | Database or Discord API error |

---

### `POST /api/webhooks/license-created`

**License delivery webhook.** Called by an external service (e.g. a purchase platform) to deliver a license key to a Discord user via direct message.

**Authentication:** Bearer token (same as global API secret):

```
Authorization: Bearer <API_SECRET>
```

**Request Body:**

```json
{
  "userId": "123456789012345678",
  "licenseKey": "XXXX-XXXX-XXXX-XXXX",
  "transactionId": "TXN-0001"
}
```

| Field           | Type     | Required | Description                                        |
| --------------- | -------- | -------- | -------------------------------------------------- |
| `userId`        | `string` | Yes      | The Discord user ID to DM                          |
| `licenseKey`    | `string` | Yes      | The license key to deliver                         |
| `transactionId` | `string` | No       | Transaction reference ID to include in the message |

**Behavior:**

1. Validates `Authorization` header against the API secret.
2. Fetches the Discord user by `userId`.
3. Sends a formatted Components V2 DM containing the license key and transaction ID, styled with a green accent.

**Response (success):**

```json
{ "success": true }
```

**Errors:**

| Status | Body                                                 | Condition                             |
| ------ | ---------------------------------------------------- | ------------------------------------- |
| `401`  | `{ "error": "Unauthorized" }`                        | Invalid auth header                   |
| `400`  | `{ "error": "Missing Data" }`                        | `userId` or `licenseKey` is missing   |
| `404`  | `{ "error": "User Not Found" }`                      | Discord user not found                |
| `500`  | `{ "error": "Failed to DM User", "details": "..." }` | Could not send DM (e.g. DMs disabled) |

---

### Ticket API (`/api/tickets`)

The **Ticket API** provides programmatic access to manage support tickets, ticket types (configs), and reactive panels. All endpoints require bearer token authentication.

---

#### Tickets (`/api/tickets`)

##### `GET /api/tickets`

Fetches a list of support tickets.

**Query Parameters:**
| Parameter | Type | Description |
|---|---|---|
| `guildId` | `string` | Filter by guild ID |
| `userId` | `string` | Filter by ticket opener |
| `channelId` | `string` | Filter by channel ID |
| `status` | `string` | Filter by status: `"open"` or `"closed"` |

**Response:**

```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": 12,
      "guildId": "123456789012345678",
      "userId": "987654321098765432",
      "channelId": "112233445566778899",
      "ticketConfigId": 3,
      "status": "open",
      "openedAt": "2025-01-15T08:30:00.000Z",
      "closedAt": null,
      "closedByUserId": null,
      "closedReason": null,
      "createdAt": "2025-01-15T08:30:00.000Z",
      "updatedAt": "2025-01-15T08:30:00.000Z"
    }
  ]
}
```

##### `GET /api/tickets/:id`

Get a single ticket by ID.

**Response:** `{ "success": true, "data": { ... } }`

**Error (404):** `{ "success": false, "error": "Ticket not found" }`

##### `PATCH /api/tickets/:id`

Update ticket fields (e.g. `status`, `closedReason`). Persists and updates the cache.

**Response:** `{ "success": true, "data": { ... } }`

##### `DELETE /api/tickets/:id`

Delete a ticket record. Does **not** delete the Discord channel — use `/close` for that.

**Response:** `{ "success": true, "message": "Ticket deleted successfully" }`

---

#### Ticket Actions

##### `POST /api/tickets/open`

Opens a new ticket channel for a user, mirroring the bot's slash command behaviour.

**Request Body:**
| Field | Type | Required | Description |
|---|---|---|---|
| `guildId` | `string` | ✅ | Target guild |
| `userId` | `string` | ✅ | User ID of the ticket creator |
| `ticketConfigId` | `integer` | ✅ | ID of the `TicketConfig` to use |
| `reason` | `string` | No | Optional reason |

**Response:** `{ "success": true, "message": "Ticket creation initiated" }`

**Errors:**
| Status | Condition |
|---|---|
| `400` | Missing required fields |
| `404` | Guild, user, or TicketConfig not found |

##### `POST /api/tickets/:id/close`

Closes a ticket, generates a transcript, and deletes the channel.

**Request Body:**
| Field | Type | Required | Description |
|---|---|---|---|
| `userId` | `string` | ✅ | ID of the user performing the close |
| `reason` | `string` | No | Reason for closing |

**Response:** `{ "success": true, "message": "Ticket closing initiated" }`

**Errors:**
| Status | Condition |
|---|---|
| `400` | Missing `userId`, or ticket already closed |
| `404` | Ticket, guild, user, or channel not found |

---

#### Ticket Panels (`/api/tickets/panels`)

##### `GET /api/tickets/panels/:guildId`

List all panels for a guild.

**Response:** `{ "success": true, "count": 1, "data": [ { ... } ] }`

##### `POST /api/tickets/panels`

Post a new panel to a Discord channel, then create the DB record.

**Request Body:**
| Field | Type | Required | Description |
|---|---|---|---|
| `guildId` | `string` | ✅ | Guild ID |
| `channelId` | `string` | ✅ | Channel to post the panel in |
| `title` | `string` | ✅ | Panel heading |
| `description` | `string` | No | Panel body text |
| `image` | `string` | No | Image URL to display in the panel |

> `messageId` is assigned by Discord after posting — it is **not** a request field.

**Response:** `{ "success": true, "data": { ...panel } }`

**Error (400):** Missing `guildId`, `channelId`, or `title`.

##### `PATCH /api/tickets/panels/:id`

Update panel fields and automatically refresh the live Discord message.

**Path Parameters:** `id` — panel's database PK.

**Request Body:** Any panel fields (`title`, `description`, `image`).

**Response:** `{ "success": true, "data": { ...panel } }`

##### `DELETE /api/tickets/panels/:id`

Delete a panel, all its associated `TicketConfig` types, and the Discord message (best-effort).

**Response:** `{ "success": true, "message": "Panel \"Support\" deleted successfully" }`

##### `POST /api/tickets/panels/:messageId/refresh`

Force-refresh the live Discord panel for `messageId`.

**Response:** `{ "success": true, "message": "Panel refreshed" }`

##### `POST /api/tickets/panels/:id/resend`

Resend a panel as a **new message** to the same or a different channel. The old Discord message is deleted (best-effort), a fresh panel message is posted to the target channel, the DB record is updated with the new `channelId` and `messageId`, and then the panel is immediately refreshed to repopulate all ticket type buttons.

> Use this when the original panel message is lost, or when you want to move the panel to a different channel.

**Path Parameters:** `id` — panel's database PK.

**Request Body:**
| Field | Type | Required | Description |
|---|---|---|---|
| `channelId` | `string` | No | Target text channel to post the panel in. Defaults to the panel's current channel if omitted |

**Response:**

```json
{
  "success": true,
  "message": "Panel \"Support\" resent to channel 112233445566778899",
  "data": {
    "panelId": 1,
    "channelId": "112233445566778899",
    "messageId": "998877665544332211"
  }
}
```

**Errors:**
| Status | Condition |
|---|---|
| `404` | Panel not found, or target channel not found |
| `500` | Discord API or database error |

---

#### Ticket Types / Configs (`/api/tickets/configs`)

> ⚠️ The path is **`/configs`** (plural), not `/config`.

##### `GET /api/tickets/configs/:guildId`

List all ticket types for a guild.

**Response:** `{ "success": true, "count": 2, "data": [ { ... } ] }`

##### `GET /api/tickets/configs/id/:id`

Get a single ticket type by its database PK.

**Response:** `{ "success": true, "data": { ... } }`

##### `POST /api/tickets/configs`

Create a new ticket type and automatically refresh the parent panel.

**Request Body:**
| Field | Type | Required | Description |
|---|---|---|---|
| `guildId` | `string` | ✅ | Guild ID |
| `panelMessageId` | `string` | ✅ | Message ID of the parent panel |
| `typeName` | `string` | ✅ | Label for this ticket type |
| `staffRoleId` | `string` | ✅ | Role that can see tickets |
| `logsChannelId` | `string` | ✅ | Channel for ticket logs |
| `transcriptChannelId` | `string` | ✅ | Channel for HTML transcripts |
| `typeEmoji` | `string` | No | Optional emoji shown on the button |
| `ticketCategoryId` | `string` | No | Category to create ticket channels in (channel style only) |
| `ticketOpenMessage` | `string` | No | Message sent when ticket opens |
| `ticketOpenImage` | `string` | No | Image shown in the ticket open message |
| `askReason` | `string` | No | Question prompt shown to the user before opening (if set, a modal is shown) |
| `ticketStyle` | `string` | No | `"channel"` (default) or `"thread"` — whether tickets open as new channels or private threads |
| `ticketThreadChannelId` | `string` | No\* | Parent text channel for threads. **Required** when `ticketStyle` is `"thread"` |

> When `ticketStyle` is `"thread"`, the ticket is created as a **private thread** inside `ticketThreadChannelId`. `ticketCategoryId` is ignored for thread-style types.

**Response:** `{ "success": true, "data": { ...config } }`

**Error (400):** Missing required fields, or `ticketStyle` is `"thread"` but `ticketThreadChannelId` is not provided.

##### `PATCH /api/tickets/configs/:id`

Update a ticket type and refresh the parent panel.

**Request Body:** Any `TicketConfig` fields (including `ticketStyle` and `ticketThreadChannelId`).

**Response:** `{ "success": true, "data": { ...config } }`

##### `DELETE /api/tickets/configs/:id`

Delete a ticket type and refresh the parent panel so the button disappears.

**Response:** `{ "success": true, "message": "Ticket type \"Support\" deleted successfully" }`

---

### AutoReact API (`/api/autoreact`)

Manage automatic reaction rules. Rules trigger the bot to add an emoji to messages matching a specific trigger.

#### `GET /api/autoreact`

List all autoreact rules.

- **Query Params:** `guildId`, `userId`, `type` (`text` or `channel`).

**Response:**

```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": 5,
      "guildId": "...",
      "trigger": "hello",
      "emoji": "👋",
      "type": "text"
    }
  ]
}
```

#### `GET /api/autoreact/:id`

Get a specific rule.

#### `POST /api/autoreact`

Create a new rule.

- **Body:** `{ guildId, userId, trigger, emoji, type }`

#### `PATCH /api/autoreact/:id`

Update an existing rule.

#### `DELETE /api/autoreact/:id`

Delete a rule.

---

### AutoReply API (`/api/autoreply`)

Manage automatic reply rules. Rules trigger the bot to send a text or media response when it sees a specific trigger word.

#### `GET /api/autoreply`

List all autoreply rules.

- **Query Params:** `guildId`, `userId`.

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 8,
      "guildId": "...",
      "trigger": "!help",
      "response": "How can I help you today?",
      "media": null,
      "useContainer": false
    }
  ]
}
```

#### `GET /api/autoreply/:id`

Get a specific rule.

#### `POST /api/autoreply`

Create a new rule.

- **Body:** `{ guildId, userId, trigger, response, media, useContainer }`

#### `PATCH /api/autoreply/:id`

Update an existing rule.

#### `DELETE /api/autoreply/:id`

Delete a rule.

---

### Counting API (`/api/counting`)

Manage server counting configurations, including base modes, custom emojis, strict modes, and math evaluation settings.

#### `GET /api/counting`

List all counting configurations.

- **Query Params:** `guildId`

**Response:** `{ "success": true, "count": 1, "data": [...] }`

#### `GET /api/counting/:guildId`

Get counting configuration for a specific server.

#### `POST /api/counting`

Create a new counting configuration.

- **Body:** `{ guildId, channelId, mode, successReaction, failReaction, mathEnabled, strictEnabled }`

#### `PATCH /api/counting/:guildId`

Update an existing counting configuration.

- **Body:** Any of `{ channelId, mode, successReaction, failReaction, mathEnabled, strictEnabled }`

#### `DELETE /api/counting/:guildId`

Delete a server's counting configuration.

---

### Invite API (`/api/invite`)

Track and manage server invites, invite history, per-guild invite settings, and milestone role rewards. All endpoints require bearer token authentication.

> **Models:** `Invite`, `InviteHistory`, `InviteSetting`, `ServerSetting`

---

#### Invite Settings (`/api/invite/settings/:guildId`)

##### `GET /api/invite/settings/:guildId`

Returns combined invite configuration — both from `InviteSetting` and relevant `ServerSetting` fields.

**Path Parameters:**
| Parameter | Type | Description |
|---|---|---|
| `guildId` | `string` | The Discord guild ID |

**Response:**

```json
{
  "success": true,
  "data": {
    "invitesOn": true,
    "inviteChannelId": "111111111111111111",
    "fakeThreshold": 7,
    "joinMessage": null,
    "leaveMessage": null,
    "milestoneRoles": [],
    "roleStack": false
  }
}
```

| Field             | Type             | Description                                                                                                                     |
| ----------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `invitesOn`       | `boolean`        | Whether invite tracking is enabled                                                                                              |
| `inviteChannelId` | `string \| null` | Channel ID to post join/leave logs                                                                                              |
| `fakeThreshold`   | `integer`        | Account age in days below which an invite is counted as fake (default: 7)                                                       |
| `joinMessage`     | `string \| null` | Custom join log message template. Supports `{user}`, `{username}`, `{inviter}`, `{inviterTag}`, `{invites}`, `{code}`, `{type}` |
| `leaveMessage`    | `string \| null` | Custom leave log message template                                                                                               |
| `milestoneRoles`  | `array`          | List of `{ invites: number, roleId: string }` milestone objects                                                                 |
| `roleStack`       | `boolean`        | If `true`, all earned milestone roles are stacked. If `false`, only the highest is kept                                         |

---

##### `PATCH /api/invite/settings/:guildId`

Partially updates invite configuration. Can update both `InviteSetting` and `ServerSetting` in one call.

**Request Body:**

```json
{
  "invitesOn": true,
  "inviteChannelId": "111111111111111111",
  "fakeThreshold": 14,
  "joinMessage": "{user} joined using `{code}` from {inviter}!",
  "leaveMessage": "{user} left. Was invited by {inviter}.",
  "roleStack": true
}
```

**Allowed Fields:**

| Field                                                                         | Target Model    |
| ----------------------------------------------------------------------------- | --------------- |
| `fakeThreshold`, `joinMessage`, `leaveMessage`, `milestoneRoles`, `roleStack` | `InviteSetting` |
| `inviteChannelId`, `invitesOn`                                                | `ServerSetting` |

**Response:** `{ "success": true, "message": "Invite settings updated." }`

**Error (404):** `{ "success": false, "error": "ServerSetting not found" }` if `ServerSetting` fields are being updated but the guild record doesn't exist.

---

#### Template Placeholders

Kythia supports placeholders in custom messages (Welcome text, Welcome DM, Invite join/leave logs). They are replaced dynamically when a message is sent.

> Aliases are interchangeable — `{user}` and `{mention}` produce the same output, for example.

---

##### 👤 Member

| Variable        | Alias       | Description                       | Example                 |
| --------------- | ----------- | --------------------------------- | ----------------------- |
| `{user}`        | `{mention}` | Mentions the member               | `<@123456789012345678>` |
| `{username}`    |             | The member's username             | `kenndeclouv`           |
| `{user_id}`     |             | The member's Discord snowflake ID | `123456789012345678`    |
| `{tag}`         |             | Username + discriminator          | `kenndeclouv#0001`      |
| `{member_join}` |             | Date the member joined the server | `03/03/2026`            |

---

##### 🏠 Server

| Variable         | Alias                             | Description                         | Example                  |
| ---------------- | --------------------------------- | ----------------------------------- | ------------------------ |
| `{guild}`        | `{servername}`                    | Server name                         | `Kythia Universe`        |
| `{guild_id}`     |                                   | Server ID                           | `123456789012345678`     |
| `{members}`      | `{membercount}`, `{memberstotal}` | Total members                       | `1337`                   |
| `{owner}`        |                                   | Server owner's username             | `kenndeclouv`            |
| `{owner_id}`     |                                   | Server owner's ID                   | `987654321098765432`     |
| `{region}`       |                                   | Server locale/region                | `en-US`                  |
| `{verified}`     |                                   | Whether the server is verified      | `Yes`                    |
| `{partnered}`    |                                   | Whether the server is partnered     | `No`                     |
| `{boosts}`       |                                   | Number of boosts                    | `14`                     |
| `{boost_level}`  |                                   | Boost tier (0–3)                    | `2`                      |
| `{guild_age}`    |                                   | How long ago the server was created | `1 year 4 months 2 days` |
| `{created_date}` |                                   | Server creation date                | `01/01/2023`             |
| `{created_time}` |                                   | Server creation time                | `12:00`                  |

---

##### 📊 Server Counts

| Variable                  | Description                     | Example |
| ------------------------- | ------------------------------- | ------- |
| `{roles}`                 | Number of roles                 | `24`    |
| `{emojis}`                | Number of custom emojis         | `88`    |
| `{stickers}`              | Number of custom stickers       | `5`     |
| `{channels}`              | Total channels                  | `32`    |
| `{text_channels}`         | Number of text channels         | `16`    |
| `{voice_channels}`        | Number of voice channels        | `8`     |
| `{categories}`            | Number of category channels     | `4`     |
| `{announcement_channels}` | Number of announcement channels | `2`     |
| `{stage_channels}`        | Number of stage channels        | `1`     |

---

##### 🕐 Date & Time

| Variable      | Description                     | Example            |
| ------------- | ------------------------------- | ------------------ |
| `{date}`      | Current date (localized)        | `03/03/2026`       |
| `{time}`      | Current time (localized)        | `15:45`            |
| `{datetime}`  | Date and time combined          | `03/03/2026 15:45` |
| `{day}`       | Current day of the week         | `Monday`           |
| `{month}`     | Current month name              | `March`            |
| `{year}`      | Current year                    | `2026`             |
| `{hour}`      | Current hour (24h, zero-padded) | `15`               |
| `{minute}`    | Current minute (zero-padded)    | `45`               |
| `{second}`    | Current second (zero-padded)    | `09`               |
| `{timestamp}` | Unix timestamp in milliseconds  | `1740998400000`    |

---

##### 🔗 Invite-specific

_Only available in `joinMessage` / `leaveMessage` templates._

| Variable       | Description                                                         | Example                 |
| -------------- | ------------------------------------------------------------------- | ----------------------- |
| `{inviter}`    | Mentions the inviter                                                | `<@987654321098765432>` |
| `{inviterTag}` | The inviter's username                                              | `inviter_user`          |
| `{invites}`    | Inviter's current total (real + bonus)                              | `15`                    |
| `{code}`       | The invite code used                                                | `kythia`                |
| `{type}`       | Join type: `new`, `rejoin`, `fake`, `vanity`, `oauth`, or `unknown` | `new`                   |

---

#### Invite Stats (`/api/invite/:guildId`)

##### `GET /api/invite/:guildId`

Returns a paginated, sortable invite leaderboard for a guild.

**Path Parameters:**
| Parameter | Type | Description |
|---|---|---|
| `guildId` | `string` | The Discord guild ID |

**Query Parameters:**
| Parameter | Type | Default | Description |
|---|---|---|---|
| `sort` | `string` | `total` | Sort column: `real`, `fake`, `bonus`, `rejoin`, `total` |
| `page` | `integer` | `1` | Page number |
| `limit` | `integer` | `20` | Results per page (max 100) |

**Response:**

```json
{
  "success": true,
  "count": 42,
  "page": 1,
  "totalPages": 3,
  "data": [
    {
      "rank": 1,
      "userId": "123456789012345678",
      "invites": 30,
      "bonus": 5,
      "fake": 2,
      "leaves": 4,
      "rejoins": 1,
      "total": 35
    }
  ]
}
```

| Field     | Type      | Description                                                       |
| --------- | --------- | ----------------------------------------------------------------- |
| `rank`    | `integer` | Position on the leaderboard (1-based, continuing across pages)    |
| `invites` | `integer` | Real (non-fake) invites                                           |
| `bonus`   | `integer` | Manually awarded bonus invites (not deducted on leave)            |
| `fake`    | `integer` | Invites counted as fake (joined account < fakeThreshold days old) |
| `leaves`  | `integer` | Number of invited members who left                                |
| `rejoins` | `integer` | Number of invited members who rejoined                            |
| `total`   | `integer` | `invites + bonus`                                                 |

---

##### `GET /api/invite/:guildId/user/:userId`

Returns full invite stats and rank for a specific user. Also includes info about who invited this user.

**Path Parameters:**
| Parameter | Type | Description |
|---|---|---|
| `guildId` | `string` | The Discord guild ID |
| `userId` | `string` | The Discord user ID |

**Response:**

```json
{
  "success": true,
  "data": {
    "userId": "123456789012345678",
    "invites": 30,
    "bonus": 5,
    "fake": 2,
    "leaves": 4,
    "rejoins": 1,
    "total": 35,
    "rank": 1,
    "totalInviters": 42,
    "invitedBy": {
      "inviterId": "987654321098765432",
      "inviteCode": "abc123",
      "joinType": "new",
      "joinedAt": "2025-01-15T08:30:00.000Z"
    }
  }
}
```

| Field                | Type             | Description                                              |
| -------------------- | ---------------- | -------------------------------------------------------- |
| `rank`               | `integer`        | Position in the guild leaderboard                        |
| `totalInviters`      | `integer`        | Total number of users with invite data in the guild      |
| `invitedBy`          | `object \| null` | Who invited this user. `null` if unknown                 |
| `invitedBy.joinType` | `string`         | `new`, `rejoin`, `fake`, `vanity`, `oauth`, or `unknown` |

---

##### `PATCH /api/invite/:guildId/user/:userId`

Manually set any invite stat field for a user.

**Request Body:**

```json
{
  "invites": 10,
  "bonus": 5,
  "fake": 0,
  "leaves": 2,
  "rejoins": 1
}
```

All fields are optional. Only provided fields are updated. A record is created if it doesn't exist.

**Response:** `{ "success": true, "data": { ...updatedStats } }`

---

##### `DELETE /api/invite/:guildId/user/:userId`

Reset (delete) a specific user's invite stats row.

**Response:** `{ "success": true, "message": "User invite stats reset." }`

**Error (404):** `{ "success": false, "error": "User invite record not found" }`

---

##### `DELETE /api/invite/:guildId`

Reset all invite stats for the entire guild (all user rows deleted).

**Response:** `{ "success": true, "message": "All invite stats reset for guild." }`

---

#### Invite History (`/api/invite/:guildId/history`)

##### `GET /api/invite/:guildId/history`

Returns filtered, paginated invite history records for a guild.

**Query Parameters:**
| Parameter | Type | Description |
|---|---|---|
| `inviterId` | `string` | Filter by who invited |
| `memberId` | `string` | Filter by who joined |
| `status` | `string` | Filter by status: `active` or `left` |
| `joinType` | `string` | Filter by: `new`, `rejoin`, `fake`, `vanity`, `oauth`, `unknown` |
| `page` | `integer` | Page number (default 1) |
| `limit` | `integer` | Results per page (default 20, max 100) |

**Response:**

```json
{
  "success": true,
  "count": 85,
  "page": 1,
  "totalPages": 5,
  "data": [
    {
      "id": 101,
      "guildId": "123456789012345678",
      "inviterId": "987654321098765432",
      "memberId": "555555555555555555",
      "inviteCode": "abc123",
      "joinType": "new",
      "status": "active",
      "isFake": false,
      "joinedAt": "2025-01-15T08:30:00.000Z",
      "updatedAt": "2025-01-15T08:30:00.000Z"
    }
  ]
}
```

| Field        | Type             | Description                                              |
| ------------ | ---------------- | -------------------------------------------------------- |
| `inviteCode` | `string \| null` | The Discord invite code used to join                     |
| `joinType`   | `string`         | `new`, `rejoin`, `fake`, `vanity`, `oauth`, or `unknown` |
| `status`     | `string`         | `active` (still in server) or `left`                     |
| `isFake`     | `boolean`        | Whether this was counted as a fake invite                |

---

##### `GET /api/invite/:guildId/history/:memberId`

Returns the full join history for a specific member (all times they've joined/left).

**Response:** `{ "success": true, "count": 3, "data": [ ... ] }`

**Error (404):** `{ "success": false, "error": "No history found for this member" }`

---

##### `DELETE /api/invite/:guildId/history/:id`

Delete a specific invite history record by its database ID.

**Response:** `{ "success": true, "message": "History record deleted." }`

---

#### Invite Milestones (`/api/invite/:guildId/milestones`)

Milestone roles are automatically awarded when an inviter reaches a specified number of invites.

##### `GET /api/invite/:guildId/milestones`

Returns the current milestone role configuration.

**Response:**

```json
{
  "success": true,
  "data": {
    "milestoneRoles": [
      { "invites": 5, "roleId": "111111111111111113" },
      { "invites": 25, "roleId": "111111111111111114" }
    ],
    "roleStack": false
  }
}
```

---

##### `POST /api/invite/:guildId/milestones`

Add a new milestone role.

**Request Body:**

```json
{
  "invites": 25,
  "roleId": "111111111111111114"
}
```

| Field     | Type      | Required | Description                             |
| --------- | --------- | -------- | --------------------------------------- |
| `invites` | `integer` | ✅       | Invite count threshold to earn the role |
| `roleId`  | `string`  | ✅       | Discord role ID to assign               |

**Response:** `{ "success": true, "data": { "milestoneRoles": [ ... ] } }`

**Error (409):** `{ "success": false, "error": "A milestone at that invite count already exists" }`

---

##### `DELETE /api/invite/:guildId/milestones/:invites`

Remove a milestone by its invite count threshold.

**Path Parameters:**
| Parameter | Type | Description |
|---|---|---|
| `invites` | `integer` | The invite threshold of the milestone to remove |

**Response:** `{ "success": true, "data": { "milestoneRoles": [ ... ] } }`

**Error (404):** `{ "success": false, "error": "No milestone found at that invite count" }`

---

## Booster API (`/api/booster`)

Manages server boosting message settings for a guild. All settings are stored in the dedicated `BoosterSetting` model (`booster_settings` table).

**Authentication:** Bearer token required for all routes.

---

### `GET /api/booster/:guildId`

Returns all booster-related settings for the specified guild.

**Path Parameters:**

| Parameter | Type     | Description          |
| --------- | -------- | -------------------- |
| `guildId` | `string` | The Discord guild ID |

**Response:**

```json
{
  "success": true,
  "data": {
    "boosterOn": false,
    "boosterChannelId": null,
    "boosterEmbedText": null,
    "boosterEmbedColor": null,
    "boosterBannerWidth": null,
    "boosterBannerHeight": null,
    "boosterBackgroundUrl": null,
    "boosterForegroundUrl": null,
    "boosterOverlayColor": null,
    "boosterAvatarEnabled": true,
    "boosterAvatarSize": null,
    "boosterAvatarShape": null,
    "boosterAvatarYOffset": null,
    "boosterAvatarBorderWidth": null,
    "boosterAvatarBorderColor": null,
    "boosterMainTextContent": null,
    "boosterMainTextFontFamily": null,
    "boosterMainTextFontWeight": null,
    "boosterMainTextColor": null,
    "boosterMainTextYOffset": null,
    "boosterSubTextContent": null,
    "boosterSubTextColor": null,
    "boosterSubTextYOffset": null,
    "boosterBorderColor": null,
    "boosterBorderWidth": null,
    "boosterShadowColor": null,
    "boosterLayout": null
  }
}
```

---

### `PATCH /api/booster/:guildId`

Partially updates booster settings for a guild.

**Path Parameters:**

| Parameter | Type     | Description          |
| --------- | -------- | -------------------- |
| `guildId` | `string` | The Discord guild ID |

**Request Body:**

A JSON object containing any of the fields listed above (e.g., `boosterOn`, `boosterChannelId`). All fields are optional.

**Response:**

```json
{
  "success": true,
  "data": {
    /* updated settings object */
  }
}
```

---

### `POST /api/booster/:guildId/test`

Tests the booster settings by triggering a simulated `guildMemberUpdate` event.

**Path Parameters:**

| Parameter | Type     | Description          |
| --------- | -------- | -------------------- |
| `guildId` | `string` | The Discord guild ID |

**Request Body (Optional):**

| Field    | Type     | Description                                                                                             |
| -------- | -------- | ------------------------------------------------------------------------------------------------------- |
| `userId` | `string` | Optional. The Discord user ID to simulate the event for. Defaults to the guild owner or the bot itself. |

**Response:**

```json
{
  "success": true,
  "message": "Dispatched guildMemberUpdate event for testing booster."
}
```

---

## Welcomer API (`/api/welcome`)

Manages welcome-in, welcome-out, welcome DM, and style settings for a guild. All settings are stored in the dedicated `WelcomeSetting` model (`welcome_settings` table).

**Authentication:** Bearer token required for all routes.

---

### `GET /api/welcome/:guildId`

Returns all welcome-related settings for the specified guild.

**Path Parameters:**

| Parameter | Type     | Description          |
| --------- | -------- | -------------------- |
| `guildId` | `string` | The Discord guild ID |

**Response:**

```json
{
  "success": true,
  "data": {
    "welcomeInOn": true,
    "welcomeInChannelId": "111111111111111111",
    "welcomeInEmbedText": "Welcome, {username}!",
    "welcomeInEmbedColor": "#5865F2",
    "welcomeInBackgroundUrl": "https://example.com/bg.png",
    "welcomeInOverlayColor": "#000000",
    "welcomeInBannerWidth": 1024,
    "welcomeInBannerHeight": 450,
    "welcomeInAvatarEnabled": true,
    "welcomeInAvatarSize": null,
    "welcomeInAvatarShape": "circle",
    "welcomeInAvatarYOffset": null,
    "welcomeInAvatarBorderWidth": null,
    "welcomeInAvatarBorderColor": null,
    "welcomeInMainTextContent": "WELCOME",
    "welcomeInMainTextColor": "#FFFFFF",
    "welcomeInMainTextFontFamily": null,
    "welcomeInMainTextFontWeight": null,
    "welcomeInMainTextYOffset": null,
    "welcomeInSubTextContent": null,
    "welcomeInSubTextColor": null,
    "welcomeInSubTextYOffset": null,
    "welcomeInBorderColor": null,
    "welcomeInBorderWidth": null,
    "welcomeInShadowColor": null,
    "welcomeInLayout": null,
    "welcomeOutOn": false,
    "welcomeOutChannelId": null,
    "welcomeOutEmbedText": null,
    "welcomeOutEmbedColor": null,
    "welcomeOutBackgroundUrl": null,
    "welcomeOutOverlayColor": null,
    "welcomeOutBannerWidth": null,
    "welcomeOutBannerHeight": null,
    "welcomeOutAvatarEnabled": true,
    "welcomeOutAvatarSize": null,
    "welcomeOutAvatarShape": null,
    "welcomeOutAvatarYOffset": null,
    "welcomeOutAvatarBorderWidth": null,
    "welcomeOutAvatarBorderColor": null,
    "welcomeOutMainTextContent": null,
    "welcomeOutMainTextColor": null,
    "welcomeOutMainTextFontFamily": null,
    "welcomeOutMainTextFontWeight": null,
    "welcomeOutMainTextYOffset": null,
    "welcomeOutSubTextContent": null,
    "welcomeOutSubTextColor": null,
    "welcomeOutSubTextYOffset": null,
    "welcomeOutBorderColor": null,
    "welcomeOutBorderWidth": null,
    "welcomeOutLayout": null,
    "welcomeRoleId": null,
    "welcomeDmOn": false,
    "welcomeDmText": null
  }
}
```

**Errors:**

| Status | Body                                                        | Condition                    |
| ------ | ----------------------------------------------------------- | ---------------------------- |
| `404`  | `{ "success": false, "error": "WelcomeSetting not found" }` | No settings record for guild |

---

### `PATCH /api/welcome/:guildId`

Partially updates welcome settings for a guild. Only the fields listed in the allowed set below are accepted; all other keys are silently ignored.

**Path Parameters:**

| Parameter | Type     | Description          |
| --------- | -------- | -------------------- |
| `guildId` | `string` | The Discord guild ID |

**Request Body:**

Send any subset of the fields below:

| Field                          | Type         | Description                                                                       |
| ------------------------------ | ------------ | --------------------------------------------------------------------------------- |
| `welcomeInOn`                  | `boolean`    | Enable/disable welcome-in messages                                                |
| `welcomeInChannelId`           | `string`     | Channel ID for welcome-in messages                                                |
| `welcomeInEmbedText`           | `string`     | Text displayed in the welcome card. Supports placeholders                         |
| `welcomeInEmbedColor`          | `string`     | HEX accent color for the welcome card                                             |
| `welcomeInBackgroundUrl`       | `string`     | URL of the banner background image                                                |
| `welcomeInOverlayColor`        | `string`     | HEX color overlay on the background                                               |
| `welcomeInBannerWidth`         | `integer`    | Canvas width in pixels                                                            |
| `welcomeInBannerHeight`        | `integer`    | Canvas height in pixels                                                           |
| `welcomeInAvatarEnabled`       | `boolean`    | Enable/disable avatar on banner (default `true`)                                  |
| `welcomeInAvatarSize`          | `integer`    | Avatar diameter in pixels                                                         |
| `welcomeInAvatarShape`         | `string`     | `"circle"` or `"square"`                                                          |
| `welcomeInAvatarYOffset`       | `integer`    | Avatar vertical offset                                                            |
| `welcomeInAvatarBorderWidth`   | `integer`    | Avatar border width                                                               |
| `welcomeInAvatarBorderColor`   | `string`     | Avatar border HEX color                                                           |
| `welcomeInMainTextContent`     | `string`     | Main banner text (default `WELCOME`)                                              |
| `welcomeInMainTextColor`       | `string`     | HEX color for main banner text                                                    |
| `welcomeInMainTextFontFamily`  | `string`     | Font family name for main text                                                    |
| `welcomeInMainTextFontWeight`  | `string`     | Font weight for main text                                                         |
| `welcomeInMainTextYOffset`     | `integer`    | Vertical offset for main text                                                     |
| `welcomeInSubTextContent`      | `string`     | Sub-text content on banner                                                        |
| `welcomeInSubTextColor`        | `string`     | HEX color for username sub-text                                                   |
| `welcomeInSubTextYOffset`      | `integer`    | Vertical offset for sub-text                                                      |
| `welcomeInBorderColor`         | `string`     | Banner border HEX color                                                           |
| `welcomeInBorderWidth`         | `integer`    | Banner border width                                                               |
| `welcomeInShadowColor`         | `string`     | Enables text shadow when set                                                      |
| **`welcomeInLayout`**          | `JSON\|null` | `null` → CV2 banner card (default); `{ "style": "plain-text" }` → plain text only |
| `welcomeOutOn`                 | `boolean`    | Enable/disable farewell messages                                                  |
| `welcomeOutChannelId`          | `string`     | Channel ID for farewell messages                                                  |
| `welcomeOutEmbedText`          | `string`     | Farewell text. Supports placeholders                                              |
| `welcomeOutEmbedColor`         | `string`     | HEX accent color for the farewell card                                            |
| `welcomeOutBackgroundUrl`      | `string`     | URL of the farewell banner background                                             |
| `welcomeOutOverlayColor`       | `string`     | HEX color overlay on the farewell background                                      |
| `welcomeOutBannerWidth`        | `integer`    | Farewell canvas width                                                             |
| `welcomeOutBannerHeight`       | `integer`    | Farewell canvas height                                                            |
| `welcomeOutAvatarEnabled`      | `boolean`    | Enable/disable avatar on farewell banner (default `true`)                         |
| `welcomeOutAvatarSize`         | `integer`    | Farewell avatar diameter                                                          |
| `welcomeOutAvatarShape`        | `string`     | `"circle"` or `"square"`                                                          |
| `welcomeOutAvatarYOffset`      | `integer`    | Farewell avatar vertical offset                                                   |
| `welcomeOutAvatarBorderWidth`  | `integer`    | Farewell avatar border width                                                      |
| `welcomeOutAvatarBorderColor`  | `string`     | Farewell avatar border HEX color                                                  |
| `welcomeOutMainTextContent`    | `string`     | Farewell main banner text                                                         |
| `welcomeOutMainTextColor`      | `string`     | HEX color for farewell main text                                                  |
| `welcomeOutMainTextFontFamily` | `string`     | Font family for farewell main text                                                |
| `welcomeOutMainTextFontWeight` | `string`     | Font weight for farewell main text                                                |
| `welcomeOutMainTextYOffset`    | `integer`    | Vertical offset for farewell main text                                            |
| `welcomeOutSubTextContent`     | `string`     | Farewell sub-text content                                                         |
| `welcomeOutSubTextColor`       | `string`     | HEX color for farewell username sub-text                                          |
| `welcomeOutSubTextYOffset`     | `integer`    | Farewell sub-text vertical offset                                                 |
| `welcomeOutBorderColor`        | `string`     | Farewell banner border HEX color                                                  |
| `welcomeOutBorderWidth`        | `integer`    | Farewell banner border width                                                      |
| **`welcomeOutLayout`**         | `JSON\|null` | `null` → CV2 banner card (default); `{ "style": "plain-text" }` → plain text only |
| `welcomeRoleId`                | `string`     | Role ID auto-assigned to new members on join                                      |
| `welcomeDmOn`                  | `boolean`    | Enable/disable DM to new members                                                  |
| `welcomeDmText`                | `string`     | DM message text. Supports placeholders                                            |

**Response:**

```json
{
  "success": true,
  "data": {
    /* updated fields, same shape as GET response */
  }
}
```

**Errors:**

| Status | Body                                                        | Condition                    |
| ------ | ----------------------------------------------------------- | ---------------------------- |
| `400`  | `{ "success": false, "error": "Invalid JSON body" }`        | Malformed request body       |
| `404`  | `{ "success": false, "error": "WelcomeSetting not found" }` | No settings record for guild |

> **Placeholder variables** supported in `welcomeInEmbedText`, `welcomeOutEmbedText`, and `welcomeDmText`:
> `{username}`, `{tag}`, `{userId}`, `{guildName}`, `{members}`, `{mention}`, `{memberCount}`, `{boosts}`, `{boostLevel}`, and more.

---

### `POST /api/welcome/:guildId/test`

Tests the welcome settings by triggering a simulated `guildMemberAdd` or `guildMemberRemove` event.

**Path Parameters:**

| Parameter | Type     | Description          |
| --------- | -------- | -------------------- |
| `guildId` | `string` | The Discord guild ID |

**Request Body:**

| Field    | Type     | Description                                                                                             |
| -------- | -------- | ------------------------------------------------------------------------------------------------------- |
| `type`   | `string` | **Required.** Must be `"in"` for welcome or `"out"` for farewell.                                       |
| `userId` | `string` | Optional. The Discord user ID to simulate the event for. Defaults to the guild owner or the bot itself. |

**Response:**

```json
{
  "success": true,
  "message": "Dispatched guildMemberAdd event for testing."
}
```

---

## Error Reference

### Standard Error Shape

Most error responses follow this shape:

```json
{ "error": "A human-readable error description" }
```

Some additionally include a `details` field with the raw error message for debugging:

```json
{
  "error": "Failed to save settings",
  "details": "SequelizeValidationError: ..."
}
```

### Common HTTP Status Codes

| Status | Meaning                                                                       |
| ------ | ----------------------------------------------------------------------------- |
| `200`  | Success                                                                       |
| `400`  | Bad request — malformed body or missing required fields                       |
| `401`  | Unauthorized — missing or invalid auth token                                  |
| `403`  | Forbidden — bot lacks Discord permissions for the operation                   |
| `404`  | Not found — resource (guild, channel, user) does not exist or is inaccessible |
| `500`  | Internal server error — unexpected error during processing                    |
| `503`  | Service unavailable — a required subsystem (e.g. metrics) is not initialized  |

---

## Reaction Roles API (`/api/reaction-roles`)

Manages reaction-role bindings. Every mutating action automatically re-edits the live Discord message (Components V2) to reflect the current state.

---

### `GET /api/reaction-roles`

List all reaction-role records with optional filters.

**Authentication:** Bearer token required.

**Query Parameters:**

| Parameter   | Type     | Description          |
| ----------- | -------- | -------------------- |
| `guildId`   | `string` | Filter by guild ID   |
| `channelId` | `string` | Filter by channel ID |
| `messageId` | `string` | Filter by message ID |

**Response:**

```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": 1,
      "guildId": "123456789012345678",
      "channelId": "111111111111111111",
      "messageId": "222222222222222222",
      "emoji": "✅",
      "roleId": "333333333333333333",
      "createdAt": "2026-01-02T00:00:00.000Z",
      "updatedAt": "2026-01-02T00:00:00.000Z"
    }
  ]
}
```

---

### `GET /api/reaction-roles/:id`

Get a single reaction-role record by primary key.

**Authentication:** Bearer token required.

**Path Parameters:**

| Parameter | Type      | Description                            |
| --------- | --------- | -------------------------------------- |
| `id`      | `integer` | Primary key of the ReactionRole record |

**Response:**

```json
{ "success": true, "data": { ... } }
```

**Error (404):**

```json
{ "success": false, "error": "ReactionRole not found" }
```

---

### `POST /api/reaction-roles`

Create a new reaction-role entry (or update existing if same `guildId + messageId + emoji` already exists).

- Validates the emoji by actually reacting to the target Discord message.
- Upserts the DB record.
- Automatically calls `refreshReactionRoleMessage` to edit the live Discord message.

**Authentication:** Bearer token required.

**Request Body:**

```json
{
  "guildId": "123456789012345678",
  "channelId": "111111111111111111",
  "messageId": "222222222222222222",
  "emoji": "🎉",
  "roleId": "444444444444444444"
}
```

| Field       | Type     | Required | Description                                               |
| ----------- | -------- | -------- | --------------------------------------------------------- |
| `guildId`   | `string` | ✅       | Discord guild ID                                          |
| `channelId` | `string` | ✅       | Channel where the target message lives                    |
| `messageId` | `string` | ✅       | Discord message ID to attach the reaction-role to         |
| `emoji`     | `string` | ✅       | Emoji to react with (unicode `✅` or custom `<:name:id>`) |
| `roleId`    | `string` | ✅       | Discord role ID to assign on reaction                     |

**Response:**

```json
{
  "success": true,
  "created": true,
  "data": {
    "id": 1,
    "guildId": "...",
    "channelId": "...",
    "messageId": "...",
    "emoji": "🎉",
    "roleId": "..."
  }
}
```

| Field     | Type      | Description                                                                    |
| --------- | --------- | ------------------------------------------------------------------------------ |
| `created` | `boolean` | `true` if a new record was inserted, `false` if an existing record was updated |

**Errors:**

| Status | Condition                    |
| ------ | ---------------------------- |
| `400`  | Missing required fields      |
| `400`  | Invalid or unsupported emoji |
| `404`  | Channel or message not found |

---

### `PATCH /api/reaction-roles/:id`

Partially update an existing reaction-role entry.

- If `emoji` is changed: removes the old bot reaction and adds the new one.
- Saves the updated record.
- Calls `refreshReactionRoleMessage` automatically.

**Authentication:** Bearer token required.

**Path Parameters:**

| Parameter | Type      | Description                            |
| --------- | --------- | -------------------------------------- |
| `id`      | `integer` | Primary key of the ReactionRole record |

**Request Body (all fields optional):**

```json
{
  "emoji": "🚀",
  "roleId": "555555555555555555",
  "channelId": "666666666666666666"
}
```

| Field       | Type     | Description                                                     |
| ----------- | -------- | --------------------------------------------------------------- |
| `emoji`     | `string` | New emoji (old bot reaction removed, new one added & validated) |
| `roleId`    | `string` | New role ID to assign on reaction                               |
| `channelId` | `string` | Updated channel ID (if the message was moved)                   |

**Response:**

```json
{ "success": true, "data": { ... } }
```

**Errors:**

| Status | Condition                     |
| ------ | ----------------------------- |
| `400`  | New emoji is invalid          |
| `404`  | ReactionRole record not found |

---

### `DELETE /api/reaction-roles/:id`

Delete a single reaction-role record.

- Removes the bot's reaction from the Discord message (best-effort).
- Destroys the DB record.
- Calls `refreshReactionRoleMessage` for the remaining entries on that message.

**Authentication:** Bearer token required.

**Path Parameters:**

| Parameter | Type      | Description                            |
| --------- | --------- | -------------------------------------- |
| `id`      | `integer` | Primary key of the ReactionRole record |

**Response:**

```json
{ "success": true, "message": "ReactionRole (id=1) deleted successfully" }
```

**Error (404):**

```json
{ "success": false, "error": "ReactionRole not found" }
```

---

### `DELETE /api/reaction-roles/message/:messageId`

Bulk-delete **all** reaction-role bindings for a specific Discord message.

- Removes every bot reaction from the message (best-effort, per-emoji).
- Destroys all matching DB records in one query.

**Authentication:** Bearer token required.

**Path Parameters:**

| Parameter   | Type     | Description        |
| ----------- | -------- | ------------------ |
| `messageId` | `string` | Discord message ID |

**Response:**

```json
{
  "success": true,
  "message": "Deleted 3 reaction role(s) for message 222222222222222222"
}
```

**Error (404):**

```json
{ "success": false, "error": "No reaction roles found for this message" }
```

---

### `POST /api/reaction-roles/message/:messageId/refresh`

Force-refresh the live Discord message for a given `messageId`. Reads all current DB records and re-edits the message with an up-to-date Components V2 container.

Useful after manual DB edits, or as a recovery action if the message got out of sync.

**Authentication:** Bearer token required.

**Path Parameters:**

| Parameter   | Type     | Description                   |
| ----------- | -------- | ----------------------------- |
| `messageId` | `string` | Discord message ID to refresh |

**Response:**

```json
{ "success": true, "message": "Message 222222222222222222 refreshed" }
```

**Error (500):**

```json
{ "success": false, "error": "..." }
```

---

## Reaction Role Panels API (`/api/reaction-roles/panels`)

Manages **Reaction Role Panels** — an advanced structured alternative to individual reaction-role bindings. Panels are ideal for the dashboard because they support:

- **Two modes**: `post_embed` (bot posts a new Components V2 embed) or `use_message` (bot attaches to an existing user message).
- **Custom layout** — full embed-builder-style control over the panel's Components V2 appearance.
- **Whitelist / Blacklist roles** — restrict who can pick up roles from a panel.
- **Channel / mode migration** — move a live panel to another channel without recreating it.
- **Bulk binding replacement** — ideal for drag-and-drop UI.
- **Emoji validation** — check an emoji without saving.
- **Panel duplication** — clone a panel to another channel.

Every mutating action automatically re-edits the live Discord message.

**All endpoints require bearer token authentication.**

---

### Layout Object

The `layout` field is an optional JSON object accepted by `POST /panels` and `PATCH /panels/:id`. When set, it controls the entire visual appearance of the panel's Components V2 message — similar to an embed builder, but rendered natively in Discord's new component system.

```json
{
  "accentColor": "#5865F2",
  "authorName": "Some Server",
  "authorIconUrl": "https://cdn.discordapp.com/icons/...",
  "authorUrl": "https://discord.gg/invite",
  "title": "🎭 Pick Your Roles",
  "titleUrl": "https://example.com",
  "description": "React below to assign yourself a role!",
  "fields": [
    { "name": "Gaming", "value": "For gamers", "inline": true },
    { "name": "Music", "value": "For music fans", "inline": true },
    {
      "name": "Announcements",
      "value": "Get pinged for important news",
      "inline": false
    }
  ],
  "imageUrl": "https://example.com/banner.png",
  "thumbnailUrl": "https://example.com/icon.png",
  "footerText": "Kythia Reaction Roles",
  "footerIconUrl": "https://example.com/footer-icon.png",
  "timestamp": "2026-03-02T16:00:00.000Z"
}
```

#### Layout Fields

| Field             | Type      | Description                                                                 |
| ----------------- | --------- | --------------------------------------------------------------------------- |
| `accentColor`     | `string`  | Hex color for the container's left-side accent bar (e.g. `"#5865F2"`)       |
| `authorName`      | `string`  | Small author line above the title, rendered as `-# text` (Discord subtext)  |
| `authorIconUrl`   | `string`  | Stored but not rendered natively in Components V2 — reserved for future use |
| `authorUrl`       | `string`  | Makes `authorName` a hyperlink                                              |
| `title`           | `string`  | Main heading, rendered as `## Title`                                        |
| `titleUrl`        | `string`  | Makes `title` a hyperlink                                                   |
| `description`     | `string`  | Body text below the title, supports full Discord markdown                   |
| `fields`          | `array`   | List of field objects (see below) — max 25 recommended                      |
| `fields[].name`   | `string`  | Field label (rendered in **bold**)                                          |
| `fields[].value`  | `string`  | Field body text                                                             |
| `fields[].inline` | `boolean` | Pair adjacent inline fields side-by-side using `\|` separator               |
| `imageUrl`        | `string`  | Large image shown at the bottom via `MediaGalleryBuilder`                   |
| `thumbnailUrl`    | `string`  | Small image shown above the author/title block                              |
| `footerText`      | `string`  | Footer line rendered as `-# text` (small subtext)                           |
| `footerIconUrl`   | `string`  | Stored but not rendered natively — reserved for future use                  |
| `timestamp`       | `string`  | ISO 8601 date appended to footer as a Discord `<t:unix:f>` timestamp tag    |

> [!NOTE]
> When `layout` is set, the panel's top-level `title` and `description` fields serve as **fallbacks** — the layout's own `title` and `description` take precedence if present.
>
> The emoji→role bindings list is always appended automatically between the fields section and the image.

---

### `GET /api/reaction-roles/panels`

List all reaction role panels for a guild, with a computed emoji binding count.

**Query Parameters:**

| Parameter | Type     | Required | Description                   |
| --------- | -------- | -------- | ----------------------------- |
| `guildId` | `string` | ✅       | Discord guild ID to filter by |

**Response:**

```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": 1,
      "guildId": "123456789012345678",
      "channelId": "111111111111111111",
      "messageId": "222222222222222222",
      "mode": "post_embed",
      "panelType": "reaction",
      "title": "🎭 Pick Your Roles",
      "description": "React below to pick up a role.",
      "whitelistRoles": [],
      "blacklistRoles": [],
      "messageType": "normal",
      "emojiCount": 3,
      "createdAt": "2026-03-02T00:00:00.000Z",
      "updatedAt": "2026-03-02T00:00:00.000Z"
    }
  ]
}
```

| Field            | Type       | Description                                                                          |
| ---------------- | ---------- | ------------------------------------------------------------------------------------ |
| `mode`           | `string`   | `"post_embed"` — bot-posted embed, or `"use_message"` — attached to existing message |
| `panelType`      | `string`   | `"reaction"` — emoji reactions, or `"dropdown"` — string select menu                 |
| `whitelistRoles` | `string[]` | Role IDs — if set, only members with at least one of these roles can use the panel   |
| `blacklistRoles` | `string[]` | Role IDs — members with any of these roles are blocked from the panel                |
| `emojiCount`     | `number`   | Computed count of emoji bindings for this panel                                      |

---

### `GET /api/reaction-roles/panels/:id`

Get a single panel by ID, including all its emoji→role bindings.

**Path Parameters:** `id` — panel primary key.

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "guildId": "...",
    "channelId": "...",
    "messageId": "...",
    "mode": "post_embed",
    "panelType": "reaction",
    "title": "🎭 Pick Your Roles",
    "description": null,
    "whitelistRoles": [],
    "blacklistRoles": [],
    "bindings": [
      {
        "id": 1,
        "emoji": "🎮",
        "roleId": "333333333333333333",
        "label": "Gamer",
        "panelId": 1
      },
      {
        "id": 2,
        "emoji": "🎵",
        "roleId": "444444444444444444",
        "label": "Musician",
        "panelId": 1
      }
    ]
  }
}
```

**Error (404):** `{ "success": false, "error": "Panel not found" }`

---

### `POST /api/reaction-roles/panels`

Create a new panel.

- **`post_embed`**: bot sends a new embed to `channelId`.
- **`use_message`**: bot attaches to an existing Discord message (validates it first).

**Request Body:**

```json
{
  "guildId": "123456789012345678",
  "channelId": "111111111111111111",
  "mode": "post_embed",
  "panelType": "reaction",
  "title": "🎭 Pick Your Roles",
  "description": "React below to pick up a role.",
  "whitelistRoles": [],
  "blacklistRoles": [],
  "messageType": "normal"
}
```

| Field            | Type       | Required            | Description                                                                         |
| ---------------- | ---------- | ------------------- | ----------------------------------------------------------------------------------- |
| `guildId`        | `string`   | ✅                  | Discord guild ID                                                                    |
| `channelId`      | `string`   | ✅                  | Channel to post/attach the panel to                                                 |
| `mode`           | `string`   | No                  | `"post_embed"` (default) or `"use_message"`                                         |
| `panelType`      | `string`   | No                  | `"reaction"` (default) or `"dropdown"`                                              |
| `messageId`      | `string`   | ✅ if `use_message` | Existing Discord message ID to attach to                                            |
| `title`          | `string`   | No                  | Panel title — used as fallback when no `layout.title` set                           |
| `description`    | `string`   | No                  | Panel description — used as fallback when no `layout.description` set               |
| `whitelistRoles` | `string[]` | No                  | Roles allowed to use this panel                                                     |
| `blacklistRoles` | `string[]` | No                  | Roles blocked from using this panel                                                 |
| `messageType`    | `string`   | No                  | Message type hint (default `"normal"`)                                              |
| `layout`         | `object`   | No                  | Custom [layout config](#layout-object) — enables full embed-builder-style rendering |

**Response (201):**

```json
{ "success": true, "data": { "id": 1, ... } }
```

**Errors:**

| Status | Condition                                      |
| ------ | ---------------------------------------------- |
| `400`  | Missing `guildId` or `channelId`               |
| `400`  | `messageId` missing when mode is `use_message` |
| `404`  | Channel or message not found                   |

---

### `PATCH /api/reaction-roles/panels/:id`

Full panel update. Handles both metadata and structural changes.

**Path Parameters:** `id` — panel primary key.

**Request Body (all optional):**

```json
{
  "title": "New Title",
  "description": "Updated description",
  "whitelistRoles": ["111111111111111111"],
  "blacklistRoles": [],
  "messageType": "normal",
  "channelId": "999999999999999999",
  "mode": "use_message",
  "panelType": "dropdown",
  "messageId": "888888888888888888"
}
```

| Field            | Type           | Description                                                                                  |
| ---------------- | -------------- | -------------------------------------------------------------------------------------------- |
| `title`          | `string`       | New panel title (fallback when no `layout.title`)                                            |
| `description`    | `string\|null` | New description (fallback when no `layout.description`)                                      |
| `whitelistRoles` | `string[]`     | Replace whitelist role list                                                                  |
| `blacklistRoles` | `string[]`     | Replace blacklist role list                                                                  |
| `messageType`    | `string`       | Message type hint                                                                            |
| `layout`         | `object\|null` | Replace [layout config](#layout-object). Pass `null` to revert to default rendering          |
| `channelId`      | `string`       | **Migrate** panel to new channel (posts new embed in `post_embed` mode, deletes old message) |
| `mode`           | `string`       | Switch between `post_embed` and `use_message`                                                |
| `panelType`      | `string`       | Switch between `"reaction"` and `"dropdown"`                                                 |
| `messageId`      | `string`       | Required when switching to `use_message` — target message to attach to                       |

> [!IMPORTANT]
> When `channelId` changes in `post_embed` mode, the bot **posts a new embed** in the target channel, **deletes the old one**, and migrates all reaction bindings automatically.

**Response:** `{ "success": true, "data": { ... } }`

---

### `DELETE /api/reaction-roles/panels/:id`

Delete a panel and all its emoji bindings. Removes bot reactions from the panel message.

**Path Parameters:** `id` — panel primary key.

**Response:** `{ "success": true, "message": "Panel 1 deleted" }`

**Error (404):** `{ "success": false, "error": "Panel not found" }`

---

### `POST /api/reaction-roles/panels/:id/emoji`

Add an emoji→role binding to a panel. Validates the emoji by reacting on the live panel message.

**Path Parameters:** `id` — panel primary key.

**Request Body:**

```json
{ "emoji": "🎮", "roleId": "333333333333333333", "label": "Gamer" }
```

| Field    | Type     | Required | Description                                           |
| -------- | -------- | -------- | ----------------------------------------------------- |
| `emoji`  | `string` | ✅       | Unicode emoji or custom `<:name:id>` emoji string     |
| `roleId` | `string` | ✅       | Discord role ID to assign on reaction                 |
| `label`  | `string` | No       | Text label for the option (used in `dropdown` panels) |

**Response:**

```json
{
  "success": true,
  "created": true,
  "data": { "id": 1, "emoji": "🎮", "roleId": "..." }
}
```

`created` is `false` if the emoji already existed (role updated instead).

**Errors:**

| Status | Condition                            |
| ------ | ------------------------------------ |
| `400`  | Invalid emoji                        |
| `404`  | Panel, channel, or message not found |

---

### `PATCH /api/reaction-roles/panels/:id/emoji/:rrId`

Edit an existing emoji→role binding. Handles emoji replacement (swaps bot reactions) or role change (DB-only).

**Path Parameters:**

| Parameter | Type      | Description                      |
| --------- | --------- | -------------------------------- |
| `id`      | `integer` | Panel primary key                |
| `rrId`    | `integer` | ReactionRole binding primary key |

**Request Body (all optional):**

```json
{ "emoji": "🚀", "roleId": "555555555555555555", "label": "Rocket User" }
```

| Field    | Type     | Description                                           |
| -------- | -------- | ----------------------------------------------------- |
| `emoji`  | `string` | New emoji (removes old bot reaction, adds new one)    |
| `roleId` | `string` | New role to assign                                    |
| `label`  | `string` | Text label for the option (used in `dropdown` panels) |

**Response:** `{ "success": true, "data": { ... } }`

**Errors:** `400` if new emoji is invalid; `404` if binding not found.

---

### `DELETE /api/reaction-roles/panels/:id/emoji/:rrId`

Remove a single emoji→role binding from a panel.

- Removes the bot reaction from the panel message (best-effort).
- Destroys the DB record.
- Refreshes the panel embed.

**Path Parameters:** `id` — panel ID, `rrId` — binding ID.

**Response:** `{ "success": true, "message": "Binding 1 removed" }`

---

### `PUT /api/reaction-roles/panels/:id/emoji`

Bulk-replace **all** emoji bindings on a panel atomically. Removes all existing reactions and bindings, then creates the new set.

Ideal for the dashboard's **drag-and-drop reorder** or full binding replacement flow.

**Path Parameters:** `id` — panel primary key.

**Request Body:**

```json
{
  "bindings": [
    { "emoji": "🎮", "roleId": "111111111111111111", "label": "Gamer" },
    { "emoji": "🎵", "roleId": "222222222222222222", "label": "Musician" },
    { "emoji": "🏆", "roleId": "333333333333333333", "label": "Champion" }
  ]
}
```

**Response:**

```json
{ "success": true, "count": 3, "data": [ ... ] }
```

> Emojis that fail validation are silently skipped. Invalid entries do NOT cause the request to fail.

---

### `POST /api/reaction-roles/panels/:id/emoji/validate`

Validate whether an emoji can be used on this panel's message — without saving anything. Useful for real-time form validation in the dashboard.

**Path Parameters:** `id` — panel primary key.

**Request Body:**

```json
{ "emoji": "🎮" }
```

**Response (valid):**

```json
{ "success": true, "valid": true }
```

**Response (invalid):**

```json
{
  "success": true,
  "valid": false,
  "error": "Cannot react with: :invalid_emoji:"
}
```

> The bot reacts and immediately removes the test reaction; no permanent side effects.

---

### `POST /api/reaction-roles/panels/:id/duplicate`

Duplicate a panel — copies all metadata and emoji bindings — to a target channel. Posts a new embed in the target channel.

**Path Parameters:** `id` — source panel primary key.

**Request Body:**

```json
{
  "channelId": "999999999999999999",
  "title": "Copy of Panel"
}
```

| Field       | Type     | Required | Description                                         |
| ----------- | -------- | -------- | --------------------------------------------------- |
| `channelId` | `string` | ✅       | Target channel for the duplicated panel             |
| `title`     | `string` | No       | Override the title (defaults to source panel title) |

**Response (201):**

```json
{ "success": true, "data": { "id": 2, "bindings": [ ... ] } }
```

**Error (404):** Source panel or target channel not found.

---

### `POST /api/reaction-roles/panels/:id/refresh`

Force-refresh the live Discord panel embed. Re-reads all current bindings from the database and re-edits the Discord message.

**Path Parameters:** `id` — panel primary key.

**Response:** `{ "success": true, "message": "Panel 1 refreshed" }`

---

## Birthday API (`/api/birthday`)

Provides full CRUD access to birthday data and per-guild birthday settings from the `birthday` addon.

**All endpoints require bearer token authentication.**

---

### `GET /api/birthday`

List all user birthdays with optional filters.

**Query Parameters:**

| Parameter | Type      | Description                  |
| --------- | --------- | ---------------------------- |
| `guildId` | `string`  | Filter by guild ID           |
| `userId`  | `string`  | Filter by user ID            |
| `month`   | `integer` | Filter by birth month (1–12) |
| `day`     | `integer` | Filter by birth day (1–31)   |

**Response:**

```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": 1,
      "guildId": "123456789012345678",
      "userId": "987654321098765432",
      "day": 15,
      "month": 3,
      "year": 2000,
      "lastCelebratedYear": 2025,
      "createdAt": "2026-01-03T00:00:00.000Z",
      "updatedAt": "2026-01-03T00:00:00.000Z"
    }
  ]
}
```

---

### `GET /api/birthday/:id`

Get a single birthday record by primary key.

**Path Parameters:**

| Parameter | Type      | Description                              |
| --------- | --------- | ---------------------------------------- |
| `id`      | `integer` | Primary key of the `UserBirthday` record |

**Response:**

```json
{ "success": true, "data": { ... } }
```

**Error (404):**

```json
{ "success": false, "error": "Birthday not found" }
```

---

### `POST /api/birthday`

Create or update a user's birthday (upsert by `guildId + userId`).

**Request Body:**

```json
{
  "guildId": "123456789012345678",
  "userId": "987654321098765432",
  "day": 15,
  "month": 3,
  "year": 2000
}
```

| Field     | Type      | Required | Description                                      |
| --------- | --------- | -------- | ------------------------------------------------ |
| `guildId` | `string`  | ✅       | Discord guild ID                                 |
| `userId`  | `string`  | ✅       | Discord user ID                                  |
| `day`     | `integer` | ✅       | Birth day (1–31)                                 |
| `month`   | `integer` | ✅       | Birth month (1–12)                               |
| `year`    | `integer` | No       | Birth year for age display. Pass `null` to clear |

**Response:**

```json
{
"success": true,
"created": true,
"data": { "id": 1, "guildId": "...", "userId": "...", "day": 15, "month": 3, "year": 2000, ... }
}
```

| Field     | Type      | Description                                                              |
| --------- | --------- | ------------------------------------------------------------------------ |
| `created` | `boolean` | `true` if a new row was inserted, `false` if an existing row was updated |

**Error (400):** Missing required fields.

---

### `PATCH /api/birthday/:id`

Partially update an existing birthday record.

**Path Parameters:**

| Parameter | Type      | Description                              |
| --------- | --------- | ---------------------------------------- |
| `id`      | `integer` | Primary key of the `UserBirthday` record |

**Request Body (all fields optional):**

```json
{ "day": 20, "month": 6, "year": 1999 }
```

| Field   | Type              | Description                                    |
| ------- | ----------------- | ---------------------------------------------- |
| `day`   | `integer`         | New birth day                                  |
| `month` | `integer`         | New birth month                                |
| `year`  | `integer \| null` | New birth year. Pass `null` to remove the year |

**Response:**

```json
{ "success": true, "data": { ... } }
```

**Error (404):**

```json
{ "success": false, "error": "Birthday not found" }
```

---

### `DELETE /api/birthday/:id`

Delete a birthday record by primary key.

**Path Parameters:**

| Parameter | Type      | Description                              |
| --------- | --------- | ---------------------------------------- |
| `id`      | `integer` | Primary key of the `UserBirthday` record |

**Response:**

```json
{ "success": true, "message": "Birthday (id=1) deleted successfully" }
```

**Error (404):**

```json
{ "success": false, "error": "Birthday not found" }
```

---

### `GET /api/birthday/settings/:guildId`

Fetch the birthday configuration for a guild.

**Path Parameters:**

| Parameter | Type     | Description      |
| --------- | -------- | ---------------- |
| `guildId` | `string` | Discord guild ID |

**Response:**

```json
{
  "success": true,
  "data": {
    "guildId": "123456789012345678",
    "channelId": "111111111111111111",
    "message": "Happy birthday {user}! 🎂",
    "roleId": "222222222222222222",
    "pingRoleId": "333333333333333333",
    "showAge": true,
    "embedColor": "#FF69B4",
    "bgUrl": "https://example.com/birthday-banner.png",
    "createdAt": "2026-01-03T00:00:00.000Z",
    "updatedAt": "2026-01-03T00:00:00.000Z"
  }
}
```

Returns `{ "success": true, "data": null }` if no settings exist for the guild yet.

| Field        | Type             | Description                                                           |
| ------------ | ---------------- | --------------------------------------------------------------------- |
| `channelId`  | `string \| null` | Channel ID for birthday announcements                                 |
| `message`    | `string \| null` | Custom announcement message. Variables: `{user}`, `{age}`, `{zodiac}` |
| `roleId`     | `string \| null` | Role to temporarily assign to the birthday user                       |
| `pingRoleId` | `string \| null` | Role to ping in the announcement                                      |
| `showAge`    | `boolean`        | Whether to display the user's age in announcements                    |
| `embedColor` | `string \| null` | Hex color for the birthday embed (e.g. `#FF69B4`)                     |
| `bgUrl`      | `string \| null` | Background image URL for the birthday banner                          |

---

### `PATCH /api/birthday/settings/:guildId`

Create or update the birthday settings for a guild. If no row exists, one is created automatically.

**Path Parameters:**

| Parameter | Type     | Description      |
| --------- | -------- | ---------------- |
| `guildId` | `string` | Discord guild ID |

**Request Body (all fields optional):**

```json
{
  "channelId": "111111111111111111",
  "message": "Happy birthday {user}! 🎉",
  "roleId": "222222222222222222",
  "pingRoleId": "333333333333333333",
  "showAge": false,
  "embedColor": "#FF69B4",
  "bgUrl": "https://example.com/banner.png"
}
```

Only keys present in the request body are applied. Unlisted keys are ignored.

**Response:**

```json
{
"success": true,
"created": false,
"data": { "guildId": "...", "channelId": "...", "showAge": false, ... }
}
```

| Field     | Type      | Description                                                                      |
| --------- | --------- | -------------------------------------------------------------------------------- |
| `created` | `boolean` | `true` if a new settings row was created, `false` if an existing row was updated |

**Error (500):**

```json
{ "success": false, "error": "..." }
```

---

## Tempvoice API (`/api/tempvoice`)

Manages the **Temporary Voice Channel** system. Three resource types:

- **Setup** — Automatically configures the "Join to Create" system (channels, category, interface).
- **`TempVoiceConfig`** — per-guild setup (trigger channel, category, control panel).
- **`TempVoiceChannel`** — a live temporary channel that was created from the trigger.

All endpoints require a bearer token.

---

### TempVoice Setup (`/api/tempvoice/setup`)

#### `POST /api/tempvoice/setup`

Automatically set up the "Join to Create" voice system for a guild. This mirrors the `/tempvoice setup` command. It will create any missing channels/categories and post the control panel interface.

**Request Body:**

| Field                   | Type     | Description                                                                |
| ----------------------- | -------- | -------------------------------------------------------------------------- |
| `guildId`               | `string` | **Required.** The Discord Guild ID.                                        |
| `triggerChannelId`      | `string` | _Optional._ Existing voice channel to use as the "Join to Create" trigger. |
| `categoryId`            | `string` | _Optional._ Existing category to house the temp channels.                  |
| `controlPanelChannelId` | `string` | _Optional._ Existing text channel to post the control panel interface.     |

**Response (200):**

```json
{
  "success": true,
  "data": {
    "guildId": "123...",
    "triggerChannelId": "456...",
    "categoryId": "789...",
    "controlPanelChannelId": "012...",
    "interfaceMessageId": "345..."
  }
}
```

---

---

### TempVoice Config (`/api/tempvoice/configs`)

#### `GET /api/tempvoice/configs/:guildId`

Fetch the tempvoice configuration for a guild.

**Path Parameters:**
| Parameter | Type | Description |
|---|---|---|
| `guildId` | `string` | Discord guild ID (primary key) |

**Response:**

```json
{
  "success": true,
  "data": {
    "guildId": "123456789012345678",
    "triggerChannelId": "111111111111111111",
    "controlPanelChannelId": "222222222222222222",
    "interfaceMessageId": "333333333333333333",
    "categoryId": "444444444444444444",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

**Error (404):** `{ "success": false, "error": "TempVoiceConfig not found" }`

#### `POST /api/tempvoice/configs`

Create or update a guild's tempvoice configuration (upsert by `guildId`).

**Request Body:**
| Field | Type | Required | Description |
|---|---|---|---|
| `guildId` | `string` | ✅ | Guild ID |
| `triggerChannelId` | `string` | ✅ | Voice channel users join to create a temp channel |
| `categoryId` | `string` | ✅ | Category ID where temp channels are created |
| `controlPanelChannelId` | `string` | No | Channel where the control panel message is posted |
| `interfaceMessageId` | `string` | No | Message ID of the control panel interface |

**Response:**

```json
{ "success": true, "created": true, "data": { ... } }
```

`created` is `true` when a new row was inserted, `false` when an existing row was updated.

**Error (400):** `{ "success": false, "error": "Missing required fields: guildId, triggerChannelId, categoryId" }`

#### `PATCH /api/tempvoice/configs/:guildId`

Partially update a guild's tempvoice configuration.

**Path Parameters:** `guildId` — guild ID.

**Request Body (all optional):**
| Field | Type | Description |
|---|---|---|
| `triggerChannelId` | `string` | New trigger channel |
| `categoryId` | `string` | New category |
| `controlPanelChannelId` | `string \| null` | New control panel channel |
| `interfaceMessageId` | `string \| null` | New message ID |

**Response:** `{ "success": true, "data": { ... } }`

#### `DELETE /api/tempvoice/configs/:guildId`

Delete a guild's tempvoice configuration.

**Response:** `{ "success": true, "message": "TempVoiceConfig deleted successfully" }`

#### `POST /api/tempvoice/configs/:guildId/refresh`

Force-refresh the control panel interface message for a guild. If the message already exists, it will be edited; otherwise, a new one will be sent and the database updated.

**Path Parameters:**
| Parameter | Type | Description |
|---|---|---|
| `guildId` | `string` | Discord guild ID |

**Response (200):**

```json
{
  "success": true,
  "message": "Interface message refreshed",
  "data": { "interfaceMessageId": "..." }
}
```

---

### TempVoice Channels (`/api/tempvoice/channels`)

Represents active temporary voice channels tracked in the database.

#### `GET /api/tempvoice/channels`

List active temporary voice channels.

**Query Parameters:**
| Parameter | Type | Description |
|---|---|---|
| `guildId` | `string` | Filter by guild |
| `ownerId` | `string` | Filter by channel owner |

**Response:**

```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "channelId": "555555555555555555",
      "guildId": "123456789012345678",
      "ownerId": "987654321098765432",
      "waitingRoomChannelId": null,
      "pendingJoinRequests": {},
      "createdAt": "2025-06-01T12:00:00.000Z",
      "updatedAt": "2025-06-01T12:00:00.000Z"
    }
  ]
}
```

#### `GET /api/tempvoice/channels/:channelId`

Get a single temp voice channel by its Discord channel ID (primary key).

**Response:** `{ "success": true, "data": { ... } }`

**Error (404):** `{ "success": false, "error": "TempVoiceChannel not found" }`

#### `PATCH /api/tempvoice/channels/:channelId`

Update a temp voice channel record.

**Request Body (all optional):**
| Field | Type | Description |
|---|---|---|
| `ownerId` | `string` | Transfer ownership |
| `waitingRoomChannelId` | `string \| null` | Associated waiting room channel |
| `pendingJoinRequests` | `object` | JSON map of pending join requests |

**Response:** `{ "success": true, "data": { ... } }`

#### `DELETE /api/tempvoice/channels/:channelId`

Delete a temp voice channel record from the database. Does **not** delete the Discord channel itself.

**Response:** `{ "success": true, "message": "TempVoiceChannel deleted successfully" }`

---

## Image API (`/api/image`)

Manages user-uploaded image records stored in the `images` table. The API operates on **database records only** — it does not handle file uploads directly; use the storage layer for that.

All endpoints require a bearer token.

#### `GET /api/image`

List image records with optional filters.

**Query Parameters:**
| Parameter | Type | Description |
|---|---|---|
| `userId` | `string` | Filter by the user who uploaded the image |
| `mimetype` | `string` | Filter by MIME type (e.g. `image/png`) |

**Response:**

```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": 1,
      "userId": "987654321098765432",
      "filename": "abc123.png",
      "originalName": "my-image.png",
      "fileId": "file_abc123",
      "storageUrl": "https://storage.example.com/abc123.png",
      "mimetype": "image/png",
      "fileSize": 204800,
      "createdAt": "2025-06-01T10:00:00.000Z",
      "updatedAt": "2025-06-01T10:00:00.000Z"
    }
  ]
}
```

#### `GET /api/image/:id`

Get a single image record by its database ID.

**Response:** `{ "success": true, "data": { ... } }`

**Error (404):** `{ "success": false, "error": "Image not found" }`

#### `POST /api/image/upload`

Upload an image file directly to the Kythia Storage server and save its metadata to the database. This mirrors the `/image add` slash command.

**Request:** `multipart/form-data`

| Field      | Type     | Description                                                                |
| ---------- | -------- | -------------------------------------------------------------------------- |
| `file`     | `File`   | **Required.** The image file to upload. Must be an image type (`image/*`). |
| `userId`   | `string` | **Required.** Discord user ID of the owner.                                |
| `fileName` | `string` | _Optional._ Override the filename on storage.                              |

**Response (201):**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "userId": "987654321098765432",
    "filename": "abc123.png",
    "originalName": "my-photo.png",
    "fileId": "file_abc123",
    "storageUrl": "https://storage.example.com/abc123.png",
    "mimetype": "image/png",
    "fileSize": 204800
  }
}
```

**Errors:**

- `400` — Missing `file` or `userId`.
- `415` — File is not an image.
- `500` — Storage server error or API key not configured.

---

#### `POST /api/image`

Create a new image record.

**Request Body:**
| Field | Type | Required | Description |
|---|---|---|---|
| `userId` | `string` | ✅ | Discord user ID of the uploader |
| `filename` | `string` | ✅ | Unique filename on storage (e.g. `abc123.png`) |
| `originalName` | `string` | ✅ | Original filename before upload |
| `fileId` | `string` | ✅ | Unique file identifier from the storage backend |
| `storageUrl` | `string` | ✅ | Full URL to access the file |
| `mimetype` | `string` | ✅ | MIME type (e.g. `image/png`, `image/webp`) |
| `fileSize` | `integer` | ✅ | File size in bytes |

**Response (201):** `{ "success": true, "data": { ... } }`

**Error (400):** Missing any required field.

#### `PATCH /api/image/:id`

Update an existing image record. Only metadata fields can be updated — `filename` and `fileId` are immutable.

**Request Body (all optional):**
| Field | Type | Description |
|---|---|---|
| `storageUrl` | `string` | New storage URL |
| `originalName` | `string` | Updated original filename |
| `mimetype` | `string` | Updated MIME type |
| `fileSize` | `integer` | Updated file size |

**Response:** `{ "success": true, "data": { ... } }`

#### `DELETE /api/image/:id`

Delete an image record from the database. Does **not** delete the file from storage.

**Response:** `{ "success": true, "message": "Image deleted successfully" }`

---

## Music Player Controls API (`/api/music/player`)

Real-time player control endpoints. These directly manipulate the live **Poru** player for a guild. After each action, a `player_update` WebSocket event is automatically emitted to all subscribed dashboard clients, keeping them in sync without polling.

> **Requires:** Bearer token. The bot must already have an active player in that guild (i.e., someone started a session via `/music play` in Discord). The API cannot create a voice connection — that requires a Discord interaction.

All endpoints share the base path `/api/music/player/:guildId`.

---

### `GET /api/music/player/:guildId`

Get the current live player state for a guild. Returns `null` data if no player is active.

**Response (active player):**

```json
{
  "success": true,
  "data": {
    "guildId": "123456789012345678",
    "status": "playing",
    "volume": 100,
    "position": 45000,
    "isLoop": { "track": false, "queue": false },
    "autoplay": false,
    "track": {
      "title": "Bohemian Rhapsody",
      "author": "Queen",
      "uri": "https://www.youtube.com/watch?v=fJ9rUzIMcZQ",
      "artworkUrl": "https://i.ytimg.com/vi/fJ9rUzIMcZQ/maxresdefault.jpg",
      "duration": 367000,
      "requester": "kenndeclouv"
    },
    "queue": [{ "title": "Take On Me", "uri": "...", "duration": 225000 }],
    "queueLength": 3
  }
}
```

**Response (no active player):**

```json
{ "success": true, "data": null, "status": "idle" }
```

---

### `POST /api/music/player/:guildId/pause`

Pause the player. Returns `409` if already paused.

**Response:** `{ "success": true, "status": "paused" }`

**Error (404):** No active player. **Error (409):** Already paused.

---

### `POST /api/music/player/:guildId/resume`

Resume the player. Returns `409` if not paused.

**Response:** `{ "success": true, "status": "playing" }`

**Error (404):** No active player. **Error (409):** Not paused.

---

### `POST /api/music/player/:guildId/skip`

Skip the currently playing track.

**Response:**

```json
{ "success": true, "skipped": "Bohemian Rhapsody" }
```

**Error (404):** No active player. **Error (409):** No track is playing.

> **Note:** The WebSocket `player_update` with `event: "trackStart"` fires automatically after a skip (via Poru's `trackStart` handler). No manual broadcast is needed.

---

### `POST /api/music/player/:guildId/stop`

Stop playback, clear the queue, and disable autoplay/loop. Triggers an idle disconnect timeout (3 min) unless 24/7 mode is enabled.

**Response:** `{ "success": true, "message": "Playback stopped and queue cleared" }`

**Error (404):** No active player.

> **Note:** The WebSocket `player_update` with `event: "playerDestroy"` fires automatically when the player is destroyed.

---

### `POST /api/music/player/:guildId/volume`

Set the playback volume.

**Request Body:**
| Field | Type | Required | Description |
|---|---|---|---|
| `level` | `integer` | ✅ | Volume level (0–200) |

**Response:** `{ "success": true, "volume": 80 }`

**Error (400):** `level` is not between 0 and 200. **Error (404):** No active player.

---

### `POST /api/music/player/:guildId/loop`

Set the loop mode.

**Request Body:**
| Field | Type | Required | Description |
|---|---|---|---|
| `mode` | `string` | ✅ | `"track"`, `"queue"`, or `"off"` |

**Response:** `{ "success": true, "loop": "track" }`

**Error (400):** Invalid mode. **Error (404):** No active player.

---

### `POST /api/music/player/:guildId/shuffle`

Shuffle the current queue. Requires at least 2 tracks in the queue.

**Response:** `{ "success": true, "message": "Queue shuffled", "queueLength": 5 }`

**Error (404):** No active player. **Error (409):** Less than 2 tracks in queue.

---

### `POST /api/music/player/:guildId/seek`

Seek to a specific position in the current track.

**Request Body:**
| Field | Type | Required | Description |
|---|---|---|---|
| `position` | `number` | ✅ | Seek position in **milliseconds** |

**Response:** `{ "success": true, "position": 90000 }`

**Error (400):** Invalid or out-of-range position. **Error (404):** No active player / no track playing.

---

### `POST /api/music/player/:guildId/back`

Go back to the previous track. Uses the in-memory track history ring buffer (`previousTracks`, up to 10 entries). Returns `409` if history is empty.

**Response:**

```json
{ "success": true }
```

**Error (404):** No active player. **Error (409):** No previous track in history.

---

### `POST /api/music/player/:guildId/autoplay`

Enable or disable autoplay. Enabling autoplay automatically disables all loop modes.

**Request Body:**
| Field | Type | Required | Description |
|---|---|---|---|
| `enabled` | `boolean` | No | If omitted, toggles the current state |

**Response:** `{ "success": true, "autoplay": true }`

**Error (404):** No active player.

---

### `POST /api/music/player/:guildId/play`

Add a track to the queue by search query or direct URI. If the player is already connected but idle, playback starts immediately.

> **Important:** This endpoint cannot start a brand-new session. The bot must already be connected to a voice channel (initiated via Discord). Use [`POST /api/music/search`](#get-apimusicSearch) to find URIs first.

**Request Body:**
| Field | Type | Required | Description |
|---|---|---|---|
| `query` | `string` | One of | Search query (e.g. `"Bohemian Rhapsody Queen"`) |
| `uri` | `string` | One of | Direct track URL (YouTube, Spotify, etc.) |
| `source` | `string` | No | Search source (e.g. `ytsearch`, `spsearch`). Defaults to `kythia.config.js` value. |

**Response (201):**

```json
{
  "success": true,
  "added": {
    "title": "Bohemian Rhapsody",
    "author": "Queen",
    "uri": "https://www.youtube.com/watch?v=fJ9rUzIMcZQ",
    "duration": 367000
  },
  "queueLength": 4
}
```

**Errors:**

- `400` — Missing `query` or `uri`.
- `404` — No active player for this guild / No tracks found.
- `503` — Lavalink is not available.

---

### WebSocket Sync After Control Actions

All player controls trigger a `player_update` WebSocket event, keeping all connected dashboard clients in sync automatically. The mechanism:

| Action                                                                   | WS trigger mechanism                                                           |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| `pause` / `resume` / `volume` / `loop` / `shuffle` / `seek` / `autoplay` | `broadcastUpdate()` called inline after the action                             |
| `skip` / `back` / `play` (when idle)                                     | `broadcastUpdate()` fires via Poru's `trackStart` event                        |
| `stop`                                                                   | `player_update` fires via the inline `playerDestroy` handler in `MusicManager` |

---

## Music WebSocket API

> **Transport:** Socket.IO (same port as HTTP, e.g. `3000`)  
> **Event name (server → client):** `player_update`  
> **Scope:** Guild-scoped rooms — you must join a room first  
> **Source:** `addons/music/helpers/MusicManager.js` → `broadcastUpdate()` + inline `playerDestroy` handler

---

### Music WS Overview

The Music addon integrates with the Kythia API's Socket.IO server to stream real-time player state to the dashboard (or any connected client). There is **no HTTP polling** needed for player state — everything is push-based.

The flow is:

1. Client connects to Socket.IO.
2. Client emits `join_guild` with a `guildId` to subscribe to that guild's room.
3. Whenever the player state changes (track start, pause, skip, etc.), the bot calls `broadcastUpdate(player, eventType)`, which emits `player_update` to all clients in that guild room.
4. The client renders the received state in the dashboard UI.

The `player_update` event is the **single unified event** for all music state changes. The `event` field inside the payload tells you what triggered the update.

---

### Connecting & Joining a Guild Room

```js
import { io } from "socket.io-client";

const socket = io("http://localhost:3000"); // Use your configured API port

// Join the guild room to start receiving player_update events
socket.emit("join_guild", "123456789012345678"); // Replace with the target guildId

// Listen for music player updates
socket.on("player_update", (payload) => {
  console.log("Player update:", payload);
  // Render the player UI based on payload
});

// Cleanup on disconnect
socket.on("disconnect", () => {
  console.log("Disconnected from Kythia API Socket.IO");
});
```

> **Note:** You only need to call `join_guild` once per session per guild. If you need to switch guilds, simply call `join_guild` again with the new `guildId`.

---

### Server → Client: `player_update`

This is the sole music event emitted by the server. It is emitted to the guild room (`io.to(guildId).emit('player_update', payload)`) in response to all significant player state changes.

---

#### Event Types

The `event` field inside the payload identifies the cause of the update:

| `event` value   | Trigger                                                       | Notes                                                              |
| --------------- | ------------------------------------------------------------- | ------------------------------------------------------------------ |
| `playerCreate`  | A new Poru player was created for the guild                   | Emitted before any track starts. Player is idle.                   |
| `trackStart`    | A new track began playing                                     | `status` will be `"playing"`, `track` is populated.                |
| `ticker`        | The global UI ticker fired (every 5 seconds)                  | Used to update the progress bar in real time. `position` advances. |
| `playerDestroy` | The player was destroyed (bot left VC, `/stop`, idle timeout) | `status` will always be `"idle"`, `track` is `null`.               |

> **Important:** The `playerDestroy` event has a slightly different payload — only `event`, `guildId`, `status: "idle"`, and `track: null` are sent. All other fields (`volume`, `position`, `isLoop`, `queue`) will **not** be present. Handle this defensively.

---

#### Full Payload Schema

For all events **except** `playerDestroy`:

```json
{
  "event": "trackStart",
  "guildId": "123456789012345678",
  "status": "playing",
  "volume": 100,
  "position": 12500,
  "isLoop": {
    "track": false,
    "queue": false
  },
  "track": {
    "title": "Never Gonna Give You Up",
    "author": "Rick Astley",
    "uri": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "artworkUrl": "https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
    "duration": 213000,
    "requester": "kenndeclouv"
  },
  "queue": [
    {
      "title": "Take On Me",
      "uri": "https://www.youtube.com/watch?v=djV11Xbc914",
      "duration": 225000
    }
  ]
}
```

For `playerDestroy`:

```json
{
  "event": "playerDestroy",
  "guildId": "123456789012345678",
  "status": "idle",
  "track": null
}
```

---

#### Track Object Schema

Present in the `track` field when a track is actively loaded. `null` when the player is idle or destroyed.

| Field        | Type             | Description                                                                                                                                              |
| ------------ | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `title`      | `string`         | Track title as returned by Lavalink/Spotify                                                                                                              |
| `author`     | `string`         | Artist/channel name                                                                                                                                      |
| `uri`        | `string`         | Full URL to the track (YouTube, Spotify, etc.)                                                                                                           |
| `artworkUrl` | `string \| null` | Artwork/thumbnail image URL. Uses `artworkUrl` first, falls back to `image`. `null` if neither exists.                                                   |
| `duration`   | `number`         | Total track duration in **milliseconds**                                                                                                                 |
| `requester`  | `string \| null` | Discord username of the person who requested the track. `"Autoplay (username)"` format if the track was added by the autoplay system. `null` if unknown. |

---

#### Queue Item Schema

The `queue` array contains up to **10** upcoming tracks (trimmed from the full queue for performance). Each item:

| Field      | Type     | Description                        |
| ---------- | -------- | ---------------------------------- |
| `title`    | `string` | Track title                        |
| `uri`      | `string` | Full URL to the track              |
| `duration` | `number` | Track duration in **milliseconds** |

> **Note:** The full queue may contain more than 10 tracks. The WebSocket only sends the first 10 to minimize payload size. Use the queue display command in Discord to see the full list.

---

#### Status Values

The `status` field describes the current player state:

| Value       | Description                                      |
| ----------- | ------------------------------------------------ |
| `"playing"` | A track is actively playing and not paused       |
| `"paused"`  | A track is loaded but temporarily paused         |
| `"idle"`    | No track is playing; player is idle or destroyed |

---

#### Per-Event Payload Examples

**`playerCreate` — New player created (idle, no track yet)**

```json
{
  "event": "playerCreate",
  "guildId": "123456789012345678",
  "status": "idle",
  "volume": 100,
  "position": 0,
  "isLoop": { "track": false, "queue": false },
  "track": null,
  "queue": []
}
```

**`trackStart` — Track started playing**

```json
{
  "event": "trackStart",
  "guildId": "123456789012345678",
  "status": "playing",
  "volume": 100,
  "position": 0,
  "isLoop": { "track": false, "queue": false },
  "track": {
    "title": "Bohemian Rhapsody",
    "author": "Queen",
    "uri": "https://www.youtube.com/watch?v=fJ9rUzIMcZQ",
    "artworkUrl": "https://i.ytimg.com/vi/fJ9rUzIMcZQ/maxresdefault.jpg",
    "duration": 367000,
    "requester": "kenndeclouv"
  },
  "queue": []
}
```

**`ticker` — Progress tick (every 5 seconds while playing)**

```json
{
  "event": "ticker",
  "guildId": "123456789012345678",
  "status": "playing",
  "volume": 100,
  "position": 45000,
  "isLoop": { "track": false, "queue": false },
  "track": {
    "title": "Bohemian Rhapsody",
    "author": "Queen",
    "uri": "https://www.youtube.com/watch?v=fJ9rUzIMcZQ",
    "artworkUrl": "https://i.ytimg.com/vi/fJ9rUzIMcZQ/maxresdefault.jpg",
    "duration": 367000,
    "requester": "kenndeclouv"
  },
  "queue": []
}
```

**`ticker` — While paused (position does NOT advance)**

```json
{
  "event": "ticker",
  "guildId": "123456789012345678",
  "status": "paused",
  "volume": 100,
  "position": 45000,
  "isLoop": { "track": false, "queue": false },
  "track": { "...same as above..." },
  "queue": []
}
```

> **Note:** The `ticker` event is **only** emitted when the player is playing and **not** paused. When paused, no ticker events are sent. Clients should freeze the playback timer when `status === "paused"`.

**`playerDestroy` — Player destroyed**

```json
{
  "event": "playerDestroy",
  "guildId": "123456789012345678",
  "status": "idle",
  "track": null
}
```

---

### Ticker Mechanism

The `MusicManager` runs a **global UI ticker** that fires every **5,000 ms** (5 seconds). On each tick:

1. It iterates over **all active Poru players** across all guilds.
2. For each player that is **playing** and **not paused**, it calls `broadcastUpdate(player, 'ticker')`.
3. If the player is within 5 seconds of the track end (`position >= duration - 5000`), the tick for that player is **skipped** to avoid jitter at track transitions.
4. The ticker also updates the Discord "Now Playing" message (progress bar edit) for channels still being actively watched.

| Property       | Value                                                 |
| -------------- | ----------------------------------------------------- |
| Interval       | 5,000 ms (5 seconds)                                  |
| Event emitted  | `player_update` with `event: "ticker"`                |
| Pause-aware    | Yes — skipped when `isPaused === true`                |
| Near-end skip  | Yes — skipped when `position >= duration - 5000`      |
| Implementation | `setTimeout`-based recursive loop (not `setInterval`) |

> The ticker is started once when the Discord client fires `clientReady`. It loops forever using `setTimeout(() => this.startUiTicker(), TICKER_INTERVAL)` at the end of each pass, ensuring it never overlaps itself even if an iteration takes longer than the interval.

---

### Player Lifecycle & Event Flow

Below is the full event flow from the WebSocket perspective:

```
User runs /music play
        │
        ▼
  poru.createConnection()
        │
        ▼
  [Poru: playerCreate]
        │
        └──► broadcastUpdate(player, 'playerCreate')
                │
                └──► emit player_update { event: 'playerCreate', status: 'idle', track: null }

Track resolves & play() is called
        │
        ▼
  [Poru: trackStart]
        │
        ├──► updateNowPlayingUI() ← sends/edits Discord message
        └──► broadcastUpdate(player, 'trackStart')
                │
                └──► emit player_update { event: 'trackStart', status: 'playing', track: {...} }

Every 5 seconds (while playing)
        │
        ▼
  startUiTicker()
        │
        └──► broadcastUpdate(player, 'ticker')
                │
                └──► emit player_update { event: 'ticker', position: <advancing>, ... }

Track ends naturally
        │
        ▼
  [Poru: trackEnd]
        │
        └──► (no direct broadcast — next event handles UI)

Queue ends (no autoplay / autoplay exhausted)
        │
        ▼
  [Poru: queueEnd]
        │
        ├──► shutdownPlayerUI() ← edits Discord message to "ended" state
        └──► (idle timeout: 3 min then player.destroy())

player.destroy() called (stop, leave, idle timeout, VC empty)
        │
        ▼
  [Poru: playerDestroy]
        │
        └──► inline emit (NOT broadcastUpdate):
                io.to(guildId).emit('player_update', {
                  event: 'playerDestroy',
                  guildId,
                  status: 'idle',
                  track: null
                })
```

> **Why is `playerDestroy` different?** The `playerDestroy` event is emitted inline (not via `broadcastUpdate`) because at destroy time the player object may be in a partially cleaned-up state. The payload is therefore minimal and always safe to read.

---

### Button Custom IDs Reference

The Discord "Now Playing" message contains interactive buttons. These IDs are relevant if you're building a dashboard that mirrors the same controls (e.g., via slash commands). They are **not** sent over WebSocket — they exist in Discord only.

**Row 1 (Primary Controls)**

| Custom ID            | Action                                      |
| -------------------- | ------------------------------------------- |
| `music_autoplay`     | Toggle autoplay on/off                      |
| `music_back`         | Go back to the previous track from history  |
| `music_pause_resume` | Toggle pause/resume                         |
| `music_skip`         | Skip the current track                      |
| `music_loop`         | Cycle loop mode (off → track → queue → off) |

**Row 2 (Secondary Controls)**

| Custom ID            | Action                                                        |
| -------------------- | ------------------------------------------------------------- |
| `music_lyrics`       | Fetch and display AI-generated lyrics for the current track   |
| `music_queue`        | Display the current queue with pagination                     |
| `music_stop`         | Stop playback, clear queue, and disconnect after idle timeout |
| `music_shuffle`      | Shuffle all tracks in the queue randomly                      |
| `music_favorite_add` | Save the current track to the user's favorites                |

**Suggestion Dropdown**

| Custom ID       | Action                                                                                                  |
| --------------- | ------------------------------------------------------------------------------------------------------- |
| `music_suggest` | A `StringSelectMenu` populated with YouTube recommended tracks. Selecting a track adds it to the queue. |

> **Permission Rules for Buttons:** A user can only use buttons if they are:
>
> 1. The bot owner, OR
> 2. A server admin (has `ManageGuild` or `Administrator`), OR
> 3. The person who requested the currently playing track.
>
> Additionally, the user **must be in the same voice channel** as the bot.

---

### Guild State (In-Memory)

The `MusicManager` maintains a `guildStates` `Map` in memory. This is **not** persisted to the database — it lives only while the process is running. The WebSocket `queue` field draws from Poru's in-memory queue, not this map.

| Property          | Type             | Description                                                                                                    |
| ----------------- | ---------------- | -------------------------------------------------------------------------------------------------------------- |
| `previousTracks`  | `Array`          | Ring buffer of the last **10** played tracks (most recent first). Used by the Back button and History command. |
| `lastPlayedTrack` | `object \| null` | Reference to the most recently started track. Used as the autoplay seed track.                                 |

This state is cleared when the player is destroyed (unless `player._247 === true`, in which case it persists for seamless 24/7 session recovery).

---

### Integration Example (Dashboard)

Here is a complete example of how a dashboard client would subscribe to and render music state:

```js
import { io } from "socket.io-client";

const API_URL = "http://localhost:3000";
const guildId = "123456789012345678";

const socket = io(API_URL);

let playerState = {
  status: "idle",
  track: null,
  queue: [],
  volume: 100,
  position: 0,
  isLoop: { track: false, queue: false },
};

// Subscribe to the guild's events
socket.on("connect", () => {
  socket.emit("join_guild", guildId);
});

socket.on("player_update", (payload) => {
  const { event, status, track, queue, volume, position, isLoop } = payload;

  // Always update status
  playerState.status = status;
  playerState.track = track;

  // Gracefully handle playerDestroy (minimal payload)
  if (event === "playerDestroy") {
    playerState.queue = [];
    playerState.position = 0;
    renderIdle();
    return;
  }

  // Update full state for all other events
  playerState.queue = queue ?? playerState.queue;
  playerState.volume = volume ?? playerState.volume;
  playerState.position = position ?? playerState.position;
  playerState.isLoop = isLoop ?? playerState.isLoop;

  if (status === "idle" || !track) {
    renderIdle();
  } else {
    renderPlayer(playerState);
  }
});

function renderPlayer(state) {
  const progressPercent = (state.position / state.track.duration) * 100;
  const elapsed = formatMs(state.position);
  const total = formatMs(state.track.duration);
  console.log(
    `[${state.status.toUpperCase()}] ${state.track.title} — ${elapsed} / ${total} (${progressPercent.toFixed(1)}%)`,
  );
  console.log(
    `  Loop: track=${state.isLoop.track}, queue=${state.isLoop.queue}`,
  );
  console.log(`  Queue: ${state.queue.length} upcoming track(s)`);
}

function renderIdle() {
  console.log("[IDLE] No track playing.");
}

function formatMs(ms) {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60)
    .toString()
    .padStart(2, "0");
  const s = (totalSec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}
```

---

## Addon Status API (`/api/addons`)

Returns the active/inactive status of every addon, derived from `kythia.config.js`. The dashboard uses this to conditionally show or hide sidebar links and feature sections.

> **Note:** Addon-specific API routes (`/api/quest`, `/api/giveaway`, `/api/pro`) also check their own addon's status. They return **503** immediately if the addon is disabled, so the dashboard can handle it gracefully without needing to pre-check.

#### `GET /api/addons`

Returns all addons ordered by: active first, then alphabetically.

**Response:**

```json
{
  "success": true,
  "summary": { "total": 24, "active": 20, "inactive": 4 },
  "addons": [
    {
      "key": "giveaway",
      "name": "Giveaway",
      "featureName": "Giveaway",
      "featureFlag": "giveawayOn",
      "active": true,
      "version": "0.9.0-beta",
      "description": "Host exciting giveaways..."
    },
    {
      "key": "store",
      "name": "Store",
      "active": false,
      ...
    }
  ]
}
```

#### `GET /api/addons/:key`

Get status for a single addon by its config key (folder name).

**Path Parameters:**
| Parameter | Type | Description |
|---|---|---|
| `key` | `string` | Addon folder key, e.g. `quest`, `giveaway`, `pro` |

**Response:** `{ "success": true, "data": { "key": "quest", "active": true, ... } }`

**Error (404):** `{ "success": false, "error": "Addon 'xyz' not found" }`

#### Addon-disabled Response (503)

When an addon-specific route is called while its addon is disabled:

```json
{
  "success": false,
  "addon": "quest",
  "active": false,
  "error": "The 'quest' addon is currently disabled. Enable it in kythia.config.js to use this API."
}
```

---

## Pro API (`/api/pro`)

Manages **Pro** addon resources: user subdomains, DNS records (Cloudflare-backed), and uptime monitors.

> **Addon Guard:** Protected by `addonGuard('pro')`.

All DNS write operations (`POST`, `PATCH`, `DELETE` on DNS records) call the **Cloudflare API** in real time and return `502` if Cloudflare rejects the request. The local database is the source of truth — Cloudflare and DB are always kept in sync.

---

### Subdomains (`/api/pro/subdomains`)

#### `GET /api/pro/subdomains`

List all subdomains. Optional filter by owner.

**Query Parameters:**
| Param | Type | Description |
|---|---|---|
| `userId` | `string` | Filter by Discord user ID |

**Response:**

```json
{
  "status": "ok",
  "count": 2,
  "data": [
    { "id": 1, "userId": "123...", "name": "myproject", "createdAt": "..." }
  ]
}
```

---

#### `GET /api/pro/subdomains/:id`

Get a single subdomain by numeric ID. Includes associated `dnsRecords`.

**Response:**

```json
{
  "status": "ok",
  "data": {
    "id": 1,
    "userId": "123456789012345678",
    "name": "myproject",
    "createdAt": "2026-03-07T00:00:00.000Z",
    "updatedAt": "2026-03-07T00:00:00.000Z",
    "dnsRecords": [
      {
        "id": 1,
        "subdomainId": 1,
        "type": "A",
        "name": "@",
        "value": "1.2.3.4",
        "cloudflareId": "cf_abc"
      }
    ]
  }
}
```

---

#### `POST /api/pro/subdomains`

Claim a new subdomain. Validates name format, forbidden names, and per-user quota.

**Request Body:**
| Field | Type | Required | Description |
|---|---|---|---|
| `userId` | `string` | ✅ | Discord user ID |
| `name` | `string` | ✅ | Subdomain label (see validation rules) |

**Name validation rules:**

- Only `a–z`, `0–9`, hyphens — 3–32 characters, no leading/trailing hyphen
- Reserved: `www`, `mail`, `api`, `bot`, `admin`, `dashboard`, `kythia`, `kyth`, `avalon`, `hyperion`, `ftp`, `smtp`, `imap`, `pop`, `ns`, `ns1`, `ns2`, `cpanel`

**Quota:** `kythiaConfig.addons.pro.maxSubdomains` (default **5** per user).

**Response (201):**

```json
{ "status": "ok", "data": { "id": 2, "userId": "...", "name": "myproject" } }
```

| Code  | Meaning                          |
| ----- | -------------------------------- |
| `201` | Subdomain created                |
| `400` | Invalid name / missing fields    |
| `409` | `CONFLICT` — name already taken  |
| `422` | `QUOTA_EXCEEDED` — user at limit |

---

#### `DELETE /api/pro/subdomains/:id`

Release a subdomain. DNS records are cascade-deleted from the **local database** only.

> ⚠️ Call `DELETE /api/pro/dns/:recordId` per-record first if you also want to remove from Cloudflare.

**Response:** `{ "status": "ok", "message": "Subdomain \"myproject\" released" }`

---

#### Subdomain Object

| Field        | Type      | Description                              |
| ------------ | --------- | ---------------------------------------- |
| `id`         | `integer` | Auto-increment PK                        |
| `userId`     | `string`  | Discord user ID                          |
| `name`       | `string`  | Unique label — FQDN is `<name>.<domain>` |
| `createdAt`  | `string`  | ISO 8601                                 |
| `updatedAt`  | `string`  | ISO 8601                                 |
| `dnsRecords` | `array`   | _(GET /:id only)_                        |

---

### DNS Records — Cloudflare-integrated

DNS mutations call `CloudflareApi` which syncs Cloudflare and the local DB atomically (with rollback). Records without a `cloudflareId` fall back to DB-only updates.

#### `GET /api/pro/subdomains/:id/dns`

List all DNS records for a subdomain.

**Response:**

```json
{
  "status": "ok",
  "subdomain": "myproject",
  "count": 2,
  "data": [
    {
      "id": 1,
      "subdomainId": 1,
      "type": "A",
      "name": "@",
      "value": "1.2.3.4",
      "cloudflareId": "cf_abc"
    },
    {
      "id": 2,
      "subdomainId": 1,
      "type": "CNAME",
      "name": "www",
      "value": "myproject.kyth.me",
      "cloudflareId": "cf_def"
    }
  ]
}
```

---

#### `POST /api/pro/subdomains/:id/dns`

Add a DNS record. **Calls Cloudflare first**, then saves to DB. On DB failure, Cloudflare record is auto-rolled back.

**Request Body:**
| Field | Type | Required | Description |
|---|---|---|---|
| `type` | `string` | ✅ | `A` \| `AAAA` \| `CNAME` \| `TXT` \| `MX` |
| `name` | `string` | ✅ | Host (`@` for root, `www`, `mail`, etc.) |
| `value` | `string` | ✅ | IP, domain, or text content |
| `priority` | `integer` | ❌ | MX priority (default 10) |

**Response (201):**

```json
{
  "status": "ok",
  "data": {
    "id": 3,
    "subdomainId": 1,
    "type": "A",
    "name": "@",
    "value": "5.6.7.8",
    "cloudflareId": "cf_xyz"
  }
}
```

| Code  | Meaning                         |
| ----- | ------------------------------- |
| `201` | Created in Cloudflare + DB      |
| `400` | Missing/invalid fields          |
| `404` | Subdomain not found             |
| `502` | Cloudflare rejected the request |

---

#### `PATCH /api/pro/dns/:recordId`

Update a record's value. Calls Cloudflare, then updates DB.

**Request Body:**
| Field | Type | Required | Description |
|---|---|---|---|
| `value` | `string` | ✅ | New content |
| `priority` | `integer` | ❌ | New MX priority |

**Response:** `{ "status": "ok", "data": { "id": 1, "value": "9.10.11.12", "..." } }`

Returns `502` if Cloudflare fails.

---

#### `DELETE /api/pro/dns/:recordId`

Delete a record from Cloudflare and DB. Handles "already deleted on CF" gracefully.

**Response:** `{ "status": "ok", "message": "DNS record (id=1) deleted from Cloudflare and database" }`

Returns `502` on non-404 Cloudflare errors.

---

#### DNS Record Object

| Field          | Type             | Description                       |
| -------------- | ---------------- | --------------------------------- |
| `id`           | `integer`        | Auto-increment PK                 |
| `subdomainId`  | `integer`        | FK → `subdomains.id`              |
| `type`         | `string`         | `A`, `AAAA`, `CNAME`, `TXT`, `MX` |
| `name`         | `string`         | Host (`@`, `www`, `mail`, etc.)   |
| `value`        | `string`         | Record content                    |
| `cloudflareId` | `string \| null` | Cloudflare internal record ID     |

---

### Monitors (`/api/pro/monitors`)

One uptime monitor per Discord user. `userId` is the primary key.

#### `GET /api/pro/monitors`

List monitors with optional filters.

**Query Params:** `?userId=` `?lastStatus=UP|DOWN|PENDING`

**Response:**

```json
{
  "status": "ok",
  "count": 1,
  "data": [
    {
      "userId": "123...",
      "urlToPing": "https://mysite.com",
      "lastStatus": "UP"
    }
  ]
}
```

---

#### `GET /api/pro/monitors/:userId`

Get one monitor.

**Error (404):** `{ "status": "error", "error": "Monitor not found", "code": "NOT_FOUND" }`

---

#### `POST /api/pro/monitors`

Create or upsert a monitor. If the user already has one, it is updated in-place and `created` is `false`.

**Request Body:**
| Field | Type | Required | Description |
|---|---|---|---|
| `userId` | `string` | ✅ | Discord user ID (PK) |
| `urlToPing` | `string` | ✅ | URL to monitor |
| `lastStatus` | `string` | ❌ | `UP` \| `DOWN` \| `PENDING` (default: `PENDING`) |

**Response (201 created / 200 updated):**

```json
{
  "status": "ok",
  "created": true,
  "data": {
    "userId": "...",
    "urlToPing": "https://mysite.com",
    "lastStatus": "PENDING"
  }
}
```

---

#### `PATCH /api/pro/monitors/:userId`

Update URL or status.

**Request Body (all optional):**
| Field | Type | Description |
|---|---|---|
| `urlToPing` | `string` | New URL to monitor |
| `lastStatus` | `string` | `UP` \| `DOWN` \| `PENDING` |

**Response:** `{ "status": "ok", "data": { ... } }`

---

#### `DELETE /api/pro/monitors/:userId`

Delete a monitor.

**Response:** `{ "status": "ok", "message": "Monitor for user 123... deleted" }`

---

#### Monitor Object

| Field        | Type     | Description                 |
| ------------ | -------- | --------------------------- |
| `userId`     | `string` | Discord user ID — PK        |
| `urlToPing`  | `string` | URL being monitored         |
| `lastStatus` | `string` | `UP` \| `DOWN` \| `PENDING` |

---

## Quest API (`/api/quest`)

Manages the **Quest Notifier** addon — servers register a channel to receive Discord Quest notifications, and the system logs which quests have already been announced to prevent duplicate posts.

All endpoints require a bearer token.

---

### Quest Configs (`/api/quest/configs`)

#### `GET /api/quest/configs`

List all quest notification configs.

**Query Parameters:**
| Parameter | Type | Description |
|---|---|---|
| `guildId` | `string` | Filter by guild ID |

**Response:**

```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "guildId": "123456789012345678",
      "channelId": "999888777666555444",
      "roleId": "111222333444555666",
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

#### `GET /api/quest/configs/:guildId`

Get the quest config for a specific guild.

**Response:** `{ "success": true, "data": { ... } }`

**Error (404):** `{ "success": false, "error": "Quest config not found" }`

#### `POST /api/quest/configs`

Set up quest notifications for a guild. The same behavior as `/quest setup` — creates a new config, or updates `channelId` and `roleId` on an existing one.

**Request Body:**
| Field | Type | Required | Description |
|---|---|---|---|
| `guildId` | `string` | ✅ | Discord guild ID (primary key) |
| `channelId` | `string` | ✅ | Text channel to post quest notifications in |
| `roleId` | `string \| null` | ❌ | Role to ping when a new quest is posted. `null` to disable pinging. |

**Response (201 created / 200 updated):**

```json
{
  "success": true,
  "created": true,
  "data": {
    "guildId": "...",
    "channelId": "...",
    "roleId": null,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

**Error (400):** Missing `guildId` or `channelId`.

#### `PATCH /api/quest/configs/:guildId`

Partially update an existing quest config.

**Request Body (all optional):**
| Field | Type | Description |
|---|---|---|
| `channelId` | `string` | New notification channel ID |
| `roleId` | `string \| null` | New role to ping. Pass `null` to clear. |

**Response:** `{ "success": true, "data": { ... } }`

**Error (404):** `{ "success": false, "error": "Quest config not found" }`

#### `DELETE /api/quest/configs/:guildId`

Remove a guild's quest notification config. The guild will stop receiving quest notifications.

**Response:** `{ "success": true, "message": "Quest config for guild (guildId=...) deleted successfully" }`

#### QuestConfig Object

| Field       | Type             | Description                                            |
| ----------- | ---------------- | ------------------------------------------------------ |
| `guildId`   | `string`         | Discord guild ID — primary key                         |
| `channelId` | `string`         | Channel ID where quest notifications are posted        |
| `roleId`    | `string \| null` | Role ID to mention when posting, or `null` if disabled |
| `createdAt` | `string`         | ISO 8601 creation timestamp                            |
| `updatedAt` | `string`         | ISO 8601 last-update timestamp                         |

---

### Quest Guild Logs (`/api/quest/logs`)

Tracks which quests have been announced in which guilds to prevent duplicate notifications. A unique constraint on `(guildId, questId)` ensures each quest is logged at most once per guild.

#### `GET /api/quest/logs`

List quest guild logs with optional filters. Results are ordered newest first.

**Query Parameters:**
| Parameter | Type | Description |
|---|---|---|
| `guildId` | `string` | Filter by guild ID |
| `questId` | `string` | Filter by quest ID |

**Response:**

```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": 1,
      "guildId": "123456789012345678",
      "questId": "quest_abc",
      "sentAt": "2025-06-01T10:00:00.000Z"
    }
  ]
}
```

#### `POST /api/quest/logs`

Record that a quest has been announced in a guild. Uses `findOrCreate` to enforce the `(guildId, questId)` uniqueness — re-posting the same quest to the same guild returns the existing log with `created: false`.

**Request Body:**
| Field | Type | Required | Description |
|---|---|---|---|
| `guildId` | `string` | ✅ | Discord guild ID |
| `questId` | `string` | ✅ | Quest identifier string |

**Response (201 created / 200 already exists):**

```json
{
  "success": true,
  "created": true,
  "data": { "id": 1, "guildId": "...", "questId": "quest_abc", "sentAt": "..." }
}
```

**Error (400):** Missing `guildId` or `questId`.

#### `DELETE /api/quest/logs/:id`

Delete a specific quest guild log entry by its integer ID. Used to reset a quest so it can be re-announced in a guild.

**Response:** `{ "success": true, "message": "Quest log (id=1) deleted successfully" }`

**Error (404):** `{ "success": false, "error": "Quest log not found" }`

#### QuestGuildLog Object

| Field     | Type      | Description                                           |
| --------- | --------- | ----------------------------------------------------- |
| `id`      | `integer` | Auto-increment primary key                            |
| `guildId` | `string`  | Discord guild ID                                      |
| `questId` | `string`  | Quest identifier (e.g. Discord's internal quest slug) |
| `sentAt`  | `string`  | ISO 8601 timestamp of when the quest was announced    |

---

## Giveaway API (`/api/giveaway`)

Manages active and ended giveaways, including the ability to trigger real-time Discord interactions and scheduling.

All endpoints require a bearer token.

---

### Giveaway Actions

These endpoints interact directly with the Discord API, the `GiveawayManager`, and the Redis scheduler to perform full lifecycle actions.

#### `POST /api/giveaway/start`

Starts a new giveaway. This will post a message to the target channel with the giveaway UI, register it in the database, and add it to the Redis scheduler.

**Request Body:**
| Field | Type | Required | Description |
|---|---|---|---|
| `guildId` | `string` | ✅ | Discord guild ID |
| `channelId` | `string` | ✅ | Channel where the giveaway will be posted |
| `hostId` | `string` | ✅ | Discord user ID of the host |
| `prize` | `string` | ✅ | Prize description |
| `winners` | `integer` | ✅ | Number of winners |
| `durationMs` | `integer` | ❌ | Duration in milliseconds (required if `durationString` is missing) |
| `durationString` | `string` | ❌ | Duration string e.g., `"1d 2h"` (required if `durationMs` is missing) |
| `color` | `string` | ❌ | Hex color for the embed |
| `roleId` | `string` | ❌ | Required role ID to join |
| `description` | `string` | ❌ | Extra description for the giveaway |

**Response (201):**

```json
{
  "success": true,
  "messageId": "...",
  "messageUrl": "...",
  "data": { ... }
}
```

#### `POST /api/giveaway/:messageId/end`

Manually ends a giveaway by its Discord message ID. This will draw winners, announce them in the channel, DM the winners, and update the giveaway message.

**Response:** `{ "success": true, "data": { ... } }`

#### `POST /api/giveaway/:messageId/cancel`

Cancels a giveaway. This removes it from the scheduler, updates the message to a cancelled state, and posts a cancellation announcement.

**Response:** `{ "success": true, "data": { ... } }`

#### `POST /api/giveaway/:messageId/reroll`

Rerolls an ended giveaway to pick new winners from the existing participants.

**Response:** `{ "success": true, "data": { "messageId": "...", "participants": 5 } }`

---

### Giveaway List / Get

#### `GET /api/giveaway`

List giveaways with optional filters. Results are ordered by `endTime` descending.

**Query Parameters:**
| Parameter | Type | Description |
|---|---|---|
| `guildId` | `string` | Filter by guild |
| `hostId` | `string` | Filter by host |
| `channelId` | `string` | Filter by channel |
| `ended` | `boolean` | `"true"` or `"false"` |

#### `GET /api/giveaway/:id`

Get a single giveaway by its database ID.

#### `GET /api/giveaway/message/:messageId`

Look up a giveaway by its Discord message ID.

---

### Participants Sub-resource

#### `GET /api/giveaway/:id/participants` | `POST /api/giveaway/:id/participants` | `DELETE /api/giveaway/:id/participants/:userId`

Manage participants for a giveaway.

---

### Customization & CRUD

#### `PATCH /api/giveaway/:id`

Update database fields for a giveaway.

> ⚠️ Patching fields like `prize` or `description` here only updates the database. To update the Discord UI, the bot usually handles this through internal manager updates.

#### `DELETE /api/giveaway/:id`

Remove a giveaway record from the database.

---

### Giveaway Object

| Field          | Type      | Description        |
| -------------- | --------- | ------------------ |
| `id`           | `integer` | Primary key        |
| `guildId`      | `string`  | Discord guild ID   |
| `channelId`    | `string`  | Channel ID         |
| `messageId`    | `string`  | Discord message ID |
| `hostId`       | `string`  | Host user ID       |
| `duration`     | `integer` | Duration in ms     |
| `winners`      | `integer` | Number of winners  |
| `prize`        | `string`  | Prize              |
| `participants` | `array`   | User IDs           |
| `ended`        | `boolean` | Status             |
| `roleId`       | `string`  | Req role           |
| `color`        | `string`  | Hex color          |
| `endTime`      | `string`  | End timestamp      |
| `description`  | `string`  | Description        |

---

## Embed Builder API (`/api/embed-builder`)

Manages **saved embed designs** — both classic Discord Embeds and Components V2 containers. All designs are persisted in the `embed_builders` database table. The API is the primary interface for the dashboard's visual embed editor; Discord slash commands (`/embed-builder`) provide a complementary Discord-native UX.

> **Live sync:** When an embed has already been sent to Discord (i.e. `messageId` is set), both the `/embed-builder edit` slash command and the `POST /resend` API endpoint will **edit the existing Discord message in-place** — no re-posting needed.

All endpoints require a bearer token.

> **Feature flag:** `embedBuilderOn` — If this addon is disabled, all routes return `503`.

---

### Embed Object

| Field             | Type             | Description                                                                           |
| ----------------- | ---------------- | ------------------------------------------------------------------------------------- |
| `id`              | `integer`        | Auto-increment primary key                                                            |
| `guildId`         | `string`         | Discord guild ID                                                                      |
| `createdBy`       | `string`         | Discord user ID of the creator                                                        |
| `name`            | `string`         | Human-readable label (unique per guild)                                               |
| `mode`            | `string`         | `"embed"` or `"components_v2"`                                                        |
| `data`            | `object`         | Full embed payload (see below)                                                        |
| `allowedMentions` | `object \| null` | Stored `allowedMentions` object (e.g. `{ "parse": [] }`). `null` = default (everyone) |
| `messageId`       | `string \| null` | Discord message ID — set after `/send`                                                |
| `channelId`       | `string \| null` | Discord channel ID — set after `/send`                                                |
| `createdAt`       | `string`         | ISO 8601 creation timestamp                                                           |
| `updatedAt`       | `string`         | ISO 8601 last-update timestamp                                                        |

#### `data` field by mode

**`mode: "embed"`** — Standard Discord embed JSON:

```json
{
  "title": "Welcome!",
  "description": "Glad to have you here.",
  "color": 5765006,
  "url": "https://example.com",
  "timestamp": true,
  "image": { "url": "https://..." },
  "thumbnail": { "url": "https://..." },
  "author": {
    "name": "Kythia",
    "icon_url": "https://...",
    "url": "https://..."
  },
  "footer": { "text": "Kythia Bot", "icon_url": "https://..." },
  "fields": [{ "name": "Field", "value": "Value", "inline": true }]
}
```

**`mode: "components_v2"`** — Raw Components V2 JSON:

```json
{
  "components": [
    {
      "type": 17,
      "accent_color": 5765006,
      "components": [
        { "type": 10, "content": "## Hello!" },
        { "type": 14, "divider": true, "spacing": 1 },
        { "type": 10, "content": "Edit me from the dashboard." }
      ]
    }
  ]
}
```

---

### Embed Builder List / Get

#### `GET /api/embed-builder`

List saved embeds with optional filters. Results are ordered by `createdAt` descending.

**Query Parameters:**
| Parameter | Type | Description |
|---|---|---|
| `guildId` | `string` | Filter by guild |
| `mode` | `string` | Filter by mode: `embed` or `components_v2` |
| `createdBy` | `string` | Filter by creator user ID |

**Response:**

```json
{
  "success": true,
  "count": 2,
  "data": [
    { "id": 1, "guildId": "123", "name": "welcome-banner", "mode": "embed", "data": { ... }, "messageId": "999", "channelId": "888", "createdAt": "...", "updatedAt": "..." }
  ]
}
```

#### `GET /api/embed-builder/:id`

Get a single saved embed by its integer database ID.

**Response:** `{ "success": true, "data": { ... } }`

**Error (404):** `{ "success": false, "error": "Embed not found" }`

---

### Embed Builder Create / Update / Delete

#### `POST /api/embed-builder`

Create a new saved embed. If `data` is omitted, a sensible default template is used.

**Request Body:**
| Field | Type | Required | Description |
|---|---|---|---|
| `guildId` | `string` | ✅ | Discord guild ID |
| `createdBy` | `string` | ✅ | Discord user ID of the creator |
| `name` | `string` | ✅ | Unique human label within this guild |
| `mode` | `string` | ❌ | `"embed"` (default) or `"components_v2"` |
| `data` | `object` | ❌ | Initial embed/components JSON (uses template if omitted) |

**Response (201):** `{ "success": true, "data": { ... } }`

**Errors:**

- `400` — Missing `guildId`, `createdBy`, or `name`; or invalid `mode`.
- `409` — An embed with this `name` already exists in the guild.

#### `PATCH /api/embed-builder/:id`

Update a saved embed's `name`, `mode`, and/or `data`. After saving, if the embed has already been sent to Discord (`messageId` is set), the live Discord message is **automatically edited in-place** — no separate `/resend` call needed.

**Request Body (all optional):**
| Field | Type | Description |
|---|---|---|
| `name` | `string` | New human label |
| `mode` | `string` | New mode: `"embed"` or `"components_v2"` |
| `data` | `object` | Full replacement embed/components JSON |
| `allowedMentions` | `string \| object` | Shorthand (`"everyone"`, `"roles"`, `"users"`, `"none"`) or a raw Discord [`AllowedMentionsOptions`](https://discord.com/developers/docs/resources/message#allowed-mentions-object) object (e.g. `{ "parse": ["roles"] }`) |

**Response:**

```json
{
  "success": true,
  "messageSynced": true,
  "messageUrl": "https://discord.com/channels/{guildId}/{channelId}/{messageId}",
  "data": { ... }
}
```

| Field           | Type             | Description                                                                                                              |
| --------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `messageSynced` | `boolean`        | `true` if the live Discord message was edited in-place; `false` if the embed hasn't been sent yet or Discord edit failed |
| `messageUrl`    | `string \| null` | Jump URL to the Discord message, or `null` if not synced                                                                 |

**Error (404):** `{ "success": false, "error": "Embed not found" }`

#### `DELETE /api/embed-builder/:id`

Delete a saved embed record.

**Query Parameters:**
| Parameter | Type | Description |
|---|---|---|
| `deleteMessage` | `boolean` | If `"true"`, also deletes the Discord message (best-effort — no error if already gone) |

**Response:** `{ "success": true, "message": "Embed \"welcome-banner\" (id=1) deleted." }`

**Error (404):** `{ "success": false, "error": "Embed not found" }`

---

### Embed Builder Send / Resend

#### `POST /api/embed-builder/:id/send`

Posts the saved embed to a Discord channel. On success, saves `messageId` and `channelId` back to the database record.

- For `mode: "embed"` — sends a standard `EmbedBuilder` message.
- For `mode: "components_v2"` — sends using `MessageFlags.IsComponentsV2`.

**Request Body:**
| Field | Type | Required | Description |
|---|---|---|---|
| `channelId` | `string` | ✅ | Target Discord channel ID |
| `allowedMentions` | `string \| object` | ❌ | Who can be pinged. Shorthand: `"everyone"` (default), `"roles"`, `"users"`, `"none"`. Or a raw [`AllowedMentionsOptions`](https://discord.com/developers/docs/resources/message#allowed-mentions-object) object. If omitted, falls back to the stored value on the record, then defaults to `everyone`. |

> **Mention shorthands:**
> | Value | Equivalent `parse` array |
> |---|---|
> | `"everyone"` | `["everyone", "roles", "users"]` |
> | `"roles"` | `["roles"]` |
> | `"users"` | `["users"]` |
> | `"none"` | `[]` (no pings) |

**Response (201):**

```json
{
  "success": true,
  "messageId": "999888777666555444",
  "messageUrl": "https://discord.com/channels/{guildId}/{channelId}/{messageId}",
  "data": { ... }
}
```

**Errors:**

- `400` — Missing `channelId`.
- `404` — Embed or channel not found.
- `422` — Components V2 embed has an empty `components` array.
- `500` — Discord API error.

#### `POST /api/embed-builder/:id/resend`

Edits the **existing** Discord message in-place with the latest `data` from the database. Use this after a `PATCH` to sync changes to Discord without re-posting.

This mirrors what the `/embed-builder edit` slash command does automatically on the Discord side — when `messageId` is set, it edits the live message rather than sending a new one.

> The embed must have been sent at least once (i.e., `messageId` and `channelId` must be set). If the original message was deleted, this returns a `404` — use `/send` to post a fresh one.

**Request Body:** _(none required)_

**Response:**

```json
{
  "success": true,
  "messageId": "999888777666555444",
  "messageUrl": "https://discord.com/channels/{guildId}/{channelId}/{messageId}",
  "data": { ... }
}
```

**Errors:**

- `404` — Embed or channel not found, or original Discord message was deleted.
- `422` — Embed has not been sent yet.

---

### Dashboard Integration Example

Typical dashboard flow for a visual embed editor:

```bash
# 1. Create a blank entry
curl -X POST http://localhost:3000/api/embed-builder \
  -H "Authorization: Bearer $SECRET" -H "Content-Type: application/json" \
  -d '{"guildId":"123","createdBy":"456","name":"welcome-banner","mode":"embed"}'
# → { "success": true, "data": { "id": 1, ... } }

# 2. Design the embed
curl -X PATCH http://localhost:3000/api/embed-builder/1 \
  -H "Authorization: Bearer $SECRET" -H "Content-Type: application/json" \
  -d '{"data":{"title":"Welcome!","description":"Glad to be here.","color":5765006}}'

# 3. Send to Discord — allowedMentions defaults to "everyone" if not supplied
curl -X POST http://localhost:3000/api/embed-builder/1/send \
  -H "Authorization: Bearer $SECRET" -H "Content-Type: application/json" \
  -d '{"channelId":"789","allowedMentions":"none"}'
# → { "success": true, "messageId": "...", "messageUrl": "https://discord.com/channels/..." }

# 4. User updates the design → PATCH then resend (edits the existing message in-place)
curl -X PATCH http://localhost:3000/api/embed-builder/1 \
  -H "Authorization: Bearer $SECRET" -H "Content-Type: application/json" \
  -d '{"data":{"title":"Welcome!","description":"Updated copy!","color":5765006}}'

curl -X POST http://localhost:3000/api/embed-builder/1/resend \
  -H "Authorization: Bearer $SECRET"
# → edits the original Discord message in-place, no duplicate posted

# 5. Delete the record (and the Discord message)
curl -X DELETE "http://localhost:3000/api/embed-builder/1?deleteMessage=true" \
  -H "Authorization: Bearer $SECRET"
```

> **Note:** The Discord slash command `/embed-builder edit` follows the same pattern automatically — after the user submits the modal, the DB is updated and, if `messageId` is set, the live Discord message is edited in-place. The reply includes a jump link to the updated message.

---

## Sticky API (`/api/sticky`)

Manages **sticky messages** — channel-pinned bot messages that are re-sent whenever new messages arrive, keeping them at the bottom of the channel.

---

### `GET /api/sticky`

Returns all sticky messages. Optionally filter by channel.

**Authentication:** Bearer token required.

**Query Parameters:**

| Parameter   | Type     | Description                                          |
| ----------- | -------- | ---------------------------------------------------- |
| `channelId` | `string` | _(Optional)_ Filter results to a specific channel ID |

**Response:**

```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": 1,
      "channelId": "111111111111111111",
      "message": "Welcome to the channel! Read the rules.",
      "messageId": "999999999999999999"
    }
  ]
}
```

| Field     | Type      | Description                       |
| --------- | --------- | --------------------------------- |
| `success` | `boolean` | Always `true`                     |
| `count`   | `number`  | Number of sticky records returned |
| `data`    | `array`   | Array of `StickyMessage` objects  |

#### StickyMessage Object

| Field       | Type             | Description                                                                  |
| ----------- | ---------------- | ---------------------------------------------------------------------------- |
| `id`        | `number`         | Auto-incremented primary key                                                 |
| `channelId` | `string`         | Discord channel snowflake ID                                                 |
| `message`   | `string`         | Content of the sticky message                                                |
| `messageId` | `string \| null` | Snowflake ID of the last sent Discord message (used for deletion on removal) |

---

### `GET /api/sticky/:id`

Returns a single sticky message by its primary key.

**Authentication:** Bearer token required.

**Path Parameters:**

| Parameter | Type     | Description                      |
| --------- | -------- | -------------------------------- |
| `id`      | `number` | The sticky message's primary key |

**Response (success):**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "channelId": "111111111111111111",
    "message": "Welcome to the channel!",
    "messageId": "999999999999999999"
  }
}
```

**Error (404):**

```json
{ "success": false, "error": "Sticky message not found" }
```

---

### `POST /api/sticky`

Creates a new sticky message record. The bot does **not** automatically post the Discord message — that is handled by the `/sticky set` Discord command. This endpoint is intended for programmatic management.

**Authentication:** Bearer token required.

**Request Body:**

```json
{
  "channelId": "111111111111111111",
  "message": "Welcome to the channel! Read the rules.",
  "messageId": "999999999999999999"
}
```

| Field       | Type     | Required | Description                   |
| ----------- | -------- | -------- | ----------------------------- |
| `channelId` | `string` | Yes      | Discord channel snowflake ID  |
| `message`   | `string` | Yes      | Content of the sticky message |

**Response (success):**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "channelId": "...",
    "message": "...",
    "messageId": "999999999999999999"
  }
}
```

> The bot immediately sends the sticky message to Discord and stores the returned `messageId` on the record.

**Errors:**

| Status | Body                                                                                | Condition                         |
| ------ | ----------------------------------------------------------------------------------- | --------------------------------- |
| `400`  | `{ "success": false, "error": "Missing required fields (channelId, message)" }`     | Missing required body fields      |
| `404`  | `{ "success": false, "error": "Channel not found or bot cannot access it." }`       | Channel not in bot's cache        |
| `409`  | `{ "success": false, "error": "A sticky message already exists in this channel." }` | Duplicate sticky for this channel |
| `500`  | `{ "success": false, "error": "Error message detail" }`                             | Discord or database error         |

---

### `PATCH /api/sticky/:id`

Partially updates a sticky message record. Only the fields provided in the request body are updated.

**Authentication:** Bearer token required.

**Path Parameters:**

| Parameter | Type     | Description                      |
| --------- | -------- | -------------------------------- |
| `id`      | `number` | The sticky message's primary key |

**Request Body:** _(any subset of StickyMessage fields)_

```json
{
  "message": "Updated sticky message content!"
}
```

**Response (success):**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "channelId": "...",
    "message": "Updated sticky message content!",
    "messageId": "..."
  }
}
```

**Errors:**

| Status | Body                                                        | Condition                     |
| ------ | ----------------------------------------------------------- | ----------------------------- |
| `404`  | `{ "success": false, "error": "Sticky message not found" }` | No record with the given `id` |
| `500`  | `{ "success": false, "error": "..." }`                      | Database error                |

---

### `DELETE /api/sticky/:id`

Deletes a sticky message record from the database. This fires the model's `individualHooks`, which triggers the `StickyMessageHandler` to delete the associated Discord message from the channel automatically.

**Authentication:** Bearer token required.

**Path Parameters:**

| Parameter | Type     | Description                      |
| --------- | -------- | -------------------------------- |
| `id`      | `number` | The sticky message's primary key |

**Response (success):**

```json
{ "success": true, "message": "Sticky message deleted successfully" }
```

**Errors:**

| Status | Body                                                        | Condition                     |
| ------ | ----------------------------------------------------------- | ----------------------------- |
| `404`  | `{ "success": false, "error": "Sticky message not found" }` | No record with the given `id` |
| `500`  | `{ "success": false, "error": "..." }`                      | Database error                |

---

## Leveling API (`/api/leveling`)

Full CRUD for the per-guild, per-user leveling system. XP/level calculations use the guild's configured curve, multiplier, and max level. All leveling configuration — XP gain, curves, visual customization, role rewards, channel settings — is stored in the dedicated **`leveling_settings`** table and managed via `/api/leveling/:guildId/settings`.

> **Addon Guard:** Automatically protected by `addonGuard('leveling')` — the `leveling` addon must be enabled.

**Leveling curves:** `linear` (default), `exponential`, `constant`

---

### `GET /api/leveling/:guildId/settings`

Fetch all leveling settings for a guild: XP rates, curve, role rewards, visual customization, and more.

**Authentication:** Bearer token required.

**Path Parameters:**

| Parameter | Type     | Description                |
| --------- | -------- | -------------------------- |
| `guildId` | `string` | Discord guild snowflake ID |

**Response:**

```json
{
  "success": true,
  "data": {
    "guildId": "987654321098765432",
    "levelingCurve": "linear",
    "levelingMultiplier": 1.0,
    "levelingMaxLevel": null,
    "messageXpEnabled": true,
    "messageXpMin": 15,
    "messageXpMax": 25,
    "messageXpCooldown": 60,
    "voiceXpEnabled": true,
    "levelingChannelId": "123456789012345678",
    "levelingImageEnabled": true,
    "roleRewards": [],
    "levelingBackgroundUrl": null,
    "levelingBorderColor": null,
    "levelingBarColor": null,
    "levelingUsernameColor": null,
    "levelingTagColor": null,
    "levelingAccentColor": null
  }
}
```

> If no settings row exists for the guild, returns `{}` as `data`. All values fall back to bot-wide defaults at runtime.

**Errors:**

| Status | Body                                   | Condition      |
| ------ | -------------------------------------- | -------------- |
| `500`  | `{ "success": false, "error": "..." }` | Database error |

---

### `PATCH /api/leveling/:guildId/settings`

Create or update the `leveling_settings` row for a guild. Performs an upsert — if no row exists it is created automatically.

**Authentication:** Bearer token required.

**Path Parameters:**

| Parameter | Type     | Description                |
| --------- | -------- | -------------------------- |
| `guildId` | `string` | Discord guild snowflake ID |

**Request Body** _(all fields optional):_

#### XP Gain

| Field                   | Type      | Default    | Description                                    |
| ----------------------- | --------- | ---------- | ---------------------------------------------- |
| `messageXpEnabled`      | `boolean` | `true`     | Enable XP from messages                        |
| `messageXpMode`         | `string`  | `"random"` | `"random"`, `"per_word"`, or `"fixed"`         |
| `messageXpMin`          | `number`  | `15`       | Min XP per message                             |
| `messageXpMax`          | `number`  | `25`       | Max XP per message                             |
| `messageXpCooldown`     | `number`  | `60`       | Cooldown in seconds between message XP awards  |
| `voiceXpEnabled`        | `boolean` | `true`     | Enable XP from voice activity                  |
| `voiceXpMin`            | `number`  | `15`       | Min XP per voice tick                          |
| `voiceXpMax`            | `number`  | `40`       | Max XP per voice tick                          |
| `voiceXpCooldown`       | `number`  | `180`      | Cooldown in seconds between voice XP ticks     |
| `voiceMinMembers`       | `number`  | `2`        | Minimum non-bot members in VC to earn XP       |
| `voiceAntiAfk`          | `boolean` | `true`     | Skip XP for deafened users                     |
| `reactionXpEnabled`     | `boolean` | `false`    | Enable XP from reactions                       |
| `reactionXpAward`       | `string`  | `"both"`   | `"none"`, `"both"`, `"author"`, or `"reactor"` |
| `reactionXpMin`         | `number`  | `1`        | Min XP per reaction                            |
| `reactionXpMax`         | `number`  | `5`        | Max XP per reaction                            |
| `reactionXpCooldown`    | `number`  | `10`       | Reaction XP cooldown in seconds                |
| `threadXpEnabled`       | `boolean` | `true`     | Award XP in threads                            |
| `forumXpEnabled`        | `boolean` | `true`     | Award XP in forum posts                        |
| `textInVoiceXpEnabled`  | `boolean` | `true`     | Award XP for text in voice channels            |
| `slashCommandXpEnabled` | `boolean` | `true`     | Award XP when using slash commands             |

#### Curve & Level Cap

| Field                | Type           | Default    | Description                                  |
| -------------------- | -------------- | ---------- | -------------------------------------------- |
| `levelingCurve`      | `string`       | `"linear"` | `"linear"`, `"exponential"`, or `"constant"` |
| `levelingMultiplier` | `number`       | `1.0`      | Global XP multiplier                         |
| `levelingMaxLevel`   | `number\|null` | `null`     | Max level cap (`null` = unlimited)           |

#### Boosters & Restrictions

| Field             | Type      | Description                      |
| ----------------- | --------- | -------------------------------- |
| `xpBoosters`      | `array`   | XP booster role/user configs     |
| `channelBoosters` | `array`   | Channel-specific XP multipliers  |
| `stackBoosters`   | `boolean` | Stack multiple boosters          |
| `noXpChannels`    | `array`   | Channel IDs where XP is disabled |
| `noXpRoles`       | `array`   | Role IDs that block XP gain      |
| `autoResetXp`     | `boolean` | Auto-reset XP periodically       |

#### Role Rewards

| Field             | Type      | Description                                             |
| ----------------- | --------- | ------------------------------------------------------- |
| `roleRewards`     | `array`   | `[{ level: number, role: string }]` role reward entries |
| `roleRewardStack` | `boolean` | Keep previous role rewards on level-up                  |

#### Level-Up Notification

| Field                  | Type           | Default                  | Description                                                  |
| ---------------------- | -------------- | ------------------------ | ------------------------------------------------------------ |
| `levelingChannelId`    | `string\|null` | `null`                   | Channel to send level-up notifications (null = same channel) |
| `levelingMessage`      | `string`       | `"GG {user.mention}..."` | Custom level-up message template                             |
| `levelingImageEnabled` | `boolean`      | `true`                   | Include profile image in level-up notification               |

#### Visual Customization (Profile Card & Notification Image)

| Field                   | Type           | Default | Description                                                   |
| ----------------------- | -------------- | ------- | ------------------------------------------------------------- |
| `levelingBackgroundUrl` | `string\|null` | `null`  | Custom background image URL (null = bot default)              |
| `levelingBorderColor`   | `string\|null` | `null`  | Hex color for avatar border (null = `kythiaConfig.bot.color`) |
| `levelingBarColor`      | `string\|null` | `null`  | Hex color for XP progress bar                                 |
| `levelingUsernameColor` | `string\|null` | `null`  | Hex color for username text (null = `#FFFFFF`)                |
| `levelingTagColor`      | `string\|null` | `null`  | Hex color for level tag/label                                 |
| `levelingAccentColor`   | `string\|null` | `null`  | Hex color for the Discord container accent stripe             |

**Request Body Example:**

```json
{
  "levelingCurve": "exponential",
  "levelingMultiplier": 1.5,
  "levelingMaxLevel": 100,
  "levelingChannelId": "123456789012345678",
  "levelingBackgroundUrl": "https://example.com/guild-bg.png",
  "levelingBorderColor": "#ff6b6b",
  "levelingBarColor": "#ff6b6b",
  "levelingAccentColor": "#ff6b6b",
  "roleRewards": [
    { "level": 5, "role": "111111111111111111" },
    { "level": 10, "role": "222222222222222222" }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    /* full updated settings object */
  }
}
```

**Errors:**

| Status | Body                                                 | Condition         |
| ------ | ---------------------------------------------------- | ----------------- |
| `400`  | `{ "success": false, "error": "Invalid JSON body" }` | Malformed request |
| `500`  | `{ "success": false, "error": "..." }`               | Database error    |

---

### `GET /api/leveling/:guildId`

Get the leveling leaderboard for a guild, sorted by level then XP descending.

**Authentication:** Bearer token required.

**Path Parameters:**

| Parameter | Type     | Description                |
| --------- | -------- | -------------------------- |
| `guildId` | `string` | Discord guild snowflake ID |

**Query Parameters:**

| Parameter | Type     | Default | Description                  |
| --------- | -------- | ------- | ---------------------------- |
| `page`    | `number` | `1`     | Page number                  |
| `limit`   | `number` | `50`    | Results per page (max `200`) |

**Response:**

```json
{
  "success": true,
  "count": 312,
  "page": 1,
  "totalPages": 7,
  "data": [
    {
      "rank": 1,
      "userId": "123456789012345678",
      "level": 42,
      "xp": 1840,
      "xpRequired": 88200,
      "createdAt": "2025-11-22T00:00:00.000Z",
      "updatedAt": "2026-03-01T12:00:00.000Z"
    }
  ]
}
```

| Field        | Type     | Description                                                     |
| ------------ | -------- | --------------------------------------------------------------- |
| `rank`       | `number` | Position in the leaderboard (1-indexed, continues across pages) |
| `userId`     | `string` | Discord user snowflake ID                                       |
| `level`      | `number` | Current level                                                   |
| `xp`         | `number` | XP within the current level                                     |
| `xpRequired` | `number` | XP needed to reach the next level                               |

**Errors:**

| Status | Body                                   | Condition      |
| ------ | -------------------------------------- | -------------- |
| `500`  | `{ "success": false, "error": "..." }` | Database error |

---

### `GET /api/leveling/:guildId/:userId`

Get a single user's leveling data in a guild, including their current rank.

**Authentication:** Bearer token required.

**Path Parameters:**

| Parameter | Type     | Description                |
| --------- | -------- | -------------------------- |
| `guildId` | `string` | Discord guild snowflake ID |
| `userId`  | `string` | Discord user snowflake ID  |

**Response:**

```json
{
  "success": true,
  "data": {
    "userId": "123456789012345678",
    "guildId": "987654321098765432",
    "level": 42,
    "xp": 1840,
    "xpRequired": 88200,
    "rank": 3,
    "totalMembers": 312,
    "createdAt": "2025-11-22T00:00:00.000Z",
    "updatedAt": "2026-03-01T12:00:00.000Z"
  }
}
```

| Field          | Type     | Description                                 |
| -------------- | -------- | ------------------------------------------- |
| `rank`         | `number` | User's current rank in the guild            |
| `totalMembers` | `number` | Total users with leveling data in the guild |

**Errors:**

| Status | Body                                                            | Condition        |
| ------ | --------------------------------------------------------------- | ---------------- |
| `404`  | `{ "success": false, "error": "User not found in this guild" }` | No record exists |
| `500`  | `{ "success": false, "error": "..." }`                          | Database error   |

---

### `POST /api/leveling/:guildId/:userId`

Create a new leveling entry for a user in a guild. Useful to seed data or pre-set a starting level.

**Authentication:** Bearer token required.

**Path Parameters:**

| Parameter | Type     | Description                |
| --------- | -------- | -------------------------- |
| `guildId` | `string` | Discord guild snowflake ID |
| `userId`  | `string` | Discord user snowflake ID  |

**Request Body** _(all optional — defaults to level 1, xp 0):_

```json
{ "level": 5, "xp": 0 }
```

| Field   | Type     | Required | Description                                                       |
| ------- | -------- | -------- | ----------------------------------------------------------------- |
| `level` | `number` | No       | Starting level (min 1, capped at `maxLevel` if set). Default: `1` |
| `xp`    | `number` | No       | Starting XP within the level. Default: `0`                        |

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "userId": "...",
    "guildId": "...",
    "level": 5,
    "xp": 0,
    "xpRequired": 1250,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

**Errors:**

| Status | Body                                                                 | Condition             |
| ------ | -------------------------------------------------------------------- | --------------------- |
| `409`  | `{ "success": false, "error": "User already exists in this guild" }` | Record already exists |
| `500`  | `{ "success": false, "error": "..." }`                               | Database error        |

---

### `PATCH /api/leveling/:guildId/:userId`

Update a user's leveling data. The `action` field controls the update mode.

**Authentication:** Bearer token required.

**Path Parameters:**

| Parameter | Type     | Description                |
| --------- | -------- | -------------------------- |
| `guildId` | `string` | Discord guild snowflake ID |
| `userId`  | `string` | Discord user snowflake ID  |

#### Actions

| `action`    | Additional fields | Behavior                                                                              |
| ----------- | ----------------- | ------------------------------------------------------------------------------------- |
| `set-level` | `level: number`   | Set level directly, reset XP to 0 (mirrors `/leveling set`)                           |
| `add-level` | `level: number`   | Add N levels to current level, reset XP to 0 (mirrors `/leveling add`)                |
| `set-xp`    | `xp: number`      | Set total XP, recalculate level automatically (mirrors `/leveling xp-set`)            |
| `add-xp`    | `xp: number`      | Add XP to current total, recalculate level automatically (mirrors `/leveling xp-add`) |

**Request Body Examples:**

```json
{ "action": "set-level", "level": 10 }
{ "action": "add-level", "level": 3 }
{ "action": "set-xp", "xp": 50000 }
{ "action": "add-xp", "xp": 1500 }
```

> For `set-xp` and `add-xp`, the level is **automatically recalculated** using the guild's configured curve, multiplier, and max level.

**Response (success):**

```json
{
  "success": true,
  "data": {
    "userId": "123456789012345678",
    "guildId": "987654321098765432",
    "level": 12,
    "xp": 320,
    "xpRequired": 7200,
    "updatedAt": "2026-03-06T12:00:00.000Z"
  }
}
```

**Errors:**

| Status | Body                                                                 | Condition                               |
| ------ | -------------------------------------------------------------------- | --------------------------------------- |
| `400`  | `{ "success": false, "error": "Missing or invalid action..." }`      | Bad or missing `action`                 |
| `400`  | `{ "success": false, "error": "level must be a positive integer" }`  | Invalid value for set-level / add-level |
| `400`  | `{ "success": false, "error": "xp must be a non-negative integer" }` | Invalid value for set-xp                |
| `404`  | `{ "success": false, "error": "User not found in this guild" }`      | No record exists                        |
| `500`  | `{ "success": false, "error": "..." }`                               | Database error                          |

---

### `DELETE /api/leveling/:guildId/:userId`

Delete a single user's leveling record from a guild.

**Authentication:** Bearer token required.

**Path Parameters:**

| Parameter | Type     | Description                |
| --------- | -------- | -------------------------- |
| `guildId` | `string` | Discord guild snowflake ID |
| `userId`  | `string` | Discord user snowflake ID  |

**Response (success):**

```json
{
  "success": true,
  "message": "Leveling data deleted for user 123... in guild 987..."
}
```

**Errors:**

| Status | Body                                                            | Condition        |
| ------ | --------------------------------------------------------------- | ---------------- |
| `404`  | `{ "success": false, "error": "User not found in this guild" }` | No record exists |
| `500`  | `{ "success": false, "error": "..." }`                          | Database error   |

---

### `DELETE /api/leveling/:guildId`

Wipe **all** leveling records for an entire guild — full leaderboard reset.

> ⚠️ This is irreversible. All XP and level data for every member in the guild will be deleted.

**Authentication:** Bearer token required.

**Path Parameters:**

| Parameter | Type     | Description                |
| --------- | -------- | -------------------------- |
| `guildId` | `string` | Discord guild snowflake ID |

**Response (success):**

```json
{
  "success": true,
  "message": "Reset leveling data for 312 member(s) in guild 987...",
  "deleted": 312
}
```

| Field     | Type     | Description               |
| --------- | -------- | ------------------------- |
| `deleted` | `number` | Number of records removed |

**Errors:**

| Status | Body                                   | Condition      |
| ------ | -------------------------------------- | -------------- |
| `500`  | `{ "success": false, "error": "..." }` | Database error |

---

## AI Settings API (`/api/ai`)

Manage per-user personal context (facts the bot has learned) and bot personality settings for the AI addon.

> **Addon Guard:** This route is automatically protected by `addonGuard('ai')` — the `ai` addon must be enabled on the instance.

---

### Facts (`/api/ai/facts/:userId`)

#### `GET /api/ai/facts/:userId`

List all facts the bot has remembered about a specific user, with optional filtering and pagination.

**Authentication:** Bearer token required.

**Path Parameters:**

| Parameter | Type     | Description                   |
| --------- | -------- | ----------------------------- |
| `userId`  | `string` | The Discord user snowflake ID |

**Query Parameters:**

| Parameter | Type     | Default  | Description                                            |
| --------- | -------- | -------- | ------------------------------------------------------ |
| `type`    | `string` | _(none)_ | Filter by fact type (e.g. `name`, `hobby`, `location`) |
| `page`    | `number` | `1`      | Page number                                            |
| `limit`   | `number` | `50`     | Results per page (max `100`)                           |

**Available Fact Types:** `birthday`, `name`, `hobby`, `age`, `location`, `job`, `education`, `gender`, `religion`, `relationship`, `email`, `phone`, `social`, `language`, `physical`, `color`, `food`, `animal`, `movie`, `music`, `book`, `game`, `other`

**Response:**

```json
{
  "success": true,
  "count": 3,
  "page": 1,
  "totalPages": 1,
  "data": [
    {
      "id": 42,
      "userId": "123456789",
      "fact": "Loves spicy food.",
      "type": "food",
      "createdAt": "2026-03-01T10:00:00.000Z",
      "updatedAt": "2026-03-01T10:00:00.000Z"
    }
  ]
}
```

| Field        | Type      | Description                             |
| ------------ | --------- | --------------------------------------- |
| `success`    | `boolean` | `true` on success                       |
| `count`      | `number`  | Total matching facts (across all pages) |
| `page`       | `number`  | Current page                            |
| `totalPages` | `number`  | Total number of pages                   |
| `data`       | `array`   | Array of `UserFact` objects             |

**Errors:**

| Status | Body                                   | Condition      |
| ------ | -------------------------------------- | -------------- |
| `500`  | `{ "success": false, "error": "..." }` | Database error |

---

#### `POST /api/ai/facts/:userId`

Manually add a new fact for a user. The fact type is auto-classified based on its content if not explicitly provided.

**Authentication:** Bearer token required.

**Path Parameters:**

| Parameter | Type     | Description                   |
| --------- | -------- | ----------------------------- |
| `userId`  | `string` | The Discord user snowflake ID |

**Request Body:**

```json
{
  "fact": "Loves spicy food, especially rendang.",
  "type": "food"
}
```

| Field  | Type     | Required | Description                                               |
| ------ | -------- | -------- | --------------------------------------------------------- |
| `fact` | `string` | **Yes**  | The fact text to store                                    |
| `type` | `string` | No       | Fact type. Auto-classified from `fact` content if omitted |

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": 43,
    "userId": "123456789",
    "fact": "Loves spicy food, especially rendang.",
    "type": "food",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

**Errors:**

| Status | Body                                                                            | Condition                                   |
| ------ | ------------------------------------------------------------------------------- | ------------------------------------------- |
| `400`  | `{ "success": false, "error": "Missing or empty required field: fact" }`        | `fact` not provided                         |
| `409`  | `{ "success": false, "error": "Duplicate fact already exists", "data": {...} }` | Identical fact already stored for this user |
| `500`  | `{ "success": false, "error": "..." }`                                          | Database error                              |

---

#### `DELETE /api/ai/facts/:userId/:factId`

Delete a single fact by its primary key ID.

**Authentication:** Bearer token required.

**Path Parameters:**

| Parameter | Type     | Description                   |
| --------- | -------- | ----------------------------- |
| `userId`  | `string` | The Discord user snowflake ID |
| `factId`  | `number` | The fact's primary key (`id`) |

**Response (success):**

```json
{ "success": true, "message": "Fact deleted successfully" }
```

**Errors:**

| Status | Body                                              | Condition                                         |
| ------ | ------------------------------------------------- | ------------------------------------------------- |
| `404`  | `{ "success": false, "error": "Fact not found" }` | No fact with given `factId` belonging to `userId` |
| `500`  | `{ "success": false, "error": "..." }`            | Database error                                    |

---

#### `DELETE /api/ai/facts/:userId`

Clear **all** facts for a user. Useful for a full memory wipe.

**Authentication:** Bearer token required.

**Path Parameters:**

| Parameter | Type     | Description                   |
| --------- | -------- | ----------------------------- |
| `userId`  | `string` | The Discord user snowflake ID |

**Response (success):**

```json
{
  "success": true,
  "message": "Deleted 5 fact(s) for user 123456789",
  "deleted": 5
}
```

| Field     | Type      | Description               |
| --------- | --------- | ------------------------- |
| `success` | `boolean` | `true` on success         |
| `message` | `string`  | Human-readable summary    |
| `deleted` | `number`  | Number of records deleted |

**Errors:**

| Status | Body                                   | Condition      |
| ------ | -------------------------------------- | -------------- |
| `500`  | `{ "success": false, "error": "..." }` | Database error |

---

### Personality (`/api/ai/personality/:userId`)

Personality controls the conversational style the bot uses when responding to this user. The setting is stored on the user's `KythiaUser` record as `aiPersonality`.

**Available Personalities:**

| Value          | Description                                                                    |
| -------------- | ------------------------------------------------------------------------------ |
| `default`      | Follows the global config (`personaPrompt`). Stored as `null` in the database. |
| `friendly`     | Warm, casual, approachable. Shows empathy and uses informal language.          |
| `professional` | Formal and concise. Uses proper grammar and a business-like tone.              |
| `humorous`     | Witty, playful, and fun. Uses humor appropriately.                             |
| `technical`    | Detailed and precise. Provides in-depth information and explanations.          |
| `casual`       | Relaxed and laid-back. Uses very informal language.                            |

---

#### `GET /api/ai/personality/:userId`

Get the current personality setting for a user.

**Authentication:** Bearer token required.

**Path Parameters:**

| Parameter | Type     | Description                   |
| --------- | -------- | ----------------------------- |
| `userId`  | `string` | The Discord user snowflake ID |

**Response:**

```json
{
  "success": true,
  "data": {
    "userId": "123456789",
    "personality": "friendly",
    "availablePersonalities": [
      "default",
      "friendly",
      "professional",
      "humorous",
      "technical",
      "casual"
    ]
  }
}
```

| Field                    | Type     | Description                                |
| ------------------------ | -------- | ------------------------------------------ |
| `userId`                 | `string` | The user's Discord ID                      |
| `personality`            | `string` | Current personality (`"default"` if unset) |
| `availablePersonalities` | `array`  | All valid personality values               |

**Errors:**

| Status | Body                                   | Condition      |
| ------ | -------------------------------------- | -------------- |
| `500`  | `{ "success": false, "error": "..." }` | Database error |

---

#### `PATCH /api/ai/personality/:userId`

Set or change the personality for a user. Setting to `"default"` is equivalent to resetting (stores `null`).

**Authentication:** Bearer token required.

**Path Parameters:**

| Parameter | Type     | Description                   |
| --------- | -------- | ----------------------------- |
| `userId`  | `string` | The Discord user snowflake ID |

**Request Body:**

```json
{ "personality": "friendly" }
```

| Field         | Type     | Required | Description                         |
| ------------- | -------- | -------- | ----------------------------------- |
| `personality` | `string` | **Yes**  | One of the valid personality values |

**Response (success):**

```json
{
  "success": true,
  "data": { "userId": "123456789", "personality": "friendly" }
}
```

**Errors:**

| Status | Body                                                                        | Condition                 |
| ------ | --------------------------------------------------------------------------- | ------------------------- |
| `400`  | `{ "success": false, "error": "Invalid personality. Must be one of: ..." }` | Unknown personality value |
| `500`  | `{ "success": false, "error": "..." }`                                      | Database error            |

---

#### `DELETE /api/ai/personality/:userId`

Reset the personality to `default` (clears the `aiPersonality` field to `null`).

**Authentication:** Bearer token required.

**Path Parameters:**

| Parameter | Type     | Description                   |
| --------- | -------- | ----------------------------- |
| `userId`  | `string` | The Discord user snowflake ID |

**Response (success):**

```json
{
  "success": true,
  "message": "Personality reset to default",
  "data": { "userId": "123456789", "personality": "default" }
}
```

> If the user doesn't have a `KythiaUser` record yet, the endpoint returns success immediately since their personality is already effectively `default`.

**Errors:**

| Status | Body                                   | Condition      |
| ------ | -------------------------------------- | -------------- |
| `500`  | `{ "success": false, "error": "..." }` | Database error |

---

_© 2025 kenndeclouv — Kythia API v0.11.0-beta_

---

## Streak API (`/api/streak`)

Full CRUD for the per-guild, per-user daily streak system. Streak logic (claim rules, freeze behavior) mirrors the bot's `/streak` commands exactly — all without Discord side-effects (no role assignments or nickname changes via the API).

> **Addon Guard:** Automatically protected by `addonGuard('streak')` — the `streak` addon must be enabled.

**Streak Model Fields:**

| Field                  | Type       | Description                                                                                                                                      |
| ---------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `id`                   | `number`   | Primary key                                                                                                                                      |
| `userId`               | `string`   | Discord user snowflake ID                                                                                                                        |
| `guildId`              | `string`   | Discord guild snowflake ID                                                                                                                       |
| `currentStreak`        | `number`   | Current active streak (days)                                                                                                                     |
| `highestStreak`        | `number`   | All-time highest streak                                                                                                                          |
| `streakFreezes`        | `number`   | Available freeze tokens                                                                                                                          |
| `lastClaimTimestamp`   | `ISO date` | Last date the streak was claimed                                                                                                                 |
| `lastStreak`           | `number`   | Snapshot of `currentStreak` prior to reset/loss                                                                                                  |
| `lastRestoreTimestamp` | `ISO date` | Last date the user restored a lost streak                                                                                                        |
| `restoreCount`         | `number`   | Number of restores used in the current month                                                                                                     |
| `restoreMonthKey`      | `string`   | YYYY-MM key indicating which month `restoreCount` belongs to                                                                                     |
| `claimedToday`         | `boolean`  | Computed: whether already claimed **in the guild's configured timezone**                                                                         |
| `timezone`             | `string`   | The IANA timezone used to evaluate `claimedToday` and day boundaries (e.g. `"Asia/Jakarta"`). Inherits global bot timezone if not set per-guild. |

> **Timezone Note:** Each guild can configure its own `streakTimezone` via `/setting timezone`. All day-boundary calculations (`claimedToday`, claim/reset logic) use this timezone. If unset, falls back to the global bot timezone (configured in `kythia.config.js`), then UTC.

---

### `GET /api/streak/:guildId`

Get the streak leaderboard for a guild.

**Authentication:** Bearer token required.

**Path Parameters:**

| Parameter | Type     | Description                |
| --------- | -------- | -------------------------- |
| `guildId` | `string` | Discord guild snowflake ID |

**Query Parameters:**

| Parameter | Type     | Default   | Description                                                                           |
| --------- | -------- | --------- | ------------------------------------------------------------------------------------- |
| `page`    | `number` | `1`       | Page number                                                                           |
| `limit`   | `number` | `50`      | Results per page (max `200`)                                                          |
| `sort`    | `string` | `current` | Sort mode: `current` (by `currentStreak` desc) or `highest` (by `highestStreak` desc) |

**Response:**

```json
{
  "success": true,
  "count": 84,
  "page": 1,
  "totalPages": 2,
  "sort": "current",
  "timezone": "Asia/Jakarta",
  "data": [
    {
      "rank": 1,
      "userId": "123456789012345678",
      "username": "kenndeclouv",
      "avatar": "https://cdn.discordapp.com/avatars/.../avatar.webp",
      "currentStreak": 42,
      "highestStreak": 60,
      "streakFreezes": 2,
      "claimedToday": true,
      "lastClaimTimestamp": "2026-05-19T00:00:00.000Z"
    }
  ]
}
```

> `timezone` reflects the guild's configured `streakTimezone`. `claimedToday` is evaluated against this timezone.

**Errors:**

| Status | Body                                   | Condition      |
| ------ | -------------------------------------- | -------------- |
| `500`  | `{ "success": false, "error": "..." }` | Database error |

---

### `GET /api/streak/:guildId/:userId`

Get a single user's streak profile in a guild, including their current rank.

**Authentication:** Bearer token required.

**Path Parameters:**

| Parameter | Type     | Description                |
| --------- | -------- | -------------------------- |
| `guildId` | `string` | Discord guild snowflake ID |
| `userId`  | `string` | Discord user snowflake ID  |

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 7,
    "userId": "123456789012345678",
    "guildId": "987654321098765432",
    "currentStreak": 42,
    "highestStreak": 60,
    "streakFreezes": 2,
    "claimedToday": false,
    "timezone": "Asia/Jakarta",
    "lastClaimTimestamp": "2026-05-18T00:00:00.000Z",
    "rank": 1,
    "username": "kenndeclouv",
    "avatar": "https://cdn.discordapp.com/avatars/.../avatar.webp",
    "createdAt": "2025-11-24T00:00:00.000Z",
    "updatedAt": "2026-05-18T00:00:00.000Z"
  },
  "totalMembers": 84
}
```

**Errors:**

| Status | Body                                                   | Condition        |
| ------ | ------------------------------------------------------ | ---------------- |
| `404`  | `{ "success": false, "error": "Streak not found..." }` | No record exists |
| `500`  | `{ "success": false, "error": "..." }`                 | Database error   |

---

### `POST /api/streak/:guildId/:userId`

Create/initialize a streak record for a user.

**Authentication:** Bearer token required.

**Path Parameters:**

| Parameter | Type     | Description                |
| --------- | -------- | -------------------------- |
| `guildId` | `string` | Discord guild snowflake ID |
| `userId`  | `string` | Discord user snowflake ID  |

**Request Body** _(all optional — defaults to 0):_

```json
{
  "currentStreak": 5,
  "highestStreak": 10,
  "streakFreezes": 2,
  "lastClaimTimestamp": "2026-03-05T00:00:00.000Z"
}
```

| Field                | Type       | Required | Description                           |
| -------------------- | ---------- | -------- | ------------------------------------- |
| `currentStreak`      | `number`   | No       | Starting current streak. Default: `0` |
| `highestStreak`      | `number`   | No       | Starting highest streak. Default: `0` |
| `streakFreezes`      | `number`   | No       | Starting freeze count. Default: `0`   |
| `lastClaimTimestamp` | `ISO date` | No       | Last claim date. Default: `null`      |

**Response (201 Created):**

```json
{ "success": true, "data": { ...streakObject } }
```

**Errors:**

| Status | Body                                                        | Condition             |
| ------ | ----------------------------------------------------------- | --------------------- |
| `409`  | `{ "success": false, "error": "Streak already exists..." }` | Record already exists |
| `500`  | `{ "success": false, "error": "..." }`                      | Database error        |

---

### `PATCH /api/streak/:guildId/:userId`

Update a user's streak using an `action`-based approach. If the user has no record yet, it is **auto-created** (matching bot behavior).

**Authentication:** Bearer token required.

**Path Parameters:**

| Parameter | Type     | Description                |
| --------- | -------- | -------------------------- |
| `guildId` | `string` | Discord guild snowflake ID |
| `userId`  | `string` | Discord user snowflake ID  |

#### Actions

| `action`        | Additional Fields | Behavior                                                                                                             |
| --------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------- |
| `claim`         | _(none)_          | Simulate `/streak claim` — mirrors full claim logic (CONTINUE / FREEZE_USED / RESET / NEW). No Discord side effects. |
| `reset-streak`  | _(none)_          | Reset `currentStreak` to 0, snapshot to `lastStreak` and clear `lastRestoreTimestamp`                                |
| `restore`       | _(none)_          | Restore `currentStreak` from `lastStreak`. Fails if no streak to restore, already restored, or quota exceeded.       |
| `set`           | See below         | Directly set any combination of fields                                                                               |
| `add-freeze`    | `amount?: number` | Add N freeze token(s) (default: 1)                                                                                   |
| `remove-freeze` | `amount?: number` | Remove N freeze token(s), floored at 0 (default: 1)                                                                  |

**`set` Action Fields:**

| Field                | Type               | Description                                                                    |
| -------------------- | ------------------ | ------------------------------------------------------------------------------ |
| `currentStreak`      | `number`           | Set current streak directly (≥ 0)                                              |
| `highestStreak`      | `number`           | Set highest streak directly (≥ 0). Auto-updated if `currentStreak` exceeds it. |
| `streakFreezes`      | `number`           | Set freeze count directly (≥ 0)                                                |
| `lastClaimTimestamp` | `ISO date \| null` | Manually set or clear the last claim timestamp                                 |

**Request Body Examples:**

```json
{ "action": "claim" }
{ "action": "reset-streak" }
{ "action": "restore" }
{ "action": "set", "currentStreak": 30, "streakFreezes": 5 }
{ "action": "add-freeze", "amount": 3 }
{ "action": "remove-freeze", "amount": 1 }
```

**Response (success):**

```json
{
  "success": true,
  "claimStatus": "CONTINUE",
  "data": {
    "id": 7,
    "userId": "123456789012345678",
    "guildId": "987654321098765432",
    "currentStreak": 43,
    "highestStreak": 60,
    "streakFreezes": 2,
    "claimedToday": true,
    "timezone": "Asia/Jakarta",
    "lastClaimTimestamp": "2026-05-19T00:00:00.000Z",
    "createdAt": "2025-11-24T00:00:00.000Z",
    "updatedAt": "2026-05-19T00:00:00.000Z"
  }
}
```

> `claimStatus` is only present when `action` is `claim`. Values: `CONTINUE`, `FREEZE_USED`, `RESET`, `NEW`.
> Day boundaries for the `claim` action are evaluated in the guild's configured `streakTimezone`.

**Errors:**

| Status | Body                                                                                                                                       | Condition                                     |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------- |
| `400`  | `{ "success": false, "error": "Missing or invalid action..." }`                                                                            | Bad or missing `action`                       |
| `400`  | `{ "success": false, "error": "currentStreak must be a non-negative integer" }`                                                            | Invalid `set` value                           |
| `409`  | `{ "success": false, "error": "Streak already claimed today", "claimStatus": "ALREADY_CLAIMED" }`                                          | `claim` action when already claimed           |
| `409`  | `{ "success": false, "error": "No streak to restore", "restoreStatus": "NO_STREAK_TO_RESTORE", "restoreQuota": 5 }`                        | `restore` action when `lastStreak` is 0       |
| `409`  | `{ "success": false, "error": "Streak already restored for this loss", "restoreStatus": "ALREADY_RESTORED", "restoreQuota": 5 }`           | `restore` action used more than once per loss |
| `409`  | `{ "success": false, "error": "Monthly restore quota exceeded", "restoreStatus": "QUOTA_EXCEEDED", "restoreQuota": 5, "restoreCount": 5 }` | `restore` action when monthly quota hit       |
| `500`  | `{ "success": false, "error": "..." }`                                                                                                     | Database error                                |

---

### `DELETE /api/streak/:guildId/:userId`

Delete a single user's streak record.

**Authentication:** Bearer token required.

**Path Parameters:**

| Parameter | Type     | Description                |
| --------- | -------- | -------------------------- |
| `guildId` | `string` | Discord guild snowflake ID |
| `userId`  | `string` | Discord user snowflake ID  |

**Response (success):**

```json
{ "success": true, "message": "Streak deleted for user 123... in guild 987..." }
```

**Errors:**

| Status | Body                                                   | Condition        |
| ------ | ------------------------------------------------------ | ---------------- |
| `404`  | `{ "success": false, "error": "Streak not found..." }` | No record exists |
| `500`  | `{ "success": false, "error": "..." }`                 | Database error   |

---

### `DELETE /api/streak/:guildId`

Wipe **all** streak records for an entire guild.

> ⚠️ This is irreversible. All streak data for every member in the guild will be deleted.

**Authentication:** Bearer token required.

**Path Parameters:**

| Parameter | Type     | Description                |
| --------- | -------- | -------------------------- |
| `guildId` | `string` | Discord guild snowflake ID |

**Response (success):**

```json
{
  "success": true,
  "message": "Deleted 84 streak record(s) in guild 987...",
  "deleted": 84
}
```

**Errors:**

| Status | Body                                   | Condition      |
| ------ | -------------------------------------- | -------------- |
| `500`  | `{ "success": false, "error": "..." }` | Database error |

---

## Activity API (`/api/activity`)

Exposes per-guild activity statistics tracked by the **Activity addon** (`activityOn`). Tracks total messages sent and total voice time (in seconds) per member.

Activity data is stored in two tables:

- **`activity_stats`** — cumulative all-time totals per user (fast single-row lookup)
- **`activity_logs`** — daily buckets per user, one row per `(guildId, userId, date)` (used for period-filtered queries)

> **Feature flag:** `activityOn` must be enabled for the guild for data to be collected. Daily log buckets only accumulate from the point the addon is enabled — there is no retroactive historical data.

---

### `PATCH /api/activity/:guildId/toggle`

Enables or disables activity tracking for a guild. Equivalent to `/set features activity enable|disable`.

**Authentication:** Bearer token required.

**Path Parameters:**

| Parameter | Type     | Description          |
| --------- | -------- | -------------------- |
| `guildId` | `string` | The Discord guild ID |

**Request Body:**

```json
{ "enabled": true }
```

| Field     | Type      | Required | Description                          |
| --------- | --------- | -------- | ------------------------------------ |
| `enabled` | `boolean` | Yes      | `true` to enable, `false` to disable |

**Response (success):**

```json
{ "success": true, "activityOn": true }
```

**Errors:**

| Status | Body                                                | Condition                  |
| ------ | --------------------------------------------------- | -------------------------- |
| `400`  | `{ "error": "Missing or invalid 'enabled' field" }` | Body missing or wrong type |
| `500`  | `{ "error": "..." }`                                | Database error             |

---

### `GET /api/activity/:guildId`

Returns the top-N activity leaderboard for a guild. Supports time-period filtering via the `period` query param.

**Authentication:** Bearer token required.

**Path Parameters:**

| Parameter | Type     | Description          |
| --------- | -------- | -------------------- |
| `guildId` | `string` | The Discord guild ID |

**Query Parameters:**

| Parameter | Type     | Default    | Description                                      |
| --------- | -------- | ---------- | ------------------------------------------------ |
| `sort`    | `string` | `messages` | Sort key: `messages` or `voice`                  |
| `limit`   | `number` | `10`       | Number of entries to return (max `25`)           |
| `period`  | `string` | `all`      | Time period: `all`, `daily`, `weekly`, `monthly` |

**Response:**

```json
{
  "success": true,
  "guildId": "123456789012345678",
  "sort": "messages",
  "period": "weekly",
  "leaderboard": [
    {
      "rank": 1,
      "userId": "111111111111111111",
      "totalMessages": 420,
      "totalVoiceTime": 3600
    }
  ]
}
```

| Field                          | Type      | Description                                           |
| ------------------------------ | --------- | ----------------------------------------------------- |
| `success`                      | `boolean` | Always `true` on success                              |
| `guildId`                      | `string`  | The queried guild ID                                  |
| `sort`                         | `string`  | The sort key used (`messages` or `voice`)             |
| `period`                       | `string`  | The period used (`all`, `daily`, `weekly`, `monthly`) |
| `leaderboard`                  | `array`   | Top entries, sorted descending                        |
| `leaderboard[].rank`           | `number`  | 1-based rank position                                 |
| `leaderboard[].userId`         | `string`  | Discord user snowflake ID                             |
| `leaderboard[].totalMessages`  | `number`  | Messages sent in the period                           |
| `leaderboard[].totalVoiceTime` | `number`  | Voice time in seconds in the period                   |

**Errors:**

| Status | Body                                   | Condition      |
| ------ | -------------------------------------- | -------------- |
| `500`  | `{ "success": false, "error": "..." }` | Database error |

---

### `GET /api/activity/:guildId/id/:userId`

Returns the activity stats for a single user in a guild. Supports period filtering.

**Authentication:** Bearer token required.

**Path Parameters:**

| Parameter | Type     | Description          |
| --------- | -------- | -------------------- |
| `guildId` | `string` | The Discord guild ID |
| `userId`  | `string` | The Discord user ID  |

**Query Parameters:**

| Parameter | Type     | Default | Description                                      |
| --------- | -------- | ------- | ------------------------------------------------ |
| `period`  | `string` | `all`   | Time period: `all`, `daily`, `weekly`, `monthly` |

**Response:**

```json
{
  "success": true,
  "guildId": "123456789012345678",
  "userId": "111111111111111111",
  "period": "all",
  "totalMessages": 4200,
  "totalVoiceTime": 36000
}
```

| Field            | Type      | Description                         |
| ---------------- | --------- | ----------------------------------- |
| `success`        | `boolean` | Always `true` on success            |
| `guildId`        | `string`  | The queried guild ID                |
| `userId`         | `string`  | The queried user ID                 |
| `period`         | `string`  | The period used                     |
| `totalMessages`  | `number`  | Messages sent in the period         |
| `totalVoiceTime` | `number`  | Voice time in seconds in the period |

**Errors:**

| Status | Body                                                    | Condition                                   |
| ------ | ------------------------------------------------------- | ------------------------------------------- |
| `404`  | `{ "success": false, "error": "User stats not found" }` | No all-time record (only when `period=all`) |
| `500`  | `{ "success": false, "error": "..." }`                  | Database error                              |

---

### `DELETE /api/activity/:guildId/id/:userId`

Deletes the activity stats record for a single user in a guild. Also deletes all their daily log buckets.

**Authentication:** Bearer token required.

**Path Parameters:**

| Parameter | Type     | Description          |
| --------- | -------- | -------------------- |
| `guildId` | `string` | The Discord guild ID |
| `userId`  | `string` | The Discord user ID  |

**Response (success):**

```json
{ "success": true }
```

**Errors:**

| Status | Body                                                    | Condition        |
| ------ | ------------------------------------------------------- | ---------------- |
| `404`  | `{ "success": false, "error": "User stats not found" }` | No record exists |
| `500`  | `{ "success": false, "error": "..." }`                  | Database error   |

---

### `DELETE /api/activity/:guildId`

Wipes all activity stats and daily log buckets for every member in a guild.

> ⚠️ This is irreversible.

**Authentication:** Bearer token required.

**Path Parameters:**

| Parameter | Type     | Description          |
| --------- | -------- | -------------------- |
| `guildId` | `string` | The Discord guild ID |

**Response (success):**

```json
{ "success": true, "deleted": 42 }
```

| Field     | Type      | Description                     |
| --------- | --------- | ------------------------------- |
| `success` | `boolean` | Always `true`                   |
| `deleted` | `number`  | Number of all-time rows deleted |

**Errors:**

| Status | Body                                   | Condition      |
| ------ | -------------------------------------- | -------------- |
| `500`  | `{ "success": false, "error": "..." }` | Database error |

---

## Music API (`/api/music`)

Manage user playlists, favorites, and 24/7 mode configuration. Includes a **Lavalink-powered search endpoint** — use returned `uri` values to add tracks to playlists or favorites.

> **Addon Guard:** Automatically protected by `addonGuard('music')` — the `music` addon must be enabled.

> **Note:** Playback actions (play, pause, skip, queue etc.) are not exposed — they require an active Discord voice connection.

---

### `GET /api/music/search`

Search for tracks using Lavalink. Returns candidates to use as `uri` when adding to playlists/favorites.

**Authentication:** Bearer token required.

**Query Parameters:**

| Parameter | Type     | Required | Description                                                                     |
| --------- | -------- | -------- | ------------------------------------------------------------------------------- |
| `q`       | `string` | Yes      | Search query or URL                                                             |
| `limit`   | `number` | No       | Max results (1–25, default `10`)                                                |
| `source`  | `string` | No       | Search source: `ytsearch`, `spsearch`, `dzsearch` etc. Default from bot config. |

**Response:**

```json
{
  "success": true,
  "loadType": "SEARCH_RESULT",
  "playlistInfo": null,
  "data": [
    {
      "title": "Never Gonna Give You Up",
      "author": "Rick Astley",
      "length": 213000,
      "uri": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "identifier": "dQw4w9WgXcQ",
      "thumbnail": "https://...",
      "isStream": false,
      "sourceName": "youtube"
    }
  ]
}
```

**Errors:**

| Status | Body                                        | Condition        |
| ------ | ------------------------------------------- | ---------------- |
| `400`  | `{ "error": "Missing query parameter: q" }` | `q` not provided |
| `503`  | `{ "error": "Lavalink is not available" }`  | Lavalink offline |
| `500`  | `{ "error": "..." }`                        | Search error     |

---

## Playlists

### `GET /api/music/playlists/:userId`

List all playlists for a user (without tracks — use the specific endpoint for track listing).

**Response:**

```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": 1,
      "userId": "123...",
      "name": "Lofi Chill",
      "shareCode": null,
      "trackCount": 12,
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

---

### `GET /api/music/playlists/:userId/:playlistId`

Get a specific playlist with its full track list.

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "userId": "123...",
    "name": "Lofi Chill",
    "shareCode": "abc123",
    "trackCount": 2,
    "tracks": [
      {
        "id": 5,
        "playlistId": 1,
        "title": "Rainy Day",
        "author": "ChilledCow",
        "length": 180000,
        "uri": "https://...",
        "identifier": "xxx"
      }
    ]
  }
}
```

**Errors:** `404` if playlist not found or doesn't belong to user.

---

### `POST /api/music/playlists/:userId`

Create a new empty playlist.

**Request Body:**

```json
{ "name": "Lofi Chill" }
```

| Field  | Type     | Required | Description                   |
| ------ | -------- | -------- | ----------------------------- |
| `name` | `string` | Yes      | Playlist name (max 100 chars) |

**Response (201):** Returns the new playlist object.

---

### `PATCH /api/music/playlists/:userId/:playlistId`

Rename a playlist.

**Request Body:** `{ "name": "New Name" }`

**Errors:** `404` if not found, `400` if name invalid.

---

### `DELETE /api/music/playlists/:userId/:playlistId`

Delete a playlist. **Also deletes all tracks inside it** (CASCADE).

**Response:** `{ "success": true, "message": "Playlist \"Lofi Chill\" deleted" }`

---

## Playlist Tracks

### `POST /api/music/playlists/:userId/:playlistId/tracks`

Add a track to a playlist. Supports two modes:

**Mode 1 — Direct URI** (missing metadata auto-resolved via Lavalink):

```json
{
  "uri": "https://youtu.be/dQw4w9WgXcQ",
  "title": "Never...",
  "author": "Rick Astley",
  "length": 213000,
  "identifier": "dQw4w9WgXcQ"
}
```

**Mode 2 — Search query** (resolved via Lavalink, adds first result):

```json
{ "query": "never gonna give you up", "source": "ytsearch" }
```

| Field        | Mode   | Required | Description                              |
| ------------ | ------ | -------- | ---------------------------------------- |
| `uri`        | Mode 1 | Yes      | Direct track URL                         |
| `title`      | Mode 1 | No       | Auto-resolved if missing                 |
| `author`     | Mode 1 | No       | Auto-resolved if missing                 |
| `length`     | Mode 1 | No       | Duration in ms, auto-resolved if missing |
| `identifier` | Mode 1 | No       | Auto-resolved if missing                 |
| `query`      | Mode 2 | Yes      | Search query string                      |
| `source`     | Mode 2 | No       | Search source (default from bot config)  |

**Response (201):**

```json
{
  "success": true,
  "data": {
    "id": 7,
    "playlistId": 1,
    "title": "...",
    "author": "...",
    "length": 213000,
    "uri": "...",
    "identifier": "..."
  }
}
```

**Errors:**

| Status | Body                                                 | Condition                |
| ------ | ---------------------------------------------------- | ------------------------ |
| `400`  | `{ "error": "Either uri or query is required" }`     | Neither provided         |
| `404`  | `{ "error": "No tracks found for the given query" }` | Search empty             |
| `404`  | `{ "error": "Playlist not found" }`                  | Wrong user/ID            |
| `503`  | `{ "error": "Lavalink is not available" }`           | Mode 2, Lavalink offline |

---

### `DELETE /api/music/playlists/:userId/:playlistId/tracks/:trackId`

Remove a specific track from a playlist by its ID.

**Response:** `{ "success": true, "message": "Track \"Song Name\" removed from playlist" }`

**Errors:** `404` if playlist or track not found.

---

### `DELETE /api/music/playlists/:userId/:playlistId/tracks`

Clear **all** tracks from a playlist without deleting the playlist itself.

**Response:** `{ "success": true, "message": "Cleared 12 track(s) from playlist", "deleted": 12 }`

---

## Favorites

### `GET /api/music/favorites/:userId`

List all favorites for a user. Supports pagination.

**Query Parameters:** `page`, `limit` (max 200)

**Response:**

```json
{
  "success": true,
  "count": 45,
  "page": 1,
  "totalPages": 1,
  "data": [
    {
      "id": 3,
      "userId": "123...",
      "title": "Rainy Day",
      "author": "ChilledCow",
      "length": 180000,
      "uri": "https://...",
      "identifier": "xxx",
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

---

### `POST /api/music/favorites/:userId`

Add a track to favorites. Same dual-mode as playlist track add (`uri` or `query`).

> Duplicates are prevented — returns `409` if the track `identifier` already exists in user's favorites.

**Request Body:** Same as [`POST /api/music/playlists/:userId/:playlistId/tracks`](#post-apimusicplaylistsuseridplaylistidtracks)

**Response (201):** Returns the new favorite object.

**Errors:** `409` if already favorited, `404` if not found, `503` if Lavalink offline.

---

### `DELETE /api/music/favorites/:userId/:favoriteId`

Remove a specific favorite by its database ID.

**Response:** `{ "success": true, "message": "\"Song Name\" removed from favorites" }`

**Errors:** `404` if not found or doesn't belong to user.

---

### `DELETE /api/music/favorites/:userId`

Clear **all** favorites for a user.

**Response:** `{ "success": true, "message": "Cleared 45 favorite(s)", "deleted": 45 }`

---

## 24/7 Mode

### `GET /api/music/247/:guildId`

Get the 24/7 mode configuration for a guild.

**Response (enabled):**

```json
{
  "success": true,
  "enabled": true,
  "data": {
    "guildId": "987...",
    "textChannelId": "111...",
    "voiceChannelId": "222...",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

**Response (disabled):** `{ "success": true, "data": null, "enabled": false }`

---

### `PUT /api/music/247/:guildId`

Enable or configure 24/7 mode for a guild. Creates a new config or updates existing one.

**Request Body:**

```json
{ "textChannelId": "111222333", "voiceChannelId": "444555666" }
```

| Field            | Type     | Required | Description                               |
| ---------------- | -------- | -------- | ----------------------------------------- |
| `textChannelId`  | `string` | Yes      | Channel ID where music updates are posted |
| `voiceChannelId` | `string` | Yes      | Voice channel ID to stay in 24/7          |

**Response:** `200` if updated, `201` if newly created. Returns the config object.

**Errors:** `400` if fields are missing.

---

### `DELETE /api/music/247/:guildId`

Disable 24/7 mode for a guild (deletes the config record).

**Response:** `{ "success": true, "message": "24/7 mode disabled for guild 987..." }`

**Errors:** `404` if 24/7 mode is not currently enabled for this guild.

---

## Global Chat API (`/api/globalchat`)

Manage guild registrations in Kythia's local Global Chat database. These endpoints mirror the external Global Chat API's `POST /add`, `DELETE /remove/:id`, and `GET /list` endpoints but operate against Kythia's own DB. The actual message broadcasting is handled by the external service.

> **Addon Guard:** Automatically protected by `addonGuard('globalchat')` — the `globalchat` addon must be enabled.

> **Note:** `webhookToken` is never returned in API responses to avoid credential exposure.

---

### `GET /api/globalchat/list`

List all guilds registered in Kythia's local global chat database.

**Authentication:** Bearer token required.

**Response:**

```json
{
  "status": "ok",
  "message": "Guilds retrieved successfully",
  "data": {
    "guilds": [
      {
        "id": "123456789012345678",
        "globalChannelId": "111222333444555666",
        "webhookId": "987654321098765432",
        "createdAt": "2025-11-24T00:00:00.000Z",
        "updatedAt": "2025-11-24T00:00:00.000Z"
      }
    ],
    "count": 1,
    "timestamp": "2026-03-06T00:00:00.000Z"
  }
}
```

---

### `GET /api/globalchat/:guildId`

Get registration info for a single guild.

**Errors:** `404` with `code: "GUILD_NOT_FOUND"` if not registered.

---

### `POST /api/globalchat/add`

Register a new guild or update an existing one. Mirrors the external `/add` endpoint.

**Authentication:** Bearer token required.

**Request Body:**

```json
{
  "guildId": "123456789012345678",
  "globalChannelId": "111222333444555666",
  "webhookId": "987654321098765432",
  "webhookToken": "webhook_token_here"
}
```

| Field             | Type     | Required | Description                                  |
| ----------------- | -------- | -------- | -------------------------------------------- |
| `guildId`         | `string` | Yes      | Discord guild snowflake ID                   |
| `globalChannelId` | `string` | Yes      | Channel ID where global chat messages appear |
| `webhookId`       | `string` | No       | Webhook ID for broadcasting                  |
| `webhookToken`    | `string` | No       | Webhook token for broadcasting               |

**Response:** `201` if created, `200` if updated.

```json
{
  "status": "ok",
  "message": "Guild added/updated successfully",
  "data": {
    "guild": {
      "guildId": "123...",
      "globalChannelId": "111...",
      "webhookId": "987..."
    },
    "operation": "created",
    "hasWebhook": true
  }
}
```

**Errors:**

| Status | Code                      | Condition                              |
| ------ | ------------------------- | -------------------------------------- |
| `400`  | `MISSING_REQUIRED_FIELDS` | `guildId` or `globalChannelId` missing |

---

### `DELETE /api/globalchat/remove/:guildId`

Remove a guild from the global chat network. Mirrors the external `DELETE /remove/:id` endpoint.

**Authentication:** Bearer token required.

**Response:**

```json
{
  "status": "ok",
  "message": "Guild removed from global chat successfully",
  "data": {
    "removedGuild": { "id": "123...", "globalChannelId": "111...", ... },
    "operation": "deleted",
    "removedAt": "2026-03-06T00:00:00.000Z"
  }
}
```

**Errors:** `404` with `code: "GUILD_NOT_FOUND"` if not registered.

---

### `PATCH /api/globalchat/:guildId/webhook`

Update only the webhook credentials for a guild. Used internally by the auto-webhook-repair system (`handleFailedGlobalChat`).

**Request Body:**

```json
{
  "webhookId": "new_webhook_id",
  "webhookToken": "new_webhook_token",
  "globalChannelId": "optional_channel_override"
}
```

| Field             | Type     | Required | Description                          |
| ----------------- | -------- | -------- | ------------------------------------ |
| `webhookId`       | `string` | Yes      | New webhook ID                       |
| `webhookToken`    | `string` | Yes      | New webhook token                    |
| `globalChannelId` | `string` | No       | Optionally update the channel ID too |

**Response:** Returns the updated guild object.

**Errors:** `404` if guild not registered, `400` if `webhookId`/`webhookToken` missing.

---

## Automod API (`/api/automod`)

Manage per-guild automod configuration and mod logs. Operates on `ServerSetting` and `ModLog` models.

> **Addon Guard:** Protected by `addonGuard('automod')`.

---

### `GET /api/automod/:guildId`

Get the full automod configuration snapshot for a guild.

**Response:**

```json
{
  "status": "ok",
  "data": {
    "guildId": "123456789",
    "toggles": {
      "antiInviteOn": false,
      "antiLinkOn": false,
      "antiSpamOn": true,
      "antiBadwordOn": true,
      "antiMentionOn": false,
      "antiAllCapsOn": false,
      "antiEmojiSpamOn": false,
      "antiZalgoOn": false
    },
    "channels": {
      "modLogChannelId": "111222333",
      "auditLogChannelId": null
    },
    "lists": {
      "badwords": ["word1", "word2"],
      "badwordWhitelist": [],
      "whitelist": [],
      "ignoredChannels": []
    },
    "updatedAt": "2026-03-07T00:00:00.000Z"
  }
}
```

---

### `PATCH /api/automod/:guildId`

Update one or more automod settings. Accepts any combination of toggle booleans and channel IDs.

**Allowed fields:** `antiInviteOn`, `antiLinkOn`, `antiSpamOn`, `antiBadwordOn`, `antiMentionOn`, `antiAllCapsOn`, `antiEmojiSpamOn`, `antiZalgoOn`, `modLogChannelId`, `auditLogChannelId`

**Request Body:**

```json
{
  "antiSpamOn": true,
  "antiInviteOn": true,
  "modLogChannelId": "111222333"
}
```

---

### Badwords

| Method   | Path                             | Description                                                              |
| -------- | -------------------------------- | ------------------------------------------------------------------------ |
| `GET`    | `/api/automod/:guildId/badwords` | List all blocked words                                                   |
| `POST`   | `/api/automod/:guildId/badwords` | Add words — body: `{ "words": ["word1"] }`                               |
| `DELETE` | `/api/automod/:guildId/badwords` | Remove words: `{ "words": ["word1"] }` or clear all: `{ "clear": true }` |

---

### Whitelist

Users/roles immune to automod checks.

| Method   | Path                                  | Description                                       |
| -------- | ------------------------------------- | ------------------------------------------------- |
| `GET`    | `/api/automod/:guildId/whitelist`     | List whitelisted IDs                              |
| `POST`   | `/api/automod/:guildId/whitelist`     | Add IDs — body: `{ "ids": ["userId", "roleId"] }` |
| `DELETE` | `/api/automod/:guildId/whitelist/:id` | Remove a single ID                                |

---

### Ignored Channels

Channels where automod is fully disabled.

| Method   | Path                                                | Description                                      |
| -------- | --------------------------------------------------- | ------------------------------------------------ |
| `GET`    | `/api/automod/:guildId/ignored-channels`            | List ignored channels                            |
| `POST`   | `/api/automod/:guildId/ignored-channels`            | Add channels — body: `{ "channelIds": ["..."] }` |
| `DELETE` | `/api/automod/:guildId/ignored-channels/:channelId` | Remove a channel                                 |

---

### Mod Logs

| Method   | Path                                | Description                                  |
| -------- | ----------------------------------- | -------------------------------------------- |
| `GET`    | `/api/automod/:guildId/logs`        | Paginated logs                               |
| `GET`    | `/api/automod/:guildId/logs/:logId` | Single log entry                             |
| `DELETE` | `/api/automod/:guildId/logs/:logId` | Delete one log entry                         |
| `DELETE` | `/api/automod/:guildId/logs`        | Clear logs (optionally filter by `?action=`) |

**GET logs query params:**

| Param         | Type    | Description                               |
| ------------- | ------- | ----------------------------------------- |
| `page`        | integer | Page number (default: 1)                  |
| `limit`       | integer | Per page, max 100 (default: 25)           |
| `action`      | string  | Filter by action (e.g. `Automod Warning`) |
| `targetId`    | string  | Filter by target user ID                  |
| `moderatorId` | string  | Filter by moderator ID                    |

**Log entry shape:**

```json
{
  "id": 1,
  "guildId": "123...",
  "moderatorId": "bot_user_id",
  "moderatorTag": "Kythia#0000",
  "targetId": "456...",
  "targetTag": "user#1234",
  "action": "Automod Warning",
  "reason": "Anti-Spam: rapid message flooding",
  "channelId": "789...",
  "createdAt": "2026-03-07T00:00:00.000Z"
}
```

---

### AntiNuke

AntiNuke protects against mass destructive actions: mass channel deletes/creates, role deletes, bans, unauthorized admin grants, and webhook spam. Config is stored as JSON in `ServerSetting.antiNukeConfig`.

#### `GET /api/automod/:guildId/antinuke`

Get the full AntiNuke configuration.

**Response:**

```json
{
  "status": "ok",
  "data": {
    "enabled": true,
    "logChannelId": "111222333",
    "whitelistedUsers": ["owner_id"],
    "whitelistedRoles": ["admin_role_id"],
    "modules": {
      "channelDelete": {
        "enabled": true,
        "action": "kick",
        "threshold": 3,
        "window": 10000
      },
      "channelCreate": {
        "enabled": true,
        "action": "kick",
        "threshold": 5,
        "window": 10000
      },
      "roleDelete": {
        "enabled": true,
        "action": "kick",
        "threshold": 3,
        "window": 10000
      },
      "guildBanAdd": {
        "enabled": true,
        "action": "kick",
        "threshold": 5,
        "window": 10000
      },
      "adminGrant": { "enabled": true, "action": "kick" },
      "webhookCreate": {
        "enabled": true,
        "action": "kick",
        "threshold": 3,
        "window": 10000
      }
    }
  }
}
```

---

#### `PUT /api/automod/:guildId/antinuke`

Replace the full AntiNuke config in one request. Only supplied fields are updated.

**Request Body:**

```json
{
  "enabled": true,
  "logChannelId": "111222333",
  "whitelistedUsers": ["owner_id"],
  "whitelistedRoles": ["admin_role_id"],
  "modules": {
    "channelDelete": {
      "enabled": true,
      "action": "ban",
      "threshold": 2,
      "window": 5000
    }
  }
}
```

**Actions:** `kick` | `ban` | `deafen` | `removeRoles`

---

#### `PATCH /api/automod/:guildId/antinuke/toggle`

Enable or disable the AntiNuke system.

**Request Body:**

```json
{ "enabled": true }
```

---

#### `PATCH /api/automod/:guildId/antinuke/log-channel`

Set or clear the AntiNuke alert log channel.

**Request Body:**

```json
{ "channelId": "111222333" }
```

Send `null` to disable logging.

---

#### AntiNuke Modules

| Method  | Path                                             | Description             |
| ------- | ------------------------------------------------ | ----------------------- |
| `GET`   | `/api/automod/:guildId/antinuke/modules`         | List all module configs |
| `PATCH` | `/api/automod/:guildId/antinuke/modules/:module` | Update one module       |

**Available modules:** `channelDelete`, `channelCreate`, `roleDelete`, `guildBanAdd`, `adminGrant`, `webhookCreate`

**PATCH body** (all fields optional):

```json
{
  "enabled": true,
  "action": "kick",
  "threshold": 3,
  "window": 10000
}
```

| Field       | Type    | Description                                              |
| ----------- | ------- | -------------------------------------------------------- |
| `enabled`   | boolean | Enable/disable this module                               |
| `action`    | string  | Punishment: `kick` \| `ban` \| `deafen` \| `removeRoles` |
| `threshold` | integer | Actions before triggering (rate-limit window)            |
| `window`    | integer | Time window in milliseconds for threshold                |

**Response:**

```json
{
  "status": "ok",
  "data": {
    "module": "channelDelete",
    "enabled": true,
    "action": "kick",
    "threshold": 3,
    "window": 10000
  }
}
```

---

#### AntiNuke Whitelist

Whitelisted users and roles bypass all AntiNuke checks entirely.

| Method   | Path                                                 | Description                     |
| -------- | ---------------------------------------------------- | ------------------------------- |
| `GET`    | `/api/automod/:guildId/antinuke/whitelist`           | Get whitelisted users and roles |
| `POST`   | `/api/automod/:guildId/antinuke/whitelist`           | Add a user or role              |
| `DELETE` | `/api/automod/:guildId/antinuke/whitelist/:type/:id` | Remove by type + ID             |

**POST body:**

```json
{ "type": "user", "id": "123456789" }
```

`type` must be `user` or `role`. `:type` in DELETE is also `user` or `role`.

**GET response:**

```json
{ "status": "ok", "data": { "users": ["owner_id"], "roles": ["mod_role_id"] } }
```

---

## Verification API (`/api/verification`)

Manage per-guild captcha-based member verification. Config is stored in the `VerificationConfig` model; the on/off system toggle is in `ServerSetting.verificationOn`.

> **Addon Guard:** Protected by `addonGuard('verification')`.

**Captcha types:** `math` | `emoji` | `image`

---

### `GET /api/verification/:guildId`

Get the full verification config plus whether the system is currently enabled.

**Response:**

```json
{
  "status": "ok",
  "data": {
    "systemEnabled": true,
    "verifiedRoleId": "111222333",
    "unverifiedRoleId": "444555666",
    "channelId": "777888999",
    "captchaType": "math",
    "maxAttempts": 3,
    "timeoutSeconds": 180,
    "kickOnFail": false,
    "kickOnTimeout": false,
    "dmFallback": true,
    "welcomeMessage": "Welcome to the server! 🎉",
    "logChannelId": "111222444",
    "panelMessageId": "888899990000",
    "panelConfig": {
      "title": "Welcome to the Server",
      "description": "Please click below to verify",
      "buttonText": "Verify",
      "color": "#ff0000"
    }
  }
}
```

---

### `PUT /api/verification/:guildId`

Bulk-update any subset of verification config fields in one request.

**Allowed fields:** `verifiedRoleId`, `unverifiedRoleId`, `channelId`, `captchaType`, `maxAttempts`, `timeoutSeconds`, `kickOnFail`, `kickOnTimeout`, `dmFallback`, `welcomeMessage`, `logChannelId`, `panelConfig`

**Request Body:**

```json
{
  "captchaType": "emoji",
  "maxAttempts": 5,
  "kickOnFail": true,
  "welcomeMessage": "You're verified! Welcome 🎉",
  "panelConfig": {
    "title": "Welcome",
    "description": "Click to verify",
    "buttonText": "Let me in",
    "color": "#00ff00"
  }
}
```

---

### `PATCH /api/verification/:guildId/toggle`

Enable or disable the entire verification system.

**Request Body:**

```json
{ "enabled": true }
```

---

### Verification Configuration Endpoints

Use these granular endpoints to update individual settings.

| Method  | Path                                         | Body                                                     | Description                                  |
| ------- | -------------------------------------------- | -------------------------------------------------------- | -------------------------------------------- |
| `PATCH` | `/api/verification/:guildId/captcha-type`    | `{ "type": "math" }`                                     | Set captcha type (`math`\|`emoji`\|`image`)  |
| `PATCH` | `/api/verification/:guildId/roles`           | `{ "verifiedRoleId": "...", "unverifiedRoleId": "..." }` | Set verified / unverified roles              |
| `PATCH` | `/api/verification/:guildId/channel`         | `{ "channelId": "..." }`                                 | Set verify channel (send `null` for DM-only) |
| `PATCH` | `/api/verification/:guildId/timeout`         | `{ "seconds": 180 }`                                     | Set timeout in seconds (30–600)              |
| `PATCH` | `/api/verification/:guildId/attempts`        | `{ "count": 3 }`                                         | Set max attempts (1–10)                      |
| `PATCH` | `/api/verification/:guildId/kick`            | `{ "kickOnFail": true, "kickOnTimeout": false }`         | Set kick behavior                            |
| `PATCH` | `/api/verification/:guildId/log-channel`     | `{ "channelId": "..." }`                                 | Set log channel (send `null` to disable)     |
| `PATCH` | `/api/verification/:guildId/welcome-message` | `{ "message": "Welcome! 🎉" }`                           | Set welcome DM (send `null` to clear)        |

All endpoints return the updated field(s):

```json
{ "status": "ok", "data": { "captchaType": "emoji" } }
```

---

### Member Action Endpoints

These endpoints trigger real Discord side-effects (role assignment, DMs, kicks). They require the bot to share the guild.

#### `POST /api/verification/:guildId/members/:userId/reset`

Clear the member's existing session and resend a fresh captcha challenge.

- Returns `422` if no `verifiedRoleId` is configured.
- Returns `404` if the guild or member is not found.

**Response:**

```json
{ "status": "ok", "message": "Captcha resent to Username#0000" }
```

---

#### `POST /api/verification/:guildId/members/:userId/force`

Manually verify a member without requiring a captcha. Clears any active session, grants the verified role, removes the unverified role, and sends the configured welcome DM.

**Response:**

```json
{ "status": "ok", "message": "Username#0000 manually verified" }
```

---

#### `DELETE /api/verification/:guildId/members/:userId/revoke`

Revoke a member's verified status. Removes the verified role and re-adds the unverified role.

**Response:**

```json
{ "success": true, "message": "Verification revoked for Username#0000" }
```

---

#### `POST /api/verification/:guildId/panel/send`

Deploy or edit the static Ephemeral Verification Panel into the configured `channelId`. Uses the active `panelConfig` settings. If a panel is already deployed (`panelMessageId`), it edits the existing message dynamically.

- Returns `422` if no verification `channelId` is configured.
- Returns `404` if the guild or channel is missing.

**Response:**

```json
{
  "success": true,
  "message": "Panel deployed successfully",
  "data": { "panelMessageId": "123456789" }
}
```

---

#### `POST /api/verification/:guildId/panel/resend`

Erase the currently active Ephemeral Verification Panel message in Discord and force the bot to spawn a shiny new one at the very bottom of the chat channel.

- Returns `422` if no verification `channelId` is configured.
- Returns `404` if the guild or channel is missing.

**Response:**

```json
{
  "success": true,
  "message": "Panel forcefully resent successfully",
  "data": { "panelMessageId": "987654321" }
}
```

---

## Backup API (`/api/backup`)

Creates a full backup of the bot's database and config files and returns it as a downloadable ZIP archive.

> **This endpoint is sensitive.** It exposes your full database, `.env` secrets, and bot configuration. Protect your `API_SECRET` accordingly and avoid exposing the API port publicly.

---

### `GET /api/backup`

Runs `mysqldump` against the configured database, bundles the SQL dump with `.env` and `kythia.config.js`, and returns the result as a compressed ZIP file download.

**Authentication:** Bearer token required.

**Response:** Binary ZIP file (`application/zip`) streamed as an attachment.

| Header                | Value                                                  |
| --------------------- | ------------------------------------------------------ |
| `Content-Type`        | `application/zip`                                      |
| `Content-Disposition` | `attachment; filename="kythia-backup-<timestamp>.zip"` |
| `Content-Length`      | Size of the ZIP in bytes                               |

#### ZIP Contents

| Filename           | Description                                                                                      |
| ------------------ | ------------------------------------------------------------------------------------------------ |
| `db-dump.sql`      | Full `mysqldump` of the configured database (`--single-transaction`, `--routines`, `--triggers`) |
| `.env`             | Environment variables file from the bot root directory                                           |
| `kythia.config.js` | Bot configuration file from the bot root directory                                               |

> `.env` and `kythia.config.js` are only included if they exist on disk. If either file is missing it is silently skipped.

#### Timestamp Format

The ZIP filename uses the format `kythia-backup-YYYY-MM-DDTHH-MM-SS.zip` derived from the UTC time at the moment the request is processed.

**Example filename:** `kythia-backup-2026-03-08T00-14-25.zip`

---

#### Errors

| Status | Body                                                                                 | Condition                                       |
| ------ | ------------------------------------------------------------------------------------ | ----------------------------------------------- |
| `400`  | `{ "success": false, "error": "Backup for DB driver 'sqlite' is not supported..." }` | `DB_DRIVER` is not `mysql` or `mariadb`         |
| `500`  | `{ "success": false, "error": "DB_NAME or DB_USER is not configured." }`             | Missing required DB credentials in config/env   |
| `500`  | `{ "success": false, "error": "mysqldump failed: ..." }`                             | `mysqldump` process exited with a non-zero code |
| `500`  | `{ "success": false, "error": "Backup failed: ..." }`                                | Archive creation or other unexpected failure    |

---

#### Requirements

- **`mysqldump`** must be installed and available in the system `PATH` (usually ships with MySQL/MariaDB client tools).
- The configured DB user must have `SELECT`, `LOCK TABLES`, `SHOW VIEW`, `TRIGGER`, and `EVENT` privileges (standard read-only dump privileges).
- Supports `mysql` and `mariadb` drivers only. SQLite and other drivers return `400`.

---

#### Usage Example

```bash
# Download the backup archive
curl -H "Authorization: Bearer YOUR_API_SECRET" \
     http://localhost:3000/api/backup \
     --output kythia-backup.zip

# Inspect the contents
unzip -l kythia-backup.zip
```

**Expected output:**

```
Archive:  kythia-backup.zip
  Length      Date    Time    Name
---------  ---------- -----   ----
  2048576  03-08-2026 00:14   db-dump.sql
     7056  03-08-2026 00:14   .env
    15679  03-08-2026 00:14   kythia.config.js
---------                     -------
  2071311                     3 files
```

---

#### Internal Behavior

1. Reads DB credentials from `kythia.config.js` (falling back to environment variables).
2. Constructs `mysqldump` arguments — uses `--socket` if `DB_SOCKET_PATH` is set, otherwise `-h HOST -P PORT`.
3. Writes the SQL output to a temporary file in `os.tmpdir()`.
4. Creates a ZIP archive (zlib level 9) in `os.tmpdir()` containing the SQL dump, `.env`, and `kythia.config.js`.
5. Reads the ZIP into a buffer, responds with it, then deletes both temp files.

---

## Minecraft API (`/api/minecraft`)

Manages Minecraft server status and stat channel configuration per guild.

All routes require Bearer token authentication.

---

### `GET /api/minecraft/status/raw`

Query any Minecraft server directly without a guild context.

**Query Parameters:**

| Parameter | Type     | Required | Description                    |
| --------- | -------- | -------- | ------------------------------ |
| `host`    | `string` | Yes      | Server hostname or IP          |
| `port`    | `number` | No       | Server port (default: `25565`) |

**Response (success):**

```json
{
  "success": true,
  "data": {
    "online": true,
    "players": { "online": 12, "max": 100 },
    "version": "1.21.4",
    "motd": { "clean": "Welcome to my server" }
  }
}
```

**Errors:**

| Status | Body                                                                  | Condition           |
| ------ | --------------------------------------------------------------------- | ------------------- |
| `400`  | `{ "success": false, "error": "Missing required query param: host" }` | `host` not provided |
| `502`  | `{ "success": false, "error": "..." }`                                | API fetch failed    |

---

### `GET /api/minecraft/status/:guildId`

Fetch the Minecraft server status using the guild's configured IP and port.

**Path Parameters:**

| Parameter | Type     | Description      |
| --------- | -------- | ---------------- |
| `guildId` | `string` | Discord guild ID |

**Response (success):**

```json
{
  "success": true,
  "host": "play.example.net",
  "port": 25565,
  "data": { "online": true, "players": { "online": 12, "max": 100 } }
}
```

**Errors:**

| Status | Body                                                                             | Condition                  |
| ------ | -------------------------------------------------------------------------------- | -------------------------- |
| `404`  | `{ "success": false, "error": "Guild settings not found" }`                      | No ServerSetting for guild |
| `404`  | `{ "success": false, "error": "No Minecraft server configured for this guild" }` | `minecraftIp` not set      |
| `502`  | `{ "success": false, "error": "..." }`                                           | mcsrvstat.us fetch failed  |

---

### `GET /api/minecraft/settings/:guildId`

Returns the Minecraft-related fields from `ServerSetting` for the given guild.

**Path Parameters:**

| Parameter | Type     | Description      |
| --------- | -------- | ---------------- |
| `guildId` | `string` | Discord guild ID |

**Response:**

```json
{
  "success": true,
  "data": {
    "minecraftStatsOn": true,
    "minecraftIp": "play.example.net",
    "minecraftPort": 25565,
    "minecraftIpChannelId": "111111111111111111",
    "minecraftPortChannelId": "222222222222222222",
    "minecraftStatusChannelId": "333333333333333333",
    "minecraftPlayersChannelId": "444444444444444444"
  }
}
```

| Field                       | Type             | Description                          |
| --------------------------- | ---------------- | ------------------------------------ |
| `minecraftStatsOn`          | `boolean`        | Whether the stat cron is active      |
| `minecraftIp`               | `string \| null` | Server hostname/IP                   |
| `minecraftPort`             | `number`         | Server port                          |
| `minecraftIpChannelId`      | `string \| null` | Voice channel showing the IP         |
| `minecraftPortChannelId`    | `string \| null` | Voice channel showing the port       |
| `minecraftStatusChannelId`  | `string \| null` | Voice channel showing online/offline |
| `minecraftPlayersChannelId` | `string \| null` | Voice channel showing player count   |

---

### `PATCH /api/minecraft/settings/:guildId`

Update any Minecraft-related setting fields for the given guild.

**Path Parameters:**

| Parameter | Type     | Description      |
| --------- | -------- | ---------------- |
| `guildId` | `string` | Discord guild ID |

**Request Body** (all fields optional):

```json
{
  "minecraftIp": "play.example.net",
  "minecraftPort": 25565,
  "minecraftStatsOn": true,
  "minecraftIpChannelId": "111111111111111111",
  "minecraftPortChannelId": "222222222222222222",
  "minecraftStatusChannelId": "333333333333333333",
  "minecraftPlayersChannelId": "444444444444444444"
}
```

Only the fields listed above are accepted — all others are ignored.

**Response:**

```json
{
  "success": true,
  "data": {
    /* full ServerSetting record */
  }
}
```

---

### `POST /api/minecraft/autosetup/:guildId`

Mirrors the `/minecraft set autosetup` Discord command via API. Creates a category and 4 stat voice channels in the guild, saves all IDs to `ServerSetting`, and enables `minecraftStatsOn`.

**Path Parameters:**

| Parameter | Type     | Description      |
| --------- | -------- | ---------------- |
| `guildId` | `string` | Discord guild ID |

**Request Body:**

```json
{
  "host": "play.example.net",
  "port": 25565,
  "categoryName": "⛏️ Minecraft Server"
}
```

| Field          | Type     | Required | Description                                                        |
| -------------- | -------- | -------- | ------------------------------------------------------------------ |
| `host`         | `string` | Yes      | Minecraft server hostname or IP                                    |
| `port`         | `number` | No       | Server port (default: `25565`)                                     |
| `categoryName` | `string` | No       | Name for the new Discord category (default: `⛏️ Minecraft Server`) |

**Response (success):**

```json
{
  "success": true,
  "data": {
    "categoryId": "555555555555555555",
    "host": "play.example.net",
    "port": 25565,
    "channels": {
      "minecraftIpChannelId": "111111111111111111",
      "minecraftPortChannelId": "222222222222222222",
      "minecraftStatusChannelId": "333333333333333333",
      "minecraftPlayersChannelId": "444444444444444444"
    }
  }
}
```

**Errors:**

| Status | Body                                                            | Condition                    |
| ------ | --------------------------------------------------------------- | ---------------------------- |
| `400`  | `{ "success": false, "error": "Missing required field: host" }` | `host` not in body           |
| `404`  | `{ "success": false, "error": "Guild not found in cache" }`     | Guild not in bot cache       |
| `500`  | `{ "success": false, "error": "..." }`                          | Channel creation or DB error |

> **Note:** Channels are created with `@everyone` denied `Connect`, so they are display-only stat counters. Initial channel names are set using a live status fetch; if the server is unreachable they default to `🔴 Offline` / `👥 —/—`.

---

### `POST /api/minecraft/trigger-update/:guildId`

Force an immediate Minecraft stat channel rename cycle for one guild or all guilds.

**Path Parameters:**

| Parameter | Type     | Description                                        |
| --------- | -------- | -------------------------------------------------- |
| `guildId` | `string` | Discord guild ID, or `"all"` to trigger all guilds |

**Response:**

```json
{ "success": true, "message": "Update triggered for guild 123456789012345678" }
```

> The update runs asynchronously in the background. The API returns immediately; channel renames happen shortly after (subject to Discord rate limits). Use `GET /api/minecraft/status/:guildId` to verify the current state.

---

## Modmail API (`/api/modmail`)

The **Modmail API** provides programmatic access to manage modmail threads, per-guild configurations, block lists, and quick-reply snippets. All endpoints require bearer token authentication.

---

### Modmail Threads (`/api/modmail`)

#### `GET /api/modmail`

List all modmail thread records. Supports query-parameter filtering.

**Query Parameters:**

| Parameter         | Type     | Description                             |
| ----------------- | -------- | --------------------------------------- |
| `guildId`         | `string` | Filter by guild ID                      |
| `userId`          | `string` | Filter by user who opened the modmail   |
| `threadChannelId` | `string` | Filter by the Discord thread channel ID |
| `status`          | `string` | `open` or `closed`                      |

**Response:**

```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": 1,
      "guildId": "123456789012345678",
      "userId": "987654321098765432",
      "threadChannelId": "111111111111111111",
      "status": "open",
      "openedAt": 1741800000000,
      "closedAt": null,
      "closedByUserId": null,
      "closedReason": null
    }
  ]
}
```

| Field             | Type              | Description                                    |
| ----------------- | ----------------- | ---------------------------------------------- |
| `id`              | `integer`         | Primary key                                    |
| `guildId`         | `string`          | Guild the modmail belongs to                   |
| `userId`          | `string`          | Discord user who opened the modmail            |
| `threadChannelId` | `string`          | Discord private thread channel ID              |
| `status`          | `string`          | `open` or `closed`                             |
| `openedAt`        | `integer`         | Unix timestamp (ms) when the thread was opened |
| `closedAt`        | `integer \| null` | Unix timestamp (ms) when the thread was closed |
| `closedByUserId`  | `string \| null`  | Discord user ID of the staff who closed it     |
| `closedReason`    | `string \| null`  | Optional closing reason                        |

---

#### `GET /api/modmail/:id`

Get a single modmail thread by its primary key.

**Path Parameters:**

| Parameter | Type      | Description                |
| --------- | --------- | -------------------------- |
| `id`      | `integer` | Modmail record primary key |

**Response:** Same shape as the object inside `data[]` above.

**Errors:**

| Status | Condition                     |
| ------ | ----------------------------- |
| `404`  | No modmail found with that ID |

---

#### `PATCH /api/modmail/:id`

Partially update fields on a modmail record (e.g. `closedReason`). Does **not** close the thread — use `POST /api/modmail/:id/close` for a graceful close.

**Request Body:** Any subset of modmail fields.

```json
{ "closedReason": "Resolved via support ticket" }
```

**Response:** `{ "success": true, "data": { ...updatedModmail } }`

---

#### `DELETE /api/modmail/:id`

Hard-delete a modmail record from the database. Does **not** delete the Discord thread channel.

> [!WARNING]
> This does not close the Discord thread. Use `/close` for a graceful shutdown.

**Response:** `{ "success": true, "message": "Modmail record deleted" }`

---

### Modmail Actions: Open / Close

#### `POST /api/modmail/open`

Programmatically open a modmail thread for a user in a guild. Sends the greeting DM, creates the private thread, and notifies staff.

**Request Body:**

```json
{
  "guildId": "123456789012345678",
  "userId": "987654321098765432",
  "initialMessage": "Hello, I need help with my account."
}
```

| Field            | Type     | Required | Description                                    |
| ---------------- | -------- | -------- | ---------------------------------------------- |
| `guildId`        | `string` | ✅       | Target guild ID                                |
| `userId`         | `string` | ✅       | Discord user ID to open modmail for            |
| `initialMessage` | `string` | ❌       | First message content to relay into the thread |

**Errors:**

| Status | Error                                            | Condition                              |
| ------ | ------------------------------------------------ | -------------------------------------- |
| `400`  | `Missing required: guildId, userId`              | Required fields absent                 |
| `403`  | `User is blocked from modmail in this guild`     | User is on the guild's blocklist       |
| `404`  | `User/Guild not found`                           | Bot cannot find the user or guild      |
| `404`  | `Modmail not configured for this guild`          | No config exists for the guild         |
| `409`  | `User already has an open modmail in this guild` | Duplicate open thread                  |
| `500`  | `Failed to create modmail thread`                | Internal helper error (check bot logs) |

**Response (success):**

```json
{ "success": true, "data": { ...modmailRecord } }
```

---

#### `POST /api/modmail/:id/close`

Gracefully close a modmail thread. Generates a transcript, posts it to the transcript channel, sends the user a closing DM, marks the DB record as `closed`, and deletes the Discord thread.

**Request Body:**

```json
{
  "closerId": "111111111111111111",
  "reason": "Issue resolved"
}
```

| Field      | Type     | Required | Description                                            |
| ---------- | -------- | -------- | ------------------------------------------------------ |
| `closerId` | `string` | ✅       | Discord user ID of the staff member closing the thread |
| `reason`   | `string` | ❌       | Closing reason (shown in logs)                         |

**Errors:**

| Status | Error                               | Condition                    |
| ------ | ----------------------------------- | ---------------------------- |
| `400`  | `Modmail is already closed`         | Thread was closed previously |
| `400`  | `Missing required: closerId`        | No closer provided           |
| `404`  | `Guild or thread channel not found` | Bot cannot fetch the thread  |
| `404`  | `User (closer) not found`           | Closer user does not exist   |

**Response:** `{ "success": true, "message": "Modmail closed successfully" }`

---

### Modmail Action: Staff Reply

#### `POST /api/modmail/:id/reply`

Send a staff reply from the API. Relays the message as a Components V2 card to both the Discord thread and the user's DM — identical to what happens when staff types in the thread.

**Request Body:**

```json
{
  "staffId": "111111111111111111",
  "content": "Thank you for reaching out! We are looking into this.",
  "anonymous": false
}
```

| Field       | Type      | Required | Description                                                                      |
| ----------- | --------- | -------- | -------------------------------------------------------------------------------- |
| `staffId`   | `string`  | ✅       | Discord user ID of the replying staff member                                     |
| `content`   | `string`  | ✅       | Message content to send                                                          |
| `anonymous` | `boolean` | ❌       | If `true`, shown as "Staff" instead of the staff member's name. Default: `false` |

**Errors:**

| Status | Error                                | Condition                          |
| ------ | ------------------------------------ | ---------------------------------- |
| `400`  | `Cannot reply to a closed modmail`   | Thread is already closed           |
| `400`  | `Missing required: staffId, content` | Required fields absent             |
| `404`  | `Thread channel not found`           | Bot cannot find the Discord thread |
| `404`  | `User (staff) not found`             | Staff user does not exist          |

**Response:** `{ "success": true, "message": "Reply sent to user" }`

---

### Modmail Action: Internal Note

#### `POST /api/modmail/:id/note`

Post an internal staff note to the modmail thread. Notes appear as grey Components V2 cards in the thread and are **never relayed** to the user.

**Request Body:**

```json
{
  "staffId": "111111111111111111",
  "content": "User seems frustrated — escalate to senior staff if not resolved in 30 minutes."
}
```

| Field     | Type     | Required | Description                                        |
| --------- | -------- | -------- | -------------------------------------------------- |
| `staffId` | `string` | ✅       | Discord user ID of the note author                 |
| `content` | `string` | ✅       | Note content (only visible to staff in the thread) |

**Response:** `{ "success": true, "message": "Note posted to thread" }`

---

### Modmail Config (`/api/modmail/configs/:guildId`)

#### `GET /api/modmail/configs/:guildId`

Retrieve the modmail configuration for a guild.

**Response:**

```json
{
  "success": true,
  "data": {
    "guildId": "123456789012345678",
    "inboxChannelId": "222222222222222222",
    "staffRoleId": "333333333333333333",
    "logsChannelId": "444444444444444444",
    "transcriptChannelId": "555555555555555555",
    "pingStaff": true,
    "greetingMessage": "## 📬 Modmail Opened\nThank you for contacting us!",
    "closingMessage": "## 🔒 Modmail Closed\nYour thread has been closed.",
    "greetingColor": "#5865F2",
    "greetingImage": "https://example.com/greeting-banner.png",
    "closingColor": "#FF5555",
    "closingImage": null,
    "blockedUserIds": [],
    "snippets": {
      "hello": "Hello! Thanks for reaching out. How can we help?",
      "rules": "Please review our server rules at #rules."
    }
  }
}
```

#### Config Object Schema

| Field                 | Type             | Description                                         |
| --------------------- | ---------------- | --------------------------------------------------- |
| `guildId`             | `string`         | Guild snowflake ID                                  |
| `inboxChannelId`      | `string`         | Channel where private thread are created            |
| `staffRoleId`         | `string \| null` | Role pinged on new threads                          |
| `logsChannelId`       | `string \| null` | Channel for close event logs                        |
| `transcriptChannelId` | `string \| null` | Channel where transcripts are saved                 |
| `pingStaff`           | `boolean`        | Whether to ping the staff role on new threads       |
| `greetingMessage`     | `string \| null` | Custom DM text sent when a thread opens             |
| `closingMessage`      | `string \| null` | Custom DM text sent when a thread closes            |
| `greetingColor`       | `string \| null` | Hex accent for the opening DM card (e.g. `#5865F2`) |
| `greetingImage`       | `string \| null` | Banner image URL for the opening DM card            |
| `closingColor`        | `string \| null` | Hex accent for the closing DM card                  |
| `closingImage`        | `string \| null` | Banner image URL for the closing DM card            |
| `blockedUserIds`      | `string[]`       | User IDs blocked from modmail in this guild         |
| `snippets`            | `object`         | Key-value map of snippet name → content             |

---

#### `PUT /api/modmail/configs/:guildId`

Create or fully replace the modmail config for a guild.

**Request Body:**

```json
{
  "inboxChannelId": "222222222222222222",
  "staffRoleId": "333333333333333333",
  "logsChannelId": "444444444444444444",
  "transcriptChannelId": "555555555555555555",
  "pingStaff": true,
  "greetingMessage": "## 📬 Modmail Opened\nWe'll get back to you shortly!",
  "closingMessage": "## 🔒 Thread Closed\nFeel free to DM again if you need help.",
  "greetingColor": "#5865F2",
  "greetingImage": "https://example.com/open-banner.png",
  "closingColor": "#FF5555",
  "closingImage": null
}
```

| Field                 | Type      | Required | Description                                 |
| --------------------- | --------- | -------- | ------------------------------------------- |
| `inboxChannelId`      | `string`  | ✅       | Channel where new threads are created       |
| `staffRoleId`         | `string`  | ❌       | Role to ping on new threads                 |
| `logsChannelId`       | `string`  | ❌       | Channel for close logs                      |
| `transcriptChannelId` | `string`  | ❌       | Channel for transcripts                     |
| `pingStaff`           | `boolean` | ❌       | Default: `true`                             |
| `greetingMessage`     | `string`  | ❌       | DM text on open — markdown supported        |
| `closingMessage`      | `string`  | ❌       | DM text on close — markdown supported       |
| `greetingColor`       | `string`  | ❌       | Hex color for opening card (e.g. `#5865F2`) |
| `greetingImage`       | `string`  | ❌       | Image URL for opening card banner           |
| `closingColor`        | `string`  | ❌       | Hex color for closing card                  |
| `closingImage`        | `string`  | ❌       | Image URL for closing card banner           |

**Response:** `{ "success": true, "data": { ...config } }`

---

#### `PATCH /api/modmail/configs/:guildId`

Partially update the modmail config. Only provided fields are changed.

**Request Body:** Any subset of the config fields above.

```json
{ "greetingColor": "#00FF99", "pingStaff": false }
```

**Response:** `{ "success": true, "data": { ...updatedConfig } }`

---

#### `DELETE /api/modmail/configs/:guildId`

Delete the modmail config for a guild. This effectively **disables modmail** for that guild — users will no longer be able to open threads.

**Response:** `{ "success": true, "message": "Modmail config for guild 123... deleted" }`

---

### Modmail Block / Unblock

#### `GET /api/modmail/configs/:guildId/block`

List all user IDs blocked from modmail in a guild.

**Response:**

```json
{ "success": true, "count": 1, "data": ["987654321098765432"] }
```

---

#### `POST /api/modmail/configs/:guildId/block`

Block a user from opening new modmail threads in this guild.

**Request Body:**

```json
{ "userId": "987654321098765432" }
```

**Errors:**

| Status | Error                      | Condition                      |
| ------ | -------------------------- | ------------------------------ |
| `400`  | `Missing required: userId` | —                              |
| `409`  | `User is already blocked`  | User already in the block list |

**Response:** `{ "success": true, "data": { "blockedUserIds": ["987..."] } }`

---

#### `DELETE /api/modmail/configs/:guildId/block/:userId`

Unblock a user so they can open modmail again.

**Path Parameters:**

| Parameter | Type     | Description        |
| --------- | -------- | ------------------ |
| `guildId` | `string` | Guild ID           |
| `userId`  | `string` | User ID to unblock |

**Response:** `{ "success": true, "data": { "blockedUserIds": [] } }`

---

### Modmail Snippets

Snippets are quick-reply templates stored per-guild. Staff can use them via `/modmail snippet use` to quickly reply with pre-written text.

#### `GET /api/modmail/configs/:guildId/snippets`

List all snippets for a guild.

**Response:**

```json
{
  "success": true,
  "count": 2,
  "data": {
    "hello": "Hello! Thanks for reaching out. How can we help?",
    "rules": "Please review our server rules at #rules before we proceed."
  }
}
```

---

#### `PUT /api/modmail/configs/:guildId/snippets/:name`

Create or replace a snippet by name. Names are automatically lowercased.

**Path Parameters:**

| Parameter | Type     | Description                                           |
| --------- | -------- | ----------------------------------------------------- |
| `guildId` | `string` | Guild ID                                              |
| `name`    | `string` | Snippet trigger name (e.g. `hello`, `scam`, `appeal`) |

**Request Body:**

```json
{ "content": "Hello! How can we help you today?" }
```

**Response:** `{ "success": true, "data": { "name": "hello", "content": "Hello! ..." } }`

---

#### `DELETE /api/modmail/configs/:guildId/snippets/:name`

Delete a snippet by name.

**Response:** `{ "success": true, "message": "Snippet \"hello\" deleted" }`

**Error (404):** If the snippet doesn't exist.

---

## Social Alerts API (`/api/social-alerts`)

Endpoints to manage and retrieve social media alerts.

### `GET /api/social-alerts`

Returns a list of all social alert subscriptions.

**Query Parameters:**

- `guildId` (optional) - Filter by guild ID.

**Response:**

```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": 1,
      "guildId": "123456789012345678",
      "discordChannelId": "987654321098765432",
      "youtubeChannelId": "UC1234567890",
      "youtubeChannelName": "Cool Creator",
      "youtubeThumbnailUrl": "https://example.com/thumb.jpg",
      "message": "New video! {url}",
      "lastVideoId": "v123abc",
      "platform": "youtube"
    }
  ]
}
```

---

### `GET /api/social-alerts/:id`

Returns a single subscription by its database ID.

---

### `POST /api/social-alerts`

Creates a new social alert subscription.

**Request Body:**

```json
{
  "guildId": "123456789012345678",
  "discordChannelId": "987654321098765432",
  "youtubeChannelId": "UC1234567890",
  "youtubeChannelName": "Cool Creator",
  "platform": "youtube",
  "message": "Hey check out this new video {url}"
}
```

---

### `PATCH /api/social-alerts/:id`

Updates an existing subscription.

**Request Body:**

```json
{
  "discordChannelId": "111222333444",
  "message": "Updated alert message"
}
```

---

### `DELETE /api/social-alerts/:id`

Deletes a subscription.

**Response:**

```json
{
  "success": true,
  "message": "Subscription deleted successfully"
}
```

---

### `GET /api/social-alerts/settings/:guildId`

Fetches the overall Social Alerts settings for a specific guild (e.g. mention roles).

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "guildId": "123456789012345678",
    "mentionRoleId": "888888888888888888"
  }
}
```

---

### `PATCH /api/social-alerts/settings/:guildId`

Updates or creates the overall Social Alerts settings for a guild.

**Request Body:**

```json
{
  "mentionRoleId": "888888888888888888"
}
```

---

## Owner API (`/api/owner`)

> **Authentication:** All `/api/owner` endpoints require **two** credentials:
>
> | Header          | Value                 | Description                                                      |
> | --------------- | --------------------- | ---------------------------------------------------------------- |
> | `Authorization` | `Bearer <API_SECRET>` | Global API secret — same as all other `/api/*` routes            |
> | `X-Owner-Id`    | `<Discord User ID>`   | Your Discord user ID, verified against `kythiaConfig.bot.owners` |
>
> If `X-Owner-Id` is missing or the ID is not recognised as an owner, the request is rejected with HTTP **403**.
>
> These endpoints correspond to owner-only `kyth` slash commands and allow full control over the bot from the Kythia Dashboard.

---

### Maintenance (`/api/owner/maintenance`)

#### `GET /api/owner/maintenance`

Returns the current maintenance mode state.

**Response:**

```json
{
  "success": true,
  "enabled": true,
  "reason": "Scheduled updates"
}
```

| Field     | Type             | Description                                  |
| --------- | ---------------- | -------------------------------------------- |
| `success` | `boolean`        | Always `true`                                |
| `enabled` | `boolean`        | Whether maintenance mode is currently active |
| `reason`  | `string \| null` | The reason stored in Redis, or `null` if off |
| `warning` | `string`         | Present only if Redis is unavailable         |

---

#### `POST /api/owner/maintenance`

Toggle maintenance mode on or off.

**Request Body:**

```json
{
  "enabled": true,
  "reason": "Scheduled updates"
}
```

| Field     | Type      | Required | Description                                         |
| --------- | --------- | -------- | --------------------------------------------------- |
| `enabled` | `boolean` | Yes      | `true` to enable, `false` to disable                |
| `reason`  | `string`  | No       | Reason shown to users (default: `"System updates"`) |

**Response (success):**

```json
{
  "success": true,
  "enabled": true,
  "reason": "Scheduled updates",
  "message": "Maintenance mode enabled. Reason: Scheduled updates"
}
```

**Error (503):** Redis not connected.

---

### Flush Redis (`/api/owner/flush`)

#### `POST /api/owner/flush`

Flushes the **entire** Redis cache (`FLUSHALL`). Use with caution.

**Response:**

```json
{
  "success": true,
  "result": "OK",
  "clearedKeys": 1023,
  "sizeAfter": 0
}
```

| Field         | Type      | Description                                            |
| ------------- | --------- | ------------------------------------------------------ |
| `success`     | `boolean` | `true` if `FLUSHALL` returned `OK` and `dbsize` is `0` |
| `result`      | `string`  | Raw Redis response (`"OK"`)                            |
| `clearedKeys` | `number`  | Number of keys that existed before the flush           |
| `sizeAfter`   | `number`  | Number of keys remaining after flush (should be `0`)   |

**Error (503):** Redis not connected.

---

### Servers (`/api/owner/servers`)

#### `GET /api/owner/servers`

Returns a paginated list of all guilds the bot is currently in.

**Query Parameters:**

| Parameter | Type     | Default   | Description                              |
| --------- | -------- | --------- | ---------------------------------------- |
| `page`    | `number` | `1`       | Page number                              |
| `limit`   | `number` | `20`      | Items per page (max `100`)               |
| `sort`    | `string` | `members` | Sort by `members` (desc) or `name` (asc) |

**Response:**

```json
{
  "success": true,
  "total": 432,
  "page": 1,
  "totalPages": 22,
  "data": [
    {
      "id": "123456789012345678",
      "name": "Big Server",
      "memberCount": 15000,
      "icon": "https://cdn.discordapp.com/icons/...",
      "ownerId": "987654321098765432"
    }
  ]
}
```

---

#### `POST /api/owner/servers/:guildId/leave`

Force the bot to leave a specific guild.

**Path Parameters:**

| Parameter | Type     | Description               |
| --------- | -------- | ------------------------- |
| `guildId` | `string` | Discord guild ID to leave |

**Response (success):**

```json
{
  "success": true,
  "message": "Successfully left guild \"Big Server\".",
  "guild": {
    "id": "123456789012345678",
    "name": "Big Server",
    "memberCount": 500
  }
}
```

**Errors:**

| Status | Description                                    |
| ------ | ---------------------------------------------- |
| `403`  | Guild is a protected guild (main or dev guild) |
| `404`  | Guild not found in bot's cache                 |

---

### Mass Leave (`/api/owner/mass-leave`)

#### `POST /api/owner/mass-leave`

Mass leave all guilds with a member count **below** a given threshold.

**Request Body:**

```json
{
  "minMember": 50,
  "except": ["123456789012345678"]
}
```

| Field       | Type       | Required | Description                                     |
| ----------- | ---------- | -------- | ----------------------------------------------- |
| `minMember` | `number`   | Yes      | Leave guilds with fewer members than this       |
| `except`    | `string[]` | No       | Additional guild IDs to protect from being left |

**Response:**

```json
{
  "success": true,
  "threshold": 50,
  "leftCount": 12,
  "errorCount": 1,
  "guilds": [
    { "name": "Tiny Server", "id": "111111111111111111", "memberCount": 3 }
  ]
}
```

> The main guild and dev guild from `kythiaConfig` are always protected.

---

### Blacklist — Guilds (`/api/owner/blacklist/guilds`)

#### `GET /api/owner/blacklist/guilds`

List all blacklisted guilds.

**Response:**

```json
{
  "success": true,
  "total": 2,
  "data": [
    {
      "id": 1,
      "targetId": "111111111111111111",
      "reason": "Spam",
      "createdAt": "2026-01-01T00:00:00.000Z"
    }
  ]
}
```

---

#### `POST /api/owner/blacklist/guilds`

Add a guild to the blacklist. If the bot is currently in the guild, it will leave immediately.

**Request Body:**

```json
{
  "guildId": "111111111111111111",
  "reason": "Spam"
}
```

| Field     | Type     | Required | Description                   |
| --------- | -------- | -------- | ----------------------------- |
| `guildId` | `string` | Yes      | Discord guild ID to blacklist |
| `reason`  | `string` | No       | Reason for blacklisting       |

**Response (201):**

```json
{
  "success": true,
  "data": {
    "guildId": "111111111111111111",
    "reason": "Spam",
    "leftImmediately": true
  }
}
```

**Error (409):** Guild is already blacklisted.

---

#### `DELETE /api/owner/blacklist/guilds/:guildId`

Remove a guild from the blacklist.

**Response:**

```json
{
  "success": true,
  "message": "Guild 111111111111111111 removed from blacklist."
}
```

**Error (404):** Guild not found in blacklist.

---

### Blacklist — Users (`/api/owner/blacklist/users`)

#### `GET /api/owner/blacklist/users`

List all blacklisted users.

**Response:**

```json
{
  "success": true,
  "total": 3,
  "data": [
    {
      "id": 1,
      "targetId": "222222222222222222",
      "reason": "Abuse",
      "createdAt": "2026-01-01T00:00:00.000Z"
    }
  ]
}
```

---

#### `POST /api/owner/blacklist/users`

Add a user to the blacklist.

**Request Body:**

```json
{
  "userId": "222222222222222222",
  "reason": "Abuse"
}
```

| Field    | Type     | Required | Description                  |
| -------- | -------- | -------- | ---------------------------- |
| `userId` | `string` | Yes      | Discord user ID to blacklist |
| `reason` | `string` | No       | Reason for blacklisting      |

**Response (201):**

```json
{
  "success": true,
  "data": { "userId": "222222222222222222", "reason": "Abuse" }
}
```

**Error (409):** User is already blacklisted.

---

#### `DELETE /api/owner/blacklist/users/:userId`

Remove a user from the blacklist.

**Response:**

```json
{
  "success": true,
  "message": "User 222222222222222222 removed from blacklist."
}
```

**Error (404):** User not found in blacklist.

---

### Premium (`/api/owner/premium`)

#### `GET /api/owner/premium`

List all currently active premium users with pagination.

**Query Parameters:**

| Parameter | Type     | Default | Description                |
| --------- | -------- | ------- | -------------------------- |
| `page`    | `number` | `1`     | Page number                |
| `limit`   | `number` | `20`    | Items per page (max `100`) |

**Response:**

```json
{
  "success": true,
  "total": 42,
  "page": 1,
  "totalPages": 3,
  "data": [
    {
      "userId": "333333333333333333",
      "isPremium": true,
      "premiumExpiresAt": "2026-04-18T00:00:00.000Z"
    }
  ]
}
```

---

#### `GET /api/owner/premium/:userId`

Get premium status for a specific user.

**Response:**

```json
{
  "success": true,
  "data": {
    "userId": "333333333333333333",
    "isPremium": true,
    "premiumExpiresAt": "2026-04-18T00:00:00.000Z"
  }
}
```

> `isPremium` is `false` if the user has no record or if the subscription has expired.

---

#### `POST /api/owner/premium`

Grant premium to a user.

**Request Body:**

```json
{
  "userId": "333333333333333333",
  "days": 30
}
```

| Field    | Type     | Required | Description                            |
| -------- | -------- | -------- | -------------------------------------- |
| `userId` | `string` | Yes      | Discord user ID                        |
| `days`   | `number` | No       | Number of premium days (default: `30`) |

**Response (201):**

```json
{
  "success": true,
  "data": {
    "userId": "333333333333333333",
    "days": 30,
    "premiumExpiresAt": "2026-04-18T00:00:00.000Z"
  }
}
```

---

#### `DELETE /api/owner/premium/:userId`

Revoke premium from a user immediately.

**Response:**

```json
{ "success": true, "message": "Premium revoked from user 333333333333333333." }
```

**Error (404):** User does not have an active premium subscription.

---

### Team (`/api/owner/team`)

#### `GET /api/owner/team`

List all Kythia Team members.

**Response:**

```json
{
  "success": true,
  "total": 4,
  "data": [
    {
      "id": 1,
      "userId": "444444444444444444",
      "name": "Lead Developer",
      "createdAt": "2026-01-01T00:00:00.000Z"
    }
  ]
}
```

---

#### `POST /api/owner/team`

Add a user to the Kythia Team.

**Request Body:**

```json
{
  "userId": "444444444444444444",
  "name": "Lead Developer"
}
```

| Field    | Type     | Required | Description                    |
| -------- | -------- | -------- | ------------------------------ |
| `userId` | `string` | Yes      | Discord user ID                |
| `name`   | `string` | No       | Role/title for the team member |

**Response (201):**

```json
{
  "success": true,
  "data": { "id": 1, "userId": "444444444444444444", "name": "Lead Developer" }
}
```

**Error (409):** User is already a team member.

---

#### `DELETE /api/owner/team/:userId`

Remove a user from the Kythia Team.

**Response:**

```json
{
  "success": true,
  "message": "User 444444444444444444 removed from Kythia Team."
}
```

**Error (404):** User is not a team member.

---

### Presence (`/api/owner/presence`)

#### `GET /api/owner/presence`

Get the bot's current Discord presence.

**Response:**

```json
{
  "success": true,
  "data": {
    "status": "online",
    "activity": {
      "name": "the servers",
      "type": "Watching",
      "url": null
    }
  }
}
```

| Field           | Type             | Description                                                               |
| --------------- | ---------------- | ------------------------------------------------------------------------- |
| `status`        | `string`         | `online`, `idle`, `dnd`, or `invisible`                                   |
| `activity`      | `object \| null` | Current activity, or `null` if none                                       |
| `activity.name` | `string`         | Activity text                                                             |
| `activity.type` | `string`         | `Playing`, `Streaming`, `Listening`, `Watching`, `Competing`, or `Custom` |
| `activity.url`  | `string \| null` | Streaming URL (only for `Streaming` type)                                 |

---

#### `PATCH /api/owner/presence`

Update the bot's Discord presence across all shards.

**Request Body:**

```json
{
  "status": "online",
  "type": "Watching",
  "activity": "432 servers",
  "url": null
}
```

| Field      | Type     | Required             | Description                                                            |
| ---------- | -------- | -------------------- | ---------------------------------------------------------------------- |
| `status`   | `string` | Yes                  | `online`, `idle`, `dnd`, `invisible`                                   |
| `type`     | `string` | Yes                  | `Playing`, `Streaming`, `Listening`, `Watching`, `Competing`, `Custom` |
| `activity` | `string` | Yes                  | Activity display text                                                  |
| `url`      | `string` | Only for `Streaming` | Twitch or YouTube URL                                                  |

**Response:**

```json
{
  "success": true,
  "data": {
    "status": "online",
    "type": "Watching",
    "activity": "432 servers",
    "url": null
  }
}
```

**Errors:**

| Status | Description                                                                  |
| ------ | ---------------------------------------------------------------------------- |
| `400`  | Invalid `status`, `type`, missing `activity`, or missing `url` for Streaming |

---

### Chat (DM as bot) (`/api/owner/chat`)

#### `POST /api/owner/chat`

Send a direct message to a Discord user as the bot.

**Request Body:**

```json
{
  "userId": "555555555555555555",
  "message": "Hello from the Kythia dashboard!"
}
```

| Field     | Type     | Required | Description             |
| --------- | -------- | -------- | ----------------------- |
| `userId`  | `string` | Yes      | Discord user ID to DM   |
| `message` | `string` | Yes      | Message content to send |

**Response:**

```json
{ "success": true, "message": "DM sent to kenndeclouv (555555555555555555)." }
```

**Errors:**

| Status | Description                                 |
| ------ | ------------------------------------------- |
| `404`  | User not found                              |
| `422`  | User has DMs disabled (Discord error 50007) |

---

### Setup Wizard (`/api/owner/setup`)

#### `GET /api/owner/setup`

Returns the current active configuration mapped into the exact JSON structure required by the setup wizard/writer. This matches the exact shape of the payload needed by `POST /api/owner/setup`.

**Response:**

```json
{
  "success": true,
  "data": {
    "license": {
      "licenseKey": "...",
      "acceptTOS": true,
      "dataCollection": true
    },
    "bot": {
      "token": "...",
      "clientId": "...",
      "clientSecret": "...",
      "botName": "Kythia",
      "color": "#FFFFFF",
      "status": "online",
      "activityType": "Playing",
      "activity": "",
      "timezone": "Asia/Jakarta",
      "ownerIds": "",
      "ownerNames": "",
      "prefixes": "k!"
    },
    "db": {
      "driver": "sqlite",
      "dbHost": "localhost",
      "dbPort": "3306",
      "dbName": "kythia",
      "dbUser": "root",
      "dbPass": ""
    },
    "redis": {
      "useRedis": false,
      "redisUrls": ""
    },
    "addons": {
      "api": { "enabled": true },
      "music": { "enabled": true }
    }
  }
}
```

---

#### `POST /api/owner/setup`

Accepts the setup wizard JSON payload (in the exact shape returned by `GET /api/owner/setup`), uses the `setup/writer.js` utility to safely patch `example.env` and `example.kythia.config.js` into active config files (preserving all formatting and comments), and then schedules an automatic bot restart.

> **Important:** This completely overwrites the existing `.env` and `kythia.config.js` using the template files. Previous files will be backed up as `.backup`. The bot process will automatically restart 2 seconds after the response is sent.

**Request Body:**
Expects a JSON object matching the `data` payload of the GET request.

**Response:**

```json
{
  "success": true,
  "message": "Configuration successfully updated. Bot will restart in 2 seconds.",
  "files": {
    "envPath": "/path/to/.env",
    "configPath": "/path/to/kythia.config.js",
    "envBackup": "/path/to/.env.backup",
    "configBackup": "/path/to/kythia.config.js.backup"
  }
}
```

**Error (400):** Missing required setup blocks or invalid JSON.

---

### Live Config Patcher (`/api/owner/config`)

#### `GET /api/owner/config`

Returns the current active configuration mapped into the exact JSON structure required by the patcher. This is identical to `GET /api/owner/setup` but used for post-installation config forms on the dashboard.

**Response:** Identical to `GET /api/owner/setup`.

---

#### `PATCH /api/owner/config`

Surgically updates the _live_ `.env` and `kythia.config.js` files with the provided fields. Unlike the Setup Wizard (which rewrites the entire file from templates), this endpoint modifies the active files directly in-place. It perfectly preserves all unmentioned custom settings, Javascript comments, nested structures, and line breaks.

> **Note:** The bot process will automatically restart 2 seconds after a successful patch.

**Request Body:**
Accepts a partial or full JSON object matching the shape of the GET request. You can send as little or as much as you want to update.

Example payload to only update the bot's color and timezone:

```json
{
  "bot": {
    "color": "#FF0000",
    "timezone": "Europe/London"
  }
}
```

**Response:**

```json
{
  "success": true,
  "message": "Configuration successfully patched. Bot will restart in 2 seconds.",
  "files": {
    "envPath": "/path/to/.env",
    "configPath": "/path/to/kythia.config.js",
    "envBackup": "/path/to/.env.backup",
    "configBackup": "/path/to/kythia.config.js.backup"
  }
}
```

**Error (400):** Empty or invalid payload.

---

### Restart (`/api/owner/restart`)

#### `GET /api/owner/restart`

Check whether a restart is currently scheduled via the API.

**Response:**

```json
{
  "success": true,
  "scheduled": true,
  "timestamp": 1746500000000
}
```

| Field       | Type             | Description                                         |
| ----------- | ---------------- | --------------------------------------------------- |
| `success`   | `boolean`        | Always `true`                                       |
| `scheduled` | `boolean`        | Whether a restart is pending                        |
| `timestamp` | `number \| null` | Unix epoch (ms) of the scheduled restart, or `null` |

> The `timestamp` field mirrors `client.kythiaRestartTimestamp` set either by the slash command or by a delayed `POST /api/owner/restart`.

---

#### `DELETE /api/owner/restart`

Cancel a previously scheduled restart (set via `POST /api/owner/restart` with a `delaySeconds` value).

**Response:**

```json
{ "success": true, "message": "Scheduled restart cancelled." }
```

**Error (404):** No scheduled restart is pending.

---

#### `POST /api/owner/restart`

Trigger a bot restart. The API acknowledges the request before the process exits.

**Request Body:**

```json
{
  "target": "current",
  "shardId": null,
  "delaySeconds": 0
}
```

| Field          | Type     | Required | Description                                             |
| -------------- | -------- | -------- | ------------------------------------------------------- |
| `target`       | `string` | No       | `current` (default), `all`, or `master`                 |
| `shardId`      | `number` | No       | Specific shard ID to restart. Overrides `target` if set |
| `delaySeconds` | `number` | No       | Seconds to wait before restarting (default `0`)         |

**Target Values:**

| Value     | Behavior                                            |
| --------- | --------------------------------------------------- |
| `current` | Exits the current shard process (`process.exit(0)`) |
| `all`     | Respawns all shards via `ShardingManager`           |
| `master`  | Kills the master/spawner process                    |

**Response:**

```json
{
  "success": true,
  "message": "Restarting now. target=current",
  "target": "current",
  "shardId": null,
  "delaySeconds": 0
}
```

> **Note:** For immediate restarts (`delaySeconds: 0`), the API response may arrive before the restart is fully executed. For delayed restarts, the scheduled time is stored in `client.kythiaRestartTimestamp` and can be inspected via `GET /api/owner/restart` or cancelled via `DELETE /api/owner/restart`.

---

### Global Profile (`/api/owner/profile`)

#### `GET /api/owner/profile`

Get the main bot's current global profile, including username, avatar, banner, and bio (application description).

**Response:**

```json
{
  "success": true,
  "data": {
    "nickname": "kythia local",
    "avatar": "https://cdn.discordapp.com/avatars/1469733806247383186/...",
    "banner": null,
    "bio": "all-in-one cutie bot"
  }
}
```

| Field      | Type             | Description                                         |
| ---------- | ---------------- | --------------------------------------------------- |
| `nickname` | `string`         | The bot's global Discord username                   |
| `avatar`   | `string \| null` | URL to the bot's global avatar (PNG)                |
| `banner`   | `string \| null` | URL to the bot's global banner (PNG)                |
| `bio`      | `string \| null` | The bot's "About Me" global application description |

---

#### `PATCH /api/owner/profile`

Update the main bot's global profile.

**Request Body:**

```json
{
  "nickname": "Kythia",
  "avatar": "https://example.com/new_avatar.png",
  "banner": "https://example.com/new_banner.png",
  "bio": "Your all-in-one cutie bot! >,<"
}
```

| Field      | Type     | Required | Description                                                |
| ---------- | -------- | -------- | ---------------------------------------------------------- |
| `nickname` | `string` | No       | New global username                                        |
| `avatar`   | `string` | No       | Image URL or base64 Data URI for the new avatar            |
| `banner`   | `string` | No       | Image URL or base64 Data URI for the new banner            |
| `bio`      | `string` | No       | New text for the "About Me" global application description |

**Response:**

```json
{
  "success": true,
  "message": "Global profile updated successfully",
  "data": {
    "nickname": "Kythia",
    "avatar": "https://cdn.discordapp.com/avatars/...",
    "banner": "https://cdn.discordapp.com/banners/...",
    "bio": "Your all-in-one cutie bot! >,<"
  }
}
```

**Errors:**

| Status | Description                                                               |
| ------ | ------------------------------------------------------------------------- |
| `400`  | Discord API rejected the update (e.g. rate limited, invalid image format) |

---

## Economy API (`/api/economy`)

The Kyth Economy API exposes detailed data about the KYTH AMM Liquidity Pool, ecosystem stats, user holdings, market transactions, and a specialized endpoint for trading charts.

### `GET /api/economy/pool`

Fetch the current Kythia Liquidity Pool state and configuration.

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "price": 0.015,
    "reserves": {
      "coinReserve": 150000,
      "kythReserve": 10000000
    },
    "kConstant": 1500000000000,
    "totalTaxCollected": 50000,
    "lastBurnAt": null,
    "config": {
      "tradingHalted": false,
      "feeRatePct": 2.0,
      "minTradeAmount": 1,
      "maxTradeAmount": 0,
      "burnActive": true,
      "burnRatePct": 5.0,
      "dividendActive": true,
      "dividendSplitPct": 50.0,
      "blackmarketActive": true,
      "stakingActive": true,
      "stakingMinKyth": 1.0
    },
    "updatedAt": "2026-06-08T10:00:00.000Z"
  }
}
```

---

### `PATCH /api/economy/pool/config`

Update the Kythia Liquidity Pool configuration.

**Request Body:**

```json
{
  "feeRatePct": 3.0,
  "tradingHalted": true
}
```

---

### `GET /api/economy/stats`

Get global Kyth ecosystem statistics.

**Response:**

```json
{
  "success": true,
  "data": {
    "price": 0.015,
    "marketCap": 75000,
    "totalCirculating": 4000000,
    "totalStaked": 1000000,
    "totalHolders": 150,
    "totalStakers": 50,
    "stakedPercentage": 20.0
  }
}
```

---

### `GET /api/economy/leaderboard`

Get a paginated leaderboard of users sorted by total Kyth (holding + staked).

**Query Parameters:**

| Parameter | Type     | Default | Description                |
| --------- | -------- | ------- | -------------------------- |
| `limit`   | `number` | `50`    | Items per page (max `100`) |
| `page`    | `number` | `1`     | Page number                |

**Response:**

```json
{
  "success": true,
  "count": 150,
  "page": 1,
  "totalPages": 3,
  "data": [
    {
      "rank": 1,
      "userId": "111111111111111111",
      "username": "whale_user",
      "avatar": "https://cdn.discordapp.com/...",
      "kythHolding": 500000,
      "kythStaked": 1000000,
      "totalKyth": 1500000
    }
  ]
}
```

---

### `GET /api/economy/users/:userId`

Get a specific user's Kyth portfolio.

**Response:**

```json
{
  "success": true,
  "data": {
    "userId": "111111111111111111",
    "kythHolding": 5000,
    "kythStaked": 10000,
    "totalKyth": 15000,
    "valuations": {
      "holdingValueCoins": 75,
      "stakedValueCoins": 150,
      "totalValueCoins": 225
    },
    "coinBalance": 50000
  }
}
```

---

### `GET /api/economy/market/transactions`

Get recent market transactions for KYTH.

**Query Parameters:**

| Parameter | Type     | Default | Description                |
| --------- | -------- | ------- | -------------------------- |
| `limit`   | `number` | `50`    | Items per page (max `100`) |
| `page`    | `number` | `1`     | Page number                |

---

### `GET /api/economy/chart`

Get historical price data tailored for rendering trading charts (e.g. TradingView Lightweight Charts).

**Query Parameters:**

| Parameter | Type     | Default | Description                           |
| --------- | -------- | ------- | ------------------------------------- |
| `limit`   | `number` | `500`   | Max data points returned (max `2000`) |

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "time": 1717830000000,
      "price": 0.012,
      "volume": 1000,
      "type": "buy"
    },
    {
      "time": 1717830500000,
      "price": 0.015,
      "volume": 0,
      "type": "current"
    }
  ]
}
```
