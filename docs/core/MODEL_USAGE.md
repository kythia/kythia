# KythiaModel — Usage Cheatsheet

> Quick reference for every model method. Pay attention to **how the return value is assigned** — some methods return a tuple `[instance, created]` and must be destructured.

---

## Return Type Legend

| Symbol | Meaning |
|---|---|
| `const x =` | Returns the value directly |
| `const [x] =` | Returns a **tuple** — destructure to get the instance |
| `const [x, created] =` | Returns **[instance, wasCreated]** |
| `await` only | `incrementCache`, `save`, `clearCache`, `invalidateByTags`, `scheduleAdd/Remove/Clear` |

---

## 🔍 Read — Single Record

`getCache` is a **full drop-in replacement for `findOne`** — it supports all Sequelize query options.

```js
// Simple where (no wrapper needed):
const user = await User.getCache({ userId: '123', guildId: '456' });

// Explicit where with associations:
const user = await User.getCache({ where: { userId: '123' }, include: [Profile] });

// Without where clause (order, limit, etc.):
const latest = await User.getCache({ order: [['createdAt', 'DESC']] });

// Custom cache key:
const user = await User.getCache({ userId: '123' }, { customCacheKey: 'latest-user' });

// Custom TTL:
const user = await User.getCache({ userId: '123' }, { ttl: 30_000 });

// Force DB, skip cache:
const user = await User.getCache({ userId: '123' }, { noCache: true });

// Paranoid / raw / transaction:
const user = await User.getCache({ userId: '123', paranoid: false });
const user = await User.getCache({ userId: '123', raw: true });

// Force re-fetch from DB and overwrite cache:
const user = await User.refreshCache({ userId: '123', guildId: '456' });
```

---

## 🔍 Read — Multiple Records

```js
// Returns: Model[]
const members = await Member.getAllCache({ where: { guildId: '123' } });

// Returns: Model[] — by PK array, per-item cached
const users = await User.bulkGetCache(['111', '222', '333']);
const users = await User.bulkGetCache(['111', '222'], { include: [Profile] });

// You can also pass an array to getCache (delegates to bulkGetCache):
const users = await User.getCache(['111', '222', '333']);
```

---

## 📄 Read — Paginated

```js
// Returns: { rows: Model[], count: number, totalPages: number, currentPage: number }
const { rows, count, totalPages, currentPage } = await Member.paginateCache({
    where: { guildId: '123' },
    page: 2,
    pageSize: 10,
    order: [['coins', 'DESC']],
});
```

---

## 🔢 Read — Count / Exists / Aggregate

```js
// Returns: number
const total = await Member.countCache({ where: { guildId: '123' } });
const total = await Member.countCache({ where: { guildId: '123' }, noCache: true });

// Returns: boolean
const isMember = await Member.existsCache({ userId: '123', guildId: '456' });

// Returns: any (raw findAll result, cached as plain JSON)
const leaderboard = await Member.aggregateCache({
    where: { guildId: '123' },
    attributes: ['userId', [fn('SUM', col('xp')), 'totalXp']],
    group: ['userId'],
});

// With noCache:
const leaderboard = await Member.aggregateCache({
    where: { guildId: '123' },
    noCache: true,
    attributes: ['userId', [fn('SUM', col('xp')), 'totalXp']],
    group: ['userId'],
});
```

---

## 🔎 Find-or-Create — Returns `[instance, created]`

> ⚠️ These return a **tuple**. Always destructure with `const [x] =` or `const [x, created] =`.

```js
// Find + merge defaults onto existing if values differ, or create
const [user, created] = await User.findOrCreateCache({
    where: { userId: '123', guildId: '456' },
    defaults: { coins: 0, level: 1 },
});

// Same as above, cleaner API
const [user, created] = await User.getOrCreateCache(
    { userId: '123', guildId: '456' },
    { coins: 0, level: 1 },   // defaults (optional)
);

// Find as-is OR create — does NOT merge defaults onto existing
const [user, created] = await User.firstOrCreateCache(
    { userId: '123', guildId: '456' },
    { coins: 0 },
);

// Find as-is, OR return a new UNSAVED instance (no DB write)
const [user, isNew] = await User.firstOrNewCache(
    { userId: '123', guildId: '456' },
    { coins: 0 },
);
if (isNew) await user.save(); // you must save it yourself

// Find + UPDATE with values, or create
const [user, created] = await User.firstOrUpdateCache(
    { userId: '123', guildId: '456' },
    { lastSeen: new Date() },
);

// Always apply values — update existing or create (upsert)
const [user, created] = await User.updateOrCreateCache(
    { userId: '123', guildId: '456' },
    { coins: 100, level: 5 },
);
```

---

## ✏️ Mutate — Increment / Destroy

```js
// Atomic increment (positive = add, negative = subtract). Returns: void
await Member.incrementCache({ userId: '123', guildId: '456' }, 'coins', 50);
await Member.incrementCache({ userId: '123', guildId: '456' }, 'coins', -10);

// Destroy rows + bust cache. Returns: number (rows deleted)
const deleted = await Member.destroyAndClearCache({ where: { guildId: '123' } });
```

---

## 💾 Instance — Save & Cache

```js
// After getCache / getOrCreateCache / etc — mutate then save
const user = await User.getCache({ userId: '123' });
user.coins += 100;
await user.save(); // saves to DB + updates cache
```

---

## 🗑️ Cache Management

```js
// Clear a specific cache entry
await User.clearCache({ userId: '123', guildId: '456' });
await User.clearCache('custom-raw-key');

// Clear negative cache explicitly
await User.clearNegativeCache({ userId: '123', guildId: '456' });

// Sniper invalidation by tags
await User.invalidateByTags([`User`, `User:userId:123`]);

// Low-level read/write
const { hit, data } = await User.getCachedEntry({ where: { userId: '123' } });
await User.setCacheEntry({ where: { userId: '123' } }, instanceData, ttlMs, tags);
```

---

## ⏰ Scheduler

```js
// Add to sorted set (score = timestamp)
await Reminder.scheduleAdd('active', Date.now() + 3_600_000, reminderId);

// Get all due items (score <= now)
const dueIds = await Reminder.scheduleGetExpired('active');

// Remove one item
await Reminder.scheduleRemove('active', reminderId);

// Clear entire set
await Reminder.scheduleClear('active');
```

---

## ⚙️ Model Class Config

```js
class Member extends KythiaModel {
    static table = 'members';
    static CACHE_TTL = 30 * 60 * 1000;            // 30 min (positive cache)
    static NEGATIVE_CACHE_TTL = 30 * 1000;         // 30s (record-not-found cache)
    
    // 🛡️ Laravel-style mass assignment protection
    static fillable = ['coins', 'level', 'xp'];
    // OR static guarded = ['id', 'is_admin'];

    static cacheKeys = [['guildId', 'userId'], ['guildId']];
    static customInvalidationTags = ['leaderboard'];
    
    // Probabilistic background self-healing (verifies cache against DB)
    static DRIFT_CHECK_ENABLED = true;             // Opt-in (default is true)
    static DRIFT_CHECK_RATE = 0.05;                // 5% sampling rate
}

// 🔄 Auto-touch parent timestamp when child updates (Laravel's $touches)
// This will automatically update `updatedAt` on Guild when Member is saved/destroyed.
// Usually called after model associations are defined:
Member.setupParentTouch('guildId', Guild, 'updatedAt');
```

---

## 🔬 Cache Diagnostics & Metrics

KythiaModel includes a non-blocking, fire-and-forget **Self-Healing Drift Checker**. When enabled, a small percentage of cache hits (`DRIFT_CHECK_RATE`) will silently fetch fresh data from the database in the background to verify the cache integrity. If drift (stale data) is detected, it logs a warning and automatically heals the cache.

```js
// View drift statistics for a model
console.log(Member.getCacheDriftStats());
// Output:
// {
//   checked: 412,     // Number of cache hits that were verified against DB
//   drifted: 2,       // Number of times stale data was detected
//   healed: 2,        // Number of times the cache was auto-healed
//   errors: 0,        // DB/Redis errors during background check
//   rate: 0.05,       // Current sampling rate
//   enabled: true     // Whether drift checker is active
// }

// View global aggregated cache stats across ALL registered KythiaModels
const globalStats = KythiaModel.getGlobalCacheStats(sequelize.models);
console.log(globalStats);
// Output:
// { redisHits: 4201, mapHits: 0, misses: 312, sets: 4513, clears: 82, errors: 0 }
```

---

## Common Options

All query methods accept these extra options:

| Option | Type | Default | Description |
|---|---|---|---|
| `noCache` | `boolean` | `false` | Skip cache read/write entirely |
| `ttl` | `number` | `CACHE_TTL` | Override cache TTL in ms for this call |
| `customCacheKey` | `string` | auto | Override the auto-generated cache key |
| `include` | `Model[]` | — | Sequelize associations to eager-load |
| `where` | `object` | — | Explicit where clause |
| `order` | `any[][]` | — | Sort order |
| `limit` | `number` | — | Max records |
| `offset` | `number` | — | Skip records |
| `attributes` | `string[]` | — | Select specific columns |
| `paranoid` | `boolean` | `true` | Include soft-deleted records |
| `raw` | `boolean` | `false` | Return plain objects |
| `transaction` | `Transaction` | — | Run within a transaction |
