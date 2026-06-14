# Kythia Core — Architecture Documentation

> Complete system architecture, design patterns, data flow, and internal components for **v26.1.0**

**Related docs:**
- [CONTAINER.md](./CONTAINER.md) — Full `KythiaContainer` property reference
- [CONFIG.md](./CONFIG.md) — Complete `kythia.config.js` field reference
- [ADDON_GUIDE.md](./ADDON_GUIDE.md) — Step-by-step addon authoring guide
- [CLASS_REFERENCE.md](./CLASS_REFERENCE.md) — Class and method reference

---

## Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Boot Sequence](#boot-sequence)
- [Core Components](#core-components)
  - [Kythia Orchestrator](#kythia-orchestrator)
  - [KythiaEngine (License System)](#kythiaengine-license-system)
  - [AddonManager](#addonmanager)
  - [InteractionManager](#interactionmanager)
  - [EventManager](#eventmanager)
  - [MiddlewareManager](#middlewaremanager)
  - [ShutdownManager](#shutdownmanager)
  - [TranslatorManager](#translatormanager)
  - [MetricsManager](#metricsmanager)
- [Database Layer](#database-layer)
- [Addon System](#addon-system)
- [Data Flow Diagrams](#data-flow-diagrams)
- [Design Patterns](#design-patterns)
- [Scaling Considerations](#scaling-considerations)
- [Security](#security)

---

## Overview

Kythia Core is built on a **layered architecture** with **dependency injection** at its core. The framework separates concerns into distinct layers, each responsible for specific functionality.

### Architecture Principles

1. **Separation of Concerns** — Each manager handles a specific domain
2. **Dependency Injection** — Loose coupling through a central DI container
3. **Plugin (Addon) Architecture** — Extensible through the addon system
4. **Fail-Safe Design** — Graceful degradation (Redis → LRU fallback)
5. **Event-Driven** — React to Discord gateway events efficiently
6. **License-Protected** — Built-in license verification via `KythiaEngine`

---

## System Architecture

```mermaid
graph TB
    subgraph APP["Application Layer (Your Bot)"]
        BOT["index.js / main entry\n──────────────────\n Configuration\n Dependency Setup\n Kythia Initialization"]
    end

    subgraph CORE["Kythia Core Layer"]
        ORCH["Kythia Orchestrator\n──────────────────\n Lifecycle Management\n DI Container\n Manager Coordination"]

        subgraph MANAGERS["Managers"]
            AM["AddonManager\n─────────────\n Discovery\n Loading\n Priority\n Dependency Graph"]
            IM["InteractionManager\n─────────────\n Command Routing\n Button/Modal/Select\n Autocomplete\n Middleware Exec"]
            EM["EventManager\n─────────────\n Event Registration\n Multi-handler Dispatch"]
            MW["MiddlewareManager\n─────────────\n Middleware Loading\n Pipeline Builder"]
            SM["ShutdownManager\n─────────────\n SIGINT/SIGTERM\n Interval Tracking\n Memory Monitor\n Master Uptime\n Graceful Stop"]
            TM["TranslatorManager\n─────────────\n i18n Locales\n Variable Interpolation"]
            MM["MetricsManager\n─────────────\n prom-client\n Command Counters\n Cache Hit/Miss\n CPU/Memory"]
            OPT["KythiaEngine\n─────────────\n License Verification\n Telemetry\n Pulse Heartbeat\n Anti-tamper\n Sacred Boundary"]
            SHARD["ShardingManager\n─────────────\n Shard Spawn\n Crash Loop Detection\n OOM Kill Detection\n Lifetime Restart Tracking"]
        end
    end

    subgraph DB["Database Layer"]
        KM["KythiaModel\n─────────────\n Hybrid Caching\n afterSave/afterDestroy Hooks\n Tag-based Invalidation"]
        KMig["KythiaMigrator\n─────────────\n Batch Tracking\n Addon Migration Scan\n Rollback Support"]
        ML["ModelLoader\n─────────────\n Auto-Discovery\n autoBoot()\n Association Linking"]
        SEQ["KythiaSequelize\n(createSequelizeInstance)\n─────────────\n Factory Function\n SQLite / MySQL / PG"]
        SDR["Seeder / SeederManager\n─────────────\n Seed Execution\n Addon-scoped Seeds"]
    end

    subgraph INFRA["Infrastructure Layer"]
        REDIS["Redis\n(Primary Cache)"]
        LRU["LRU Map\n(Fallback Cache)"]
        SEQUELIZE["Sequelize ORM\n(Database)"]
        DJS["Discord.js Client\n(Gateway)"]
        SENTRY["Sentry\n(Error Tracking)"]
        WINSTON["Winston Logger\n(Structured Logs)"]
    end

    BOT --> ORCH
    ORCH --> MANAGERS
    AM --> DB
    ORCH --> DB
    KM --> REDIS
    KM --> LRU
    KM --> SEQUELIZE
    KMig --> SEQUELIZE
    ML --> SEQUELIZE
    SEQ --> SEQUELIZE
    ORCH --> DJS
    OPT --> SENTRY
    ORCH --> WINSTON
```

---

## Boot Sequence

The `start()` method follows a strict, ordered initialization sequence:

```mermaid
flowchart TD
    A([kythia.start]) --> B[Print ANSI Banner\nfiglet + cli-color]
    B --> C[Check Discord Client\nIntents & Partials]
    C --> D{legalConfig set?\nacceptTOS + dataCollection}
    D -- No --> EXIT1([process.exit 1])
    D -- Yes --> E[Init Sentry\nif sentry.dsn configured]
    E --> F[checkRequiredConfig\nbot.token, bot.clientId,\nbot.clientSecret, db.*]
    F --> F2[Sacred Boundary + integrity check\nKythiaEngine.js — botVersion + bootSalt validation]
    F2 --> G[License validation\nKythiaEngine.ignite]
    G --> H{License Valid?}
    H -- No --> EXIT2([terminateUnauthorizedProcess])
    H -- Yes --> I[engine.startPulse\nengine.startAutoOptimization\nattach webhook transport]
    I --> J[Load Translator\ncore/lang + appRoot/lang]
    J --> K[new AddonManager\nload all addons → CommandData]
    K --> L{sequelize provided?}
    L -- Yes --> M[connectDatabaseWithRetry\n5 retries × 5s delay]
    M --> N[KythiaMigrator\nrun pending migrations]
    N --> O[bootModels\nautoBoot all addon models]
    O --> P[attachHooksToAllModels\ncache invalidation hooks]
    L -- No --> Q
    P --> Q[new EventManager\nattach all event listeners]
    Q --> R[new MiddlewareManager\nload middleware pipeline]
    R --> S[new InteractionManager\ninitialize interaction routing]
    S --> T{--dev flag?}
    T -- No --> U[deployCommands\nglobal + mainGuild + devGuild cleanup]
    T -- Yes --> V
    U --> V[new ShutdownManager\nregister signal handlers\nmemory monitor + heartbeat]
    V --> W[client.login\nDiscord Gateway]
    W --> X[clientReady event\nfetch announcements → DM owners\nexecute clientReadyHooks]
    X --> Z([Bot Running])

    style EXIT1 fill:#c0392b,color:#fff
    style EXIT2 fill:#c0392b,color:#fff
    style Z fill:#27ae60,color:#fff
```

---

## Core Components

### Kythia Orchestrator

**File:** `src/Kythia.ts`

The central class that wires together the entire framework. It acts as the DI container host and startup sequencer.

#### Constructor Parameters

```typescript
new Kythia({
  client: Client;          // ✅ Required — Discord.js Client
  config: KythiaConfig;    // ✅ Required — kythia.config.js object
  botVersion: string;      // ✅ Required — Must start with '26.' (Sacred Boundary)
  bootSalt: number;        // ✅ Required — Must be a finite number (e.g. Date.now())
  logger?: KythiaLogger;   // Optional — defaults to built-in Winston logger
  redis?: Redis;           // Optional — ioredis instance for cache
  sequelize?: Sequelize;   // Optional — Sequelize instance for DB
  models?: object;         // Optional — pre-populated models (populated internally)
  helpers?: object;        // Optional — custom helper functions
  utils?: object;          // Optional — additional utilities
  appRoot?: string;        // Optional — project root (defaults to process.cwd())
})
```

> **Note:** `translator` and `dbDependencies` are **NOT** constructor parameters. `TranslatorManager` is initialized internally. There is no `dbDependencies` property.
>
> **Sacred Boundary:** `botVersion` and `bootSalt` are mandatory. If `botVersion` doesn't start with `'26.'` or `bootSalt` is not a finite number, the engine calls `process.exit(1)` immediately.

#### Public API

| Method | Description |
|---|---|
| `start(): Promise<void>` | Runs the full boot sequence |
| `addDbReadyHook(fn)` | Register callback when DB models are ready |
| `addClientReadyHook(fn)` | Register callback when bot is logged in and ready |
| `registerButtonHandler(id, fn)` | Register button interaction handler |
| `registerModalHandler(prefix, fn)` | Register modal submit handler |
| `registerSelectMenuHandler(prefix, fn)` | Register select menu handler |

#### Key Properties

```typescript
kythia.client      // IKythiaClient (Discord.js Client + container)
kythia.container   // KythiaContainer (all services)
kythia.engine      // KythiaEngine (license system)
kythia.metricsManager  // MetricsManager (prom-client)
kythia.addonManager    // IAddonManager
kythia.eventManager    // IEventManager
kythia.interactionManager // IInteractionManager
kythia.shutdownManager    // IShutdownManager
kythia.translator         // ITranslatorManager
```

---

### KythiaEngine (License System)

**File:** `src/managers/KythiaEngine.ts`

Handles license verification, telemetry reporting, and anti-tamper protection. This is an **internal** system — users interact with it via `kythia.config.js` (`licenseKey` field).

#### How It Works

```mermaid
sequenceDiagram
    participant K as Kythia.start()
    participant SB as Sacred Boundary
    participant ENG as KythiaEngine
    participant LS as License Server
    participant P as Process

    K->>SB: Validate botVersion starts with '26.'\nValidate bootSalt is finite number
    alt Sacred Boundary Failed
        SB->>P: process.exit(1)
    end
    K->>ENG: ignite()
    ENG->>ENG: HMAC integrity check\n(critical method sources)
    ENG->>ENG: _sSpec() — collect HWID\n(CPU, RAM, hostname, platform)
    ENG->>ENG: _sanitizeConfig() — redact secrets
    ENG->>LS: POST /license/verify\n{ clientId, hwid, sanitized config }\nHeader: X-Kythia-License
    LS-->>ENG: 200 { valid: true } → OPTIMAL
    alt License Invalid (401/403)
        LS-->>ENG: 401/403 → SUBOPTIMAL
        ENG-->>K: null token
        K->>P: terminateUnauthorizedProcess()
    else Network/Server Error
        LS-->>ENG: NET_ERR or SRV_ERR
        Note over ENG: tolerates 2 NET_ERR failures before killing
        Note over ENG: SUBOPTIMAL kills on first occurrence
    end
    ENG-->>K: encrypted token (AES-256-CBC, random IV)
    K->>ENG: startPulse() — randomized interval 10–20 min
    K->>ENG: startAutoOptimization() — flush telemetry every 5 min
```

**Security Model:** `KythiaEngine` employs multiple layers of hardening:
- **Sacred Boundary**: Constructor-level version handshake (`botVersion` must be `26.*`, `bootSalt` must be finite)
- **File integrity**: SHA-256 hash of `KythiaEngine.js` injected as sentinel before obfuscation
- **HMAC method guards**: Key methods are HMAC-signed at construction and re-verified on every pulse
- **Prototype lockdown**: All critical methods are frozen (`writable:false, configurable:false`) at module load
- **Instance sealing**: `Object.seal(this)` prevents runtime property injection
- **Native HTTPS only**: Uses `node:https` directly — not patchable via `axios`/`fetch` monkey-patching
- **Fail-closed**: Missing sentinel hash → all auth blocked, not bypassed

**Telemetry:** Events (startup, errors, crashes) are queued and flushed in batches to the telemetry server. This data is linked to your license key.

---

### AddonManager

**File:** `src/managers/AddonManager.ts`

Manages discovery, loading, and registration of all addons.

#### Addon Loading Flow

```mermaid
flowchart TD
    A([loadAddons called]) --> B[Scan appRoot/addons/\nfilter out _ prefixed dirs]
    B --> C[Parse each addon.json\npriority, dependencies]
    C --> D[Check kythiaConfig.addons\nfor disabled addons]
    D --> E[validateDependencies\nper addon]
    E --> F{Dep missing or disabled?}
    F -- Yes --> G[Add to disabled set\nlog error]
    F -- No --> H[topologicalSort\nKahn's algorithm\n+ priority tiebreak]
    G --> H
    H --> I[For each addon in order\ncheck addon.json active flag]
    I --> J[Load register.js\nif exists]
    J --> K[Load commands/\nsingle + split folder structure]
    K --> L[Load events/]
    L --> M[Load buttons/]
    M --> N[Load modals/]
    N --> O[Load select_menus/]
    O --> P[Load tasks/\ncron string or ms interval]
    P --> Q[return commandDataForDeployment]
```

#### Handler Maps

AddonManager maintains these internal `Map`s:

| Map | Key | Description |
|---|---|---|
| `buttonHandlers` | `customId` | Button click handlers |
| `modalHandlers` | `customIdPrefix` | Modal submit handlers |
| `selectMenuHandlers` | `customIdPrefix` | Select menu handlers |
| `autocompleteHandlers` | `commandName` | Autocomplete handlers |
| `taskHandlers` | `taskName` | Cron/interval task references |
| `eventHandlers` | `eventName` | Arrays of event handler functions |
| `embedDrafts` | `key` | Shared embed templates |

#### Intent Validation

AddonManager includes a built-in `EVENT_INTENT_MAP` that validates whether the Discord client has the necessary intents enabled for each registered event handler.

---

### InteractionManager

**File:** `src/managers/InteractionManager.ts`

Routes all `InteractionCreate` events to the appropriate handler and runs the middleware pipeline.

```mermaid
flowchart TD
    A[Discord: InteractionCreate] --> B{Identify Type}
    B --> CMD[ChatInputCommand\nSlash Command]
    B --> CTX[ContextMenuCommand\nUser / Message]
    B --> BTN[ButtonInteraction]
    B --> MOD[ModalSubmit]
    B --> SEL[SelectMenu]
    B --> AUTO[Autocomplete]

    CMD --> C[Get command from client.commands]
    C --> D[Run Middleware Pipeline\nbotPermissions\nuserPermissions\ncooldown\nownerOnly\nisInMainGuild]
    D --> E{All middlewares pass?}
    E -- No --> F[Reply with error / silently skip]
    E -- Yes --> G[Inject container via interaction.client.container]
    G --> H[command.execute interaction]
    H --> I[Report metrics\nkythia_commands_total\nkythia_command_duration_seconds]
    I --> J[Report error to optimizer\nif exception thrown]

    BTN --> K[Find handler by customId prefix-match]
    MOD --> K
    SEL --> K
    K --> L[handler interaction, container]

    AUTO --> M[Find autocomplete handler\nby command name]
    M --> N[handler.autocomplete interaction]
```

#### Built-in Middleware Properties

| Property | Type | Description |
|---|---|---|
| `botPermissions` | `string[]` | Permissions the bot must have |
| `userPermissions` | `string[]` | Permissions the user must have |
| `cooldown` | `number` (ms) | Per-user cooldown in milliseconds |
| `ownerOnly` | `boolean` | Restrict to `config.bot.ownerId` |
| `isInMainGuild` | `boolean` | Restrict to `config.bot.mainGuildId` |
| `mainGuildOnly` | `boolean` | Deploy command to main guild only |

---

### EventManager

**File:** `src/managers/EventManager.ts`

Routes Discord gateway events to all registered addon event handlers concurrently.

```mermaid
sequenceDiagram
    participant DJS as Discord.js Client
    participant EM as EventManager
    participant H1 as Handler 1 (addon-a)
    participant H2 as Handler 2 (addon-b)

    Note over EM: initialize() — register all events on client
    DJS->>EM: emit('messageCreate', message)
    EM->>EM: get handlers for 'messageCreate'
    par Execute all handlers concurrently
        EM->>H1: handler(message, container)
        EM->>H2: handler(message, container)
    end
    H1-->>EM: done / error (logged, no crash)
    H2-->>EM: done / error (logged, no crash)
```

---

### MiddlewareManager

**File:** `src/managers/MiddlewareManager.ts`

Loads additional middleware modules from addons. Called during boot before `InteractionManager` is created.

- Scans addon directories for middleware files
- Provides the middleware pipeline used by `InteractionManager`
- Stored in `container.middlewareManager`

---

### ShutdownManager

**File:** `src/managers/ShutdownManager.ts`

Manages graceful process shutdown and active resource monitoring.

```mermaid
flowchart TD
    A([SIGINT or SIGTERM]) --> B[ShutdownManager.initialize\nregisters signal handlers]
    B --> C[Execute all registered\nshutdownHooks in order]
    C --> D[Close DB connection]
    D --> E[Flush logs / telemetry]
    E --> F([process.exit 0])
```

**Features:**
- Patches global `setInterval` / `clearInterval` to track all active intervals
- Automatically clears tracked intervals on shutdown
- Allows addons to register their own cleanup hooks
- **Memory pressure monitor** — polls every 5 minutes; warns at 80% and attempts GC; at 95% sends webhook alert, notifies master via IPC, and initiates a controlled graceful restart (counted as a memory restart, not a crash loop death)
- **Master uptime tracking** — `getMasterUptime()` returns a human-readable string (e.g. `"2h 34m 17s"`) based on master process start time, surviving shard restarts
- **Shutdown history log** — appends a log entry to `logs/shutdown_history*.log` on every startup, shutdown, and crash
- **Lifecycle webhooks** — sends a Discord V2 Components webhook (startup/shutdown/crash) to `api.webhookErrorLogs`
- **IPC heartbeat** — when running as a shard, sends periodic heartbeats to the master process to enable zombie shard detection
- **Collector safety** — patches `Message.prototype.createMessageComponentCollector` to auto-apply a 15-minute safety timeout to collectors without one

---

### TranslatorManager

**File:** `src/managers/TranslatorManager.ts`

Provides i18n (internationalization) support.

**Loading order during boot:**
1. Core lang files from `src/lang/` (bundled with kythia-core)
2. User lang files from `appRoot/lang/`
3. Addon lang files from `addons/*/lang/` (loaded during addon registration)

**Usage in commands:**
```javascript
async execute(interaction) {
  const { t } = interaction.client.container;
  const message = await t(interaction, 'welcome.message', { user: interaction.user.username });
  await interaction.reply(message);
}
```

The `t` function is bound to `container.t` for convenient access anywhere within the container.

---

### MetricsManager

**File:** `src/managers/MetricsManager.ts`

Exposes Prometheus-compatible performance metrics via `prom-client`. See [METRICS.md](./METRICS.md) for full details.

Available in `container.metrics` (or `kythia.metricsManager`).

---

## Database Layer

### KythiaModel

**File:** `src/database/KythiaModel.ts`

Base Sequelize model class with hybrid caching.

```mermaid
flowchart LR
    CODE["Your code\nUser.getCache(query)"] --> KM

    subgraph KM["KythiaModel Cache Layer"]
        direction TB
        GEN["Generate cache key\nsHA256 hash of query"] --> CHECK
        CHECK{"Cache hit?"}
    end

    CHECK -- Hit --> REDIS["Redis\nPrimary Cache"]
    CHECK -- Miss (Redis down) --> LRU["LRU Map\nFallback Cache"]
    CHECK -- Miss --> DB["Sequelize Database\n(SQLite / MySQL / PG)"]

    DB --> STORE["Store result in cache\nwith tags:\n'ModelName'\n'ModelName:ID:1'\n'ModelName:query:hash'"]
    STORE --> REDIS
    REDIS --> RETURN["Return result"]
    LRU --> RETURN

    DB2["afterSave / afterDestroy hooks"] --> INVAL["Invalidate cache\nby tag prefix\ne.g. 'User*'"]
    INVAL --> REDIS
    INVAL --> LRU
```

**Static Methods:**

| Method | Description |
|---|---|
| `setDependencies({ logger, config, redis })` | **Must** be called once at startup |
| `autoBoot(sequelize)` | Auto-define model from DB schema (called by ModelLoader) |
| `attachHooksToAllModels(sequelize, client)` | Register cache-invalidation hooks on all models |
| `getCache(query)` | Find one with cache |
| `getAllCache(query)` | Find all with cache |
| `findOrCreateCache(options)` | Find or create with cache |
| `countCache(options)` | Count with cache |
| `aggregateCache(options)` | Aggregate with cache |
| `invalidateByTags(tags)` | Manually bust cache for specific tags |
| `clearCache(key)` | Manually bust a specific cache key |

---

### KythiaMigrator

**File:** `src/database/KythiaMigrator.ts`

Laravel-style migration system powered by `umzug`.

```mermaid
flowchart TD
    A([KythiaMigrator called]) --> B[Scan addons/*/database/migrations\nskip disabled addons]
    B --> C[Sort by filename timestamp]
    C --> D[Compare with migrations table\nvia umzug storage adapter]
    D --> E[Run pending migrations up]
    E --> F[Record batch number\nfor rollback support]
    F --> G([Done])
```

---

### ModelLoader

**File:** `src/database/ModelLoader.ts`

Auto-discovery and booting of all addon Sequelize models.

```
1. Scan addons/*/database/models/
2. Skip disabled addons
3. require() each model file
4. Call Model.autoBoot(sequelize)
5. Register in container.models
6. Execute dbReadyHooks (e.g., define associations)
```

---

### Seeder / SeederManager

**File:** `src/database/Seeder.ts`, `src/database/SeederManager.ts`

Exported from `kythia-core` for use with `npx kythia db:seed`.

```typescript
import { Seeder } from 'kythia-core';

export default class UserSeeder extends Seeder {
  public async run(): Promise<void> {
    const { User } = this.container.models;
    await User.bulkCreate([{ username: 'Admin', role: 'admin' }]);
  }
}
```

---

## Addon System

### Addon Directory Structure

```
addons/my-feature/
├── addon.json              # Metadata & dependency declaration
├── register.js             # Optional: runs once during addon load
├── commands/
│   ├── ping.js             # Simple top-level command
│   └── user/               # Folder = parent command
│       ├── _command.js     # Parent command definition
│       ├── profile.js      # Subcommand
│       └── settings/
│           ├── _group.js   # Subcommand group definition
│           └── privacy.js  # Subcommand in group
├── events/
│   └── messageCreate.js
├── buttons/
│   └── confirm.js
├── modals/
│   └── feedback.js
├── select_menus/
│   └── role-select.js
├── tasks/
│   └── daily-cleanup.js
└── database/
    ├── models/
    │   └── UserData.js
    ├── migrations/
    │   └── 20250128_create_user_data.js
    └── seeders/
        └── UserSeeder.js
```

### addon.json Schema

```json
{
  "name": "my-feature",
  "version": "1.0.0",
  "description": "Feature description",
  "author": "Your Name",
  "priority": 50,
  "dependencies": ["core", "database"],
  "active": true
}
```

| Field | Type | Default | Description |
|---|---|---|---|
| `name` | string | — | Unique addon identifier |
| `version` | string | — | Semantic version |
| `priority` | number | `50` | Load order (0–9999, lower loads first) |
| `dependencies` | string[] | `[]` | Required addon names |
| `active` | boolean | `true` | Enable/disable via addon.json |

Addons can also be disabled project-wide in `kythia.config.js`:
```javascript
addons: {
  'my-feature': { active: false }
}
```

### Dependency Resolution (Kahn's Algorithm)

```mermaid
flowchart TD
    A[Build dependency graph\nfor all enabled addons] --> B[Calculate in-degree\nper addon]
    B --> C[Queue all addons\nwith in-degree = 0]
    C --> D[Sort queue by priority\nlower number = loads first]
    D --> E[Process next addon\nfrom queue]
    E --> F[Decrement in-degree\nfor all dependents]
    F --> G{Any dependent\nnow has in-degree = 0?}
    G -- Yes --> H[Add to queue]
    G -- No --> I{Queue empty?}
    H --> D
    I -- No --> D
    I -- Yes --> J{result.length\n== addons.length?}
    J -- No --> K[Circular dependency\ndetected — log error]
    J -- Yes --> L([Sorted load order])
```

---

## Data Flow Diagrams

### Full Command Execution Flow

```mermaid
sequenceDiagram
    actor User
    participant DJS as Discord.js Gateway
    participant IM as InteractionManager
    participant MW as Middleware Pipeline
    participant CMD as Command execute()
    participant CM as KythiaModel (Cache)
    participant DB as Database
    participant MM as MetricsManager

    User->>DJS: /profile
    DJS->>IM: InteractionCreate (ChatInputCommand)
    IM->>IM: client.commands.get('profile')
    IM->>MW: botPermissions check
    MW-->>IM: ✅ pass
    IM->>MW: userPermissions check
    MW-->>IM: ✅ pass
    IM->>MW: cooldown check
    MW-->>IM: ✅ pass
    IM->>CMD: execute(interaction)
    CMD->>CM: User.getCache({ where: { userId } })
    CM->>CM: generate cache key (SHA256)
    CM-->>CMD: cache HIT → return user
    CMD->>DJS: interaction.reply(...)
    DJS-->>User: Response
    CMD->>MM: kythia_commands_total + 1 (success)
    CMD->>MM: kythia_command_duration_seconds observe
```

### Database Query with Cache Miss

```mermaid
sequenceDiagram
    participant CODE as Your Code
    participant KM as KythiaModel
    participant REDIS as Redis
    participant LRU as LRU Map
    participant DB as Database

    CODE->>KM: User.getCache({ where: { id: 1 } })
    KM->>KM: generateKey → SHA256 hash
    KM->>REDIS: GET cache key
    REDIS-->>KM: null (MISS)
    KM->>DB: SELECT * FROM users WHERE id=1
    DB-->>KM: user row
    KM->>REDIS: SET cache key → user (with TTL)
    KM->>REDIS: SADD tag set "User", "User:ID:1"
    KM-->>CODE: return user

    Note over DB, REDIS: Later: user.save() triggers afterSave hook
    KM->>REDIS: DEL all keys tagged "User*"
    KM->>LRU: Delete all matching entries
```

### Self-Healing Cache Drift Checker

To ensure cache consistency against edge cases, `KythiaModel` implements a probabilistic **Self-Healing Drift Checker**.

```mermaid
sequenceDiagram
    participant CODE as Your Code
    participant KM as KythiaModel
    participant REDIS as Redis
    participant DB as Database
    participant LOG as Logger

    CODE->>KM: getCache(query)
    KM->>REDIS: GET cache key
    REDIS-->>KM: cache HIT (data)
    KM-->>CODE: return data immediately (non-blocking)
    
    Note over KM: 1% chance (Math.random() < DRIFT_CHECK_RATE)
    KM->>DB: _performDriftCheck (background): findOne(query)
    DB-->>KM: fresh row
    KM->>KM: deep field diff (cached vs fresh)
    
    alt Drift Detected (Stale Data)
        KM->>LOG: warn("🔬 DRIFT DETECTED: field X differs")
        KM->>REDIS: overwrite cache with fresh data (Self-Heal)
        KM->>KM: increment driftStats.drifted & healed
    else No Drift
        KM->>KM: Silent exit
    end
```

This ensures that even if an unknown edge case causes stale data, the framework detects it and heals itself organically over time without manual intervention.

### Event Dispatch Flow

```mermaid
flowchart LR
    DJS["Discord.js\ngateway event"] --> EM["EventManager\ninitialize"]
    EM --> MAP{"eventHandlers\nMap lookup"}
    MAP --> H1["Addon A\nmessageCreate handler"]
    MAP --> H2["Addon B\nmessageCreate handler"]
    MAP --> H3["Addon C\nmessageCreate handler"]
    H1 --> LOG["Errors logged\nno crash"]
    H2 --> LOG
    H3 --> LOG
```

---

## Design Patterns

### 1. Dependency Injection

All services are accessible through `container`, attached to `client.container`. Avoids the need for direct imports from kythia-core in addon code.

```javascript
// ✅ Correct — use DI container
async execute(interaction) {
  const { logger, models, t } = interaction.client.container;
}

// ❌ Incorrect — creates coupling
const logger = require('kythia-core/dist/utils/logger');
```

### 2. Manager Pattern

Each manager owns a single domain. `Kythia.ts` orchestrates them but doesn't implement their logic.

| Manager | Domain |
|---|---|
| `AddonManager` | Addon loading and component registration |
| `InteractionManager` | Discord interaction routing |
| `EventManager` | Discord gateway event routing |
| `MiddlewareManager` | Command middleware pipeline |
| `ShutdownManager` | Process lifecycle and cleanup |
| `TranslatorManager` | i18n and localization |
| `MetricsManager` | Performance observability |
| `KythiaEngine` | License verification, telemetry, and Sacred Boundary enforcement |

### 3. Strategy Pattern (Caching)

`KythiaModel` abstracts the caching backend transparently:

```
Redis available  → use Redis
Redis unavailable → fall back to LRU Map
Developer code → same API either way
```

### 4. Middleware Chain

```javascript
// In your command module:
const { BaseCommand } = require('kythia-core');
class BanCommand extends BaseCommand {
  slashCommand = new SlashCommandBuilder().setName('ban');
  botPermissions = ['BanMembers'];
  userPermissions = ['BanMembers'];
  cooldown = 10000;
  ownerOnly = false;
  async execute(interaction) { /* ... */ }
}
```

### 5. Observer Pattern (Events)

`EventManager` maintains `Map<eventName, handler[]>` — multiple addons can subscribe to the same event independently.

### 6. Factory Pattern

`createSequelizeInstance(config, logger)` encapsulates Sequelize instantiation complexity, supporting SQLite, MySQL, and PostgreSQL from a single unified config.

---

## Scaling Considerations

### Horizontal Scaling

- **Redis for shared cache** — multiple bot shards share the same cache layer
- **Sequelize connection pooling** — configured per DB driver in `kythia.config.js`
- **`ShardingManager` export** — wraps Discord.js `ShardingManager` for multi-process sharding with built-in crash loop prevention and OOM kill detection

### Performance Optimization

- **Hybrid caching** — dramatically reduces DB query load
- **Tag-based invalidation** — surgical cache clearing instead of full flush
- **Batch operations** — `bulkCreate`, `afterBulk*` hooks

### Monitoring

- **KythiaEngine** — error telemetry sent to Kythia license server
- **Sentry integration** — application-level error tracking
- **Winston logging** — file + console transport with daily rotation
- **prom-client metrics** — Prometheus-compatible scraping endpoint
- **DiscordWebhookTransport** — `warn` and `error` logs forwarded to a Discord webhook in real-time (attach via `attachWebhookTransport(logger, url, client)`, filterable via `settings.webhookLogFilter`)
- **REST rate limit logging** — `rateLimited` and `invalidRequestWarning` events from the Discord REST manager are captured and forwarded to the webhook transport
- **Memory pressure monitor** — per-shard heap monitoring every 5 minutes (80% warn + GC attempt, 95% graceful self-restart) inside `ShutdownManager`
- **Crash loop alerts** — `ShardingManager` logs a distinctive alert and pauses respawning the affected shard when it dies ≥ 3 times in 5 minutes (other shards continue unaffected)
- **Zombie shard detection** — `ShardingManager` uses a two-phase ping/kill system: if a shard goes silent > 3 minutes, sends a `zombie_ping` IPC message; if no `zombie_pong` reply within 30 seconds, sends SIGKILL
- **Lifecycle webhooks** — `ShutdownManager` sends a Discord V2 Components webhook on startup, shutdown, and crash
- **Shutdown history file** — `ShutdownManager` appends to `logs/shutdown_history_shard_N_YYYY-MM.log` on every lifecycle event
- **Shard death webhooks** — `ShardingManager` sends webhook embeds for shard deaths, OOM kills, crash loops, memory restarts, and zombie kills

---

## Security

| Practice | Implementation |
|---|---|
| Credentials in env | `.env` via `@dotenvx/dotenvx` |
| Permission checks | `botPermissions` / `userPermissions` middleware |
| Rate limiting | `cooldown` middleware per user per command |
| Input validation | Sanitize within `execute()` handlers |
| Error containment | Never expose stack traces in Discord replies |
| License protection | `KythiaEngine` with Sacred Boundary + anti-tamper checks |

---

## Conclusion

Kythia Core's architecture is designed for:
- **Scalability** — Redis caching, connection pooling, sharding support
- **Maintainability** — Clean separation via managers and addon isolation
- **Extensibility** — Purely addon-based feature development
- **Reliability** — Retry logic, graceful shutdown, and error containment

For class-level API reference, see [CLASS_REFERENCE.md](./CLASS_REFERENCE.md).  
For CLI tools, see [CLI_REFERENCE.md](./CLI_REFERENCE.md).  
For metrics setup, see [METRICS.md](./METRICS.md).  
For the full `KythiaContainer` property reference, see [CONTAINER.md](./CONTAINER.md).  
For `kythia.config.js` configuration, see [CONFIG.md](./CONFIG.md).  
For the addon authoring guide, see [ADDON_GUIDE.md](./ADDON_GUIDE.md).
