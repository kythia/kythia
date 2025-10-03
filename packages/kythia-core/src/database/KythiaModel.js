/**
 * 🚀 Caching Layer for Sequelize Models (Hybrid Redis + In-Memory Fallback Edition)
 *
 * @file src/database/KythiaModel.js
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta
 *
 * @description
 * The ultimate, high-availability caching layer. It prioritizes a central Redis cache for speed and
 * scalability. If Redis becomes unavailable, it seamlessly falls back to a per-process, in-memory
 * Map cache. This ensures the application remains fast and responsive even during cache server outages.
 *
 * ✨ Core Features (Hybrid Upgrade):
 * -  Automatic Fallback: Switches from Redis to in-memory Map cache when Redis fails.
 * -  Zero Downtime Caching: The application always has a caching layer available.
 * -  Intelligent Routing: Core methods now act as routers, delegating to the active cache engine.
 * -  Consistent API: No changes needed in any other part of the application.
 */

const jsonStringify = require('json-stable-stringify');
const logger = require('@utils/logger');
const { Model } = require('sequelize');
const Redis = require('ioredis');

const NEGATIVE_CACHE_PLACEHOLDER = '__KYTHIA_NEGATIVE_CACHE__';

class KythiaModel extends Model {
    static client;
    static redis;
    static isRedisConnected = false;

    static CACHE_VERSION = kythia.db.redisCacheVersion;

    static localCache = new Map();
    static localNegativeCache = new Set();
    static MAX_LOCAL_CACHE_SIZE = 1000;

    static pendingQueries = new Map();
    static cacheStats = { redisHits: 0, mapHits: 0, misses: 0, sets: 0, clears: 0, errors: 0 };
    static DEFAULT_TTL = 60 * 60 * 1000;

    /**
     * 🔌 Initializes the connection to the Redis server and sets up connection state listeners.
     * This method should be called once when the application starts. If no Redis options are provided,
     * the class will operate exclusively in in-memory cache mode. It implements an intelligent
     * retry strategy to handle temporary connection issues.
     * @param {string|Object} [redisOptions] - The Redis connection URL string or an ioredis options object.
     */
    static initialize(redisOptions) {
        if (this.redis) return;
        if (!redisOptions || (typeof redisOptions === 'string' && redisOptions.trim() === '')) {
            logger.warn('🟠 [REDIS] No Redis URL provided. Operating in In-Memory Cache mode only.');
            this.isRedisConnected = false;
            return;
        }

        const retryStrategy = (times) => {
            if (times > 5) {
                logger.error(`❌ [REDIS] Could not connect after ${times - 1} retries. Falling back to In-Memory Cache.`);
                return null;
            }
            const delay = Math.min(times * 500, 2000);
            logger.warn(`🟠 [REDIS] Connection failed. Retrying in ${delay}ms (Attempt ${times})...`);
            return delay;
        };

        const finalOptions =
            typeof redisOptions === 'string'
                ? { url: redisOptions, retryStrategy, lazyConnect: true }
                : { maxRetriesPerRequest: 2, enableReadyCheck: true, retryStrategy, lazyConnect: true, ...redisOptions };

        this.redis = new Redis(
            typeof redisOptions === 'string' ? redisOptions : finalOptions,
            typeof redisOptions === 'string' ? finalOptions : undefined
        );
        this.redis.connect().catch(() => {});

        this.redis.on('connect', () => {
            logger.info('✅ [REDIS] Connection established. Switching to Redis Cache mode.');
            this.isRedisConnected = true;
        });
        this.redis.on('error', () => {});
        this.redis.on('close', () => {
            if (this.isRedisConnected) {
                logger.error('❌ [REDIS] Connection closed. Falling back to In-Memory Cache mode.');
            }
            this.isRedisConnected = false;
        });

        return this.redis;
    }

    /**
     * 🔑 Generates a consistent, model-specific cache key from a query identifier.
     * This ensures that the same query always produces the same key, preventing collisions.
     * @param {string|Object} queryIdentifier - A unique string or a Sequelize query object.
     * @returns {string} The final cache key, prefixed with the model's name (e.g., "User:{\"id\":1}").
     */
    static getCacheKey(queryIdentifier) {
        // Always use the canonical format: `${this.CACHE_VERSION}:${this.name}:${keyBody}`
        const keyBody = typeof queryIdentifier === 'string' ? queryIdentifier : jsonStringify(this.normalizeQueryOptions(queryIdentifier));
        return `${this.CACHE_VERSION}:${this.name}:${keyBody}`;
    }

    /**
     * 🧽 Recursively normalizes a query options object to ensure deterministic key generation.
     * It sorts keys alphabetically and handles Sequelize's Symbol-based operators to produce
     * a consistent string representation for any given query.
     * @param {*} data - The query options or part of the options to normalize.
     * @returns {*} The normalized data.
     */
    static normalizeQueryOptions(data) {
        if (!data || typeof data !== 'object') return data;
        if (Array.isArray(data)) return data.map((item) => this.normalizeQueryOptions(item));
        const normalized = {};
        Object.keys(data)
            .sort()
            .forEach((key) => (normalized[key] = this.normalizeQueryOptions(data[key])));
        Object.getOwnPropertySymbols(data).forEach((symbol) => {
            const key = `$${symbol.toString().slice(7, -1)}`;
            normalized[key] = this.normalizeQueryOptions(data[symbol]);
        });
        return normalized;
    }

    /**
     * 📥 [HYBRID ROUTER] Sets a value in the currently active cache engine (Redis or Map).
     * This method acts as a router, delegating the operation to the appropriate
     * private implementation based on the Redis connection status.
     * @param {string|Object} cacheKeyOrQuery - The key or query object to store the data under.
     * @param {*} data - The data to cache. Use `null` for negative caching.
     * @param {number} [ttl=this.DEFAULT_TTL] - The time-to-live for the entry in milliseconds.
     */
    static async setCacheEntry(cacheKeyOrQuery, data, ttl) {
        // Always resolve to canonical cache key
        const cacheKey = typeof cacheKeyOrQuery === 'string' ? cacheKeyOrQuery : this.getCacheKey(cacheKeyOrQuery);
        const finalTtl = ttl || this.CACHE_TTL || this.DEFAULT_TTL;

        if (this.isRedisConnected) {
            await this._redisSetCacheEntry(cacheKey, data, finalTtl);
        } else {
            this._mapSetCacheEntry(cacheKey, data, finalTtl);
        }
    }

    /**
     * 📤 [HYBRID ROUTER] Retrieves a value from the currently active cache engine.
     * Delegates the read operation to either the Redis or the in-memory Map cache.
     * @param {string|Object} cacheKeyOrQuery - The key or query object of the item to retrieve.
     * @returns {Promise<{hit: boolean, data: *|undefined}>} An object indicating if the cache was hit and the retrieved data.
     */
    static async getCachedEntry(cacheKeyOrQuery) {
        // Always resolve to canonical cache key
        const cacheKey = typeof cacheKeyOrQuery === 'string' ? cacheKeyOrQuery : this.getCacheKey(cacheKeyOrQuery);
        if (this.isRedisConnected) {
            return this._redisGetCachedEntry(cacheKey);
        } else {
            return this._mapGetCachedEntry(cacheKey);
        }
    }

    /**
     * 🗑️ [HYBRID ROUTER] Deletes an entry from the currently active cache engine.
     * Delegates the delete operation to the appropriate cache implementation.
     * @param {string|Object} keys - The query identifier used to generate the key to delete.
     */
    static async clearCache(keys) {
        // Always resolve to canonical cache key
        const cacheKey = typeof keys === 'string' ? keys : this.getCacheKey(keys);
        if (this.isRedisConnected) {
            await this._redisClearCache(cacheKey);
        } else {
            this._mapClearCache(cacheKey);
        }
    }

    /**
     * 🔴 (Private) Sets a cache entry specifically in Redis.
     * Serializes the data to JSON and handles negative caching with a placeholder.
     * If the operation fails, it flags the Redis connection as down.
     * @param {string} cacheKey - The Redis key.
     * @param {*} data - The data to cache.
     * @param {number} ttl - The TTL in milliseconds.
     * @private
     */
    static async _redisSetCacheEntry(cacheKey, data, ttl) {
        try {
            let plainData = data;
            if (data && typeof data.toJSON === 'function') {
                plainData = data.toJSON();
            } else if (Array.isArray(data)) {
                plainData = data.map((item) => (item && typeof item.toJSON === 'function' ? item.toJSON() : item));
            }
            const valueToStore = plainData === null ? NEGATIVE_CACHE_PLACEHOLDER : JSON.stringify(plainData);
            await this.redis.set(cacheKey, valueToStore, 'PX', ttl);
            this.cacheStats.sets++;
        } catch (err) {
            logger.error(`❌ [REDIS SET] Failed for key ${cacheKey}. Falling back. Error:`, err.message);
            this.isRedisConnected = false;
        }
    }

    /**
     * 🔴 (Private) Retrieves and deserializes an entry specifically from Redis.
     * It handles negative caching placeholders and rebuilds Sequelize instances from raw JSON data.
     * If the operation fails, it flags the Redis connection as down and returns a cache miss.
     * @param {string} cacheKey - The Redis key.
     * @returns {Promise<{hit: boolean, data: *|undefined}>} The cache result.
     * @private
     */
    static async _redisGetCachedEntry(cacheKey) {
        try {
            const result = await this.redis.get(cacheKey);
            if (result === null || result === undefined) return { hit: false, data: undefined };

            this.cacheStats.redisHits++;
            if (result === NEGATIVE_CACHE_PLACEHOLDER) return { hit: true, data: null };

            const parsedData = JSON.parse(result);

            if (typeof parsedData !== 'object' || parsedData === null) {
                return { hit: true, data: parsedData };
            }

            // --- MULAI LOGIKA PERAKITAN ULANG ---
            const rebuild = (data) => {
                const instance = this.build(data, { isNewRecord: false });
                if (data.tracks && Array.isArray(data.tracks)) {
                    const TrackModel = this.sequelize.models.PlaylistTrack;
                    if (TrackModel) {
                        const trackInstances = TrackModel.bulkBuild(data.tracks, { isNewRecord: false });
                        instance.tracks = trackInstances;
                        instance.dataValues.tracks = trackInstances;
                    }
                }
                return instance;
            };

            const finalInstance = Array.isArray(parsedData) ? parsedData.map(rebuild) : rebuild(parsedData);

            return { hit: true, data: finalInstance };
        } catch (err) {
            logger.error(`❌ [REDIS GET] Failed for key ${cacheKey}. Falling back. Error:`, err.message);
            this.isRedisConnected = false;
            return { hit: false, data: undefined };
        }
    }

    /**
     * 🔴 (Private) Deletes an entry specifically from Redis.
     * If the operation fails, it flags the Redis connection as down.
     * @param {string} cacheKey - The canonical cache key to delete.
     * @private
     */
    static async _redisClearCache(cacheKey) {
        try {
            await this.redis.del(cacheKey);
            this.cacheStats.clears++;
        } catch (err) {
            logger.error(`❌ [REDIS DEL] Failed for key ${JSON.stringify(cacheKey)}. Bypassing. Error:`, err.message);
            this.isRedisConnected = false;
        }
    }

    /**
     * 🗺️ (Private) Sets a cache entry specifically in the in-memory Map.
     * It clones the data to prevent mutation issues and handles negative caching.
     * Also manages a simple FIFO-like eviction policy if the cache size limit is reached.
     * @param {string} cacheKey - The Map key.
     * @param {*} data - The data to cache.
     * @param {number} ttl - The TTL in milliseconds.
     * @private
     */
    static _mapSetCacheEntry(cacheKey, data, ttl) {
        if (this.localCache.size >= this.MAX_LOCAL_CACHE_SIZE) {
            const firstKey = this.localCache.keys().next().value;
            this.localCache.delete(firstKey);
        }

        if (data === null) {
            this.localNegativeCache.add(cacheKey);
            this.localCache.delete(cacheKey);
        } else {
            let plainData = data;
            if (data && typeof data.toJSON === 'function') {
                plainData = data.toJSON();
            } else if (Array.isArray(data)) {
                plainData = data.map((item) => (item && typeof item.toJSON === 'function' ? item.toJSON() : item));
            }
            const dataCopy = plainData;
            this.localCache.set(cacheKey, { data: dataCopy, expires: Date.now() + ttl });
            this.localNegativeCache.delete(cacheKey);
        }
        this.cacheStats.sets++;
    }

    /**
     * 🗺️ (Private) Retrieves an entry specifically from the in-memory Map.
     * It checks for expired entries, handles negative caching, and rebuilds fresh
     * Sequelize instances from the stored plain objects to ensure data integrity.
     * @param {string} cacheKey - The Map key.
     * @returns {{hit: boolean, data: *|undefined}} The cache result.
     * @private
     */
    static _mapGetCachedEntry(cacheKey) {
        if (this.localNegativeCache.has(cacheKey)) {
            this.cacheStats.mapHits++;
            return { hit: true, data: null };
        }

        const entry = this.localCache.get(cacheKey);
        if (entry && entry.expires > Date.now()) {
            this.cacheStats.mapHits++;

            const parsedData = entry.data;

            if (typeof parsedData !== 'object' || parsedData === null) {
                return { hit: true, data: parsedData };
            }

            const rebuild = (data) => {
                const instance = this.build(data, { isNewRecord: false });
                if (data.tracks && Array.isArray(data.tracks)) {
                    const TrackModel = this.sequelize.models.PlaylistTrack;
                    if (TrackModel) {
                        const trackInstances = TrackModel.bulkBuild(data.tracks, { isNewRecord: false });
                        instance.tracks = trackInstances;
                        instance.dataValues.tracks = trackInstances;
                    }
                }
                return instance;
            };

            const finalInstance = Array.isArray(parsedData) ? parsedData.map(rebuild) : rebuild(parsedData);

            return { hit: true, data: finalInstance };
        }

        if (entry) this.localCache.delete(cacheKey);
        return { hit: false, data: undefined };
    }

    /**
     * 🗺️ (Private) Deletes an entry specifically from the in-memory Map.
     * @param {string} cacheKey - The canonical cache key to delete.
     * @private
     */
    static _mapClearCache(cacheKey) {
        this.localCache.delete(cacheKey);
        this.localNegativeCache.delete(cacheKey);
        this.cacheStats.clears++;
    }

    /**
     * 🔄 (Internal) Standardizes various query object formats into a consistent Sequelize options object.
     * This helper ensures that `getCache({ id: 1 })` and `getCache({ where: { id: 1 } })` are treated identically.
     * @param {Object} options - The user-provided query options.
     * @returns {Object} A standardized options object with a `where` property.
     * @private
     */
    static _normalizeFindOptions(options) {
        if (!options || typeof options !== 'object' || Object.keys(options).length === 0) return { where: {} };
        if (options.where) return options;
        const knownOptions = ['order', 'limit', 'attributes', 'include', 'group', 'having'];
        const whereClause = {};
        const otherOptions = {};
        for (const key in options) {
            if (knownOptions.includes(key)) otherOptions[key] = options[key];
            else whereClause[key] = options[key];
        }
        return { where: whereClause, ...otherOptions };
    }

    /**
     * 📦 fetches a single record from the cache, falling back to the database on a miss.
     * This is the primary method for retrieving individual model instances. It's fully hybrid-aware.
     * @param {Object} keys - A Sequelize `where` clause or a query options object.
     * @returns {Promise<Model|null>} A single model instance or null if not found.
     */
    static async getCache(keys, options = {}) {
        if (options.noCache) {
            return this.findOne(this._normalizeFindOptions(keys));
        }
        if (!keys || Array.isArray(keys)) {
            if (Array.isArray(keys)) {
                const pk = this.primaryKeyAttribute;
                return this.findAll({ where: { [pk]: keys.map((m) => m[pk]) } });
            }
            return null;
        }
        const normalizedOptions = this._normalizeFindOptions(keys);
        if (!normalizedOptions.where || Object.keys(normalizedOptions.where).length === 0) return null;
        const cacheKey = this.getCacheKey(normalizedOptions);

        const cacheResult = await this.getCachedEntry(cacheKey);
        if (cacheResult.hit) {
            return cacheResult.data;
        }

        this.cacheStats.misses++;

        if (this.pendingQueries.has(cacheKey)) {
            return this.pendingQueries.get(cacheKey);
        }

        const queryPromise = this.findOne(normalizedOptions)
            .then((record) => {
                this.setCacheEntry(cacheKey, record);
                return record;
            })
            .finally(() => {
                this.pendingQueries.delete(cacheKey);
            });

        this.pendingQueries.set(cacheKey, queryPromise);
        return queryPromise;
    }

    /**
     * 📦 Fetches an array of records from the cache, falling back to the database.
     * Ideal for caching lists of results from `findAll` queries. Fully hybrid-aware.
     * @param {Object} [options={}] - A Sequelize `findAll` options object (containing `where`, `order`, etc.).
     * @returns {Promise<Model[]>} An array of model instances.
     */
    static async getAllCache(options = {}) {
        if (options.noCache) {
            return this.findAll(this._normalizeFindOptions(options));
        }
        const normalizedOptions = this._normalizeFindOptions(options);
        const cacheKey = this.getCacheKey(normalizedOptions);

        const cacheResult = await this.getCachedEntry(cacheKey);
        if (cacheResult.hit) {
            return cacheResult.data;
        }

        this.cacheStats.misses++;

        if (this.pendingQueries.has(cacheKey)) {
            return this.pendingQueries.get(cacheKey);
        }

        const queryPromise = this.findAll(normalizedOptions)
            .then((records) => {
                this.setCacheEntry(cacheKey, records);
                return records;
            })
            .finally(() => {
                this.pendingQueries.delete(cacheKey);
            });

        this.pendingQueries.set(cacheKey, queryPromise);
        return queryPromise;
    }

    /**
     * 📦 Attempts to find a record based on `options.where`. If found, it returns the cached or DB record.
     * If not found, it creates a new record using `options.defaults`. The operation is cache-aware.
     * This method also includes in-memory locking to prevent race conditions.
     * @param {Object} options - A Sequelize `findOrCreate` options object.
     * @returns {Promise<[Model, boolean]>} An array containing the instance and a boolean indicating if it was created.
     */
    static async findOrCreateWithCache(options) {
        if (!options || !options.where) {
            throw new Error("findOrCreateWithCache requires a 'where' option.");
        }
        const cacheKey = this.getCacheKey(options.where);
        const cacheResult = await this.getCachedEntry(cacheKey);
        if (cacheResult.hit && cacheResult.data) {
            return [cacheResult.data, false];
        }
        this.cacheStats.misses++;
        if (this.pendingQueries.has(cacheKey)) {
            return this.pendingQueries.get(cacheKey);
        }
        const findOrCreatePromise = this.findOrCreate(options)
            .then(([instance, created]) => {
                this.setCacheEntry(cacheKey, instance);
                return [instance, created];
            })
            .finally(() => {
                this.pendingQueries.delete(cacheKey);
            });

        this.pendingQueries.set(cacheKey, findOrCreatePromise);
        return findOrCreatePromise;
    }

    /**
     * 📦 Fetches the count of records matching the query from the cache, falling back to the database.
     * @param {Object} [options={}] - A Sequelize `count` options object.
     * @param {number} [ttl] - A specific TTL for this count operation.
     * @returns {Promise<number>} The total number of matching records.
     */
    static async countWithCache(options = {}, ttl = 5 * 60 * 1000) {
        const cacheKeyOptions = { queryType: 'count', ...options };
        const cacheKey = this.getCacheKey(cacheKeyOptions);
        const cacheResult = await this.getCachedEntry(cacheKey);
        if (cacheResult.hit) {
            return cacheResult.data;
        }
        this.cacheStats.misses++;
        const count = await this.count(options);
        this.setCacheEntry(cacheKey, count, ttl);
        return count;
    }

    /**
     * 📦 An instance method that saves the current model instance to the database and then
     * intelligently updates its corresponding entry in the active cache.
     * @returns {Promise<this>} The saved instance.
     */
    async saveAndUpdateCache() {
        const savedInstance = await this.save();
        const pk = this.constructor.primaryKeyAttribute;
        const pkValue = this[pk];
        if (pkValue) {
            const cacheKey = this.constructor.getCacheKey({ [pk]: pkValue });
            await this.constructor.setCacheEntry(cacheKey, savedInstance);
        }
        return savedInstance;
    }

    /**
     * 📦 A convenience alias for `clearCache`. In the hybrid system, positive and negative
     * cache entries for the same key are managed together, so clearing one clears the other.
     * @param {string|Object} keys - The query identifier to clear.
     */
    static async clearNegativeCache(keys) {
        return this.clearCache(keys);
    }

    /**
     * 🪝 Attaches Sequelize lifecycle hooks (`afterSave`, `afterDestroy`, etc.) to this model.
     * These hooks automatically and intelligently invalidate or update cache entries
     * in the active cache engine (Redis or Map) whenever data changes.
     */
    static initializeCacheHooks() {
        if (!this.redis) {
            logger.warn(`❌ Redis not initialized for model ${this.name}. Cache hooks will not be attached.`);
            return;
        }

        const getAllCacheKeysFor = (instance) => {
            const modelClass = instance.constructor;
            const keys = new Set();
            const potentialKeyObjects = [];
            const pkAttributes = modelClass.primaryKeyAttributes;
            if (pkAttributes && pkAttributes.length > 0) {
                const pkObj = {};
                if (pkAttributes.every((pk) => instance[pk] != null)) {
                    pkAttributes.forEach((pk) => (pkObj[pk] = instance[pk]));
                    potentialKeyObjects.push(pkObj);
                }
            }
            if (Array.isArray(modelClass.CACHE_KEYS)) {
                for (const keyFields of modelClass.CACHE_KEYS) {
                    const keyObj = {};
                    if (keyFields.every((f) => instance[f] != null)) {
                        keyFields.forEach((f) => (keyObj[f] = instance[f]));
                        potentialKeyObjects.push(keyObj);
                    }
                }
            }
            for (const keyObj of potentialKeyObjects) {
                // Always use canonical cache key format
                keys.add(modelClass.getCacheKey(keyObj));
                keys.add(modelClass.getCacheKey({ where: keyObj }));
            }
            return Array.from(keys);
        };

        const clearAllModelCaches = async () => {
            const modelName = this.name;
            const prefix = `${this.CACHE_VERSION}:${modelName}:`;

            if (this.isRedisConnected) {
                logger.warn(`🔄 Bulk change in ${modelName}, clearing ALL related Redis caches using SCAN.`);
                const stream = this.redis.scanStream({ match: `${prefix}*`, count: 100 });
                stream.on('data', (keys) => {
                    if (keys.length && this.isRedisConnected) {
                        this.redis.del(keys).catch((err) => {
                            logger.error('❌ [CACHE BULK DEL] Failed during scan stream:', err.message);
                            this.isRedisConnected = false;
                        });
                    }
                });
                stream.on('end', () => logger.info(`🔄 Finished clearing Redis caches for ${modelName}.`));
            } else {
                logger.warn(`🔄 Bulk change in ${modelName}, clearing ALL related In-Memory caches.`);
                let clearedCount = 0;
                for (const key of this.localCache.keys()) {
                    if (key.startsWith(prefix)) {
                        this.localCache.delete(key);
                        clearedCount++;
                    }
                }
                for (const key of this.localNegativeCache.keys()) {
                    if (key.startsWith(prefix)) {
                        this.localNegativeCache.delete(key);
                        clearedCount++;
                    }
                }
                logger.info(`🔄 Finished clearing ${clearedCount} In-Memory cache entries for ${modelName}.`);
            }
        };

        const broadcastInvalidation = (keysToClear) => {
            if (!this.isRedisConnected && this.client && this.client.shard) {
                logger.info(`📡 [SHARD SYNC] Broadcasting invalidation for ${this.name}...`);
                this.client.shard
                    .broadcastEval(
                        (c, { modelName, keys }) => {
                            const models = c.sequelize.models;
                            const TargetModel = models[modelName];
                            if (TargetModel && typeof TargetModel._mapClearCache === 'function') {
                                for (const key of keys) {
                                    TargetModel._mapClearCache(key);
                                }
                                return true;
                            }
                        },
                        {
                            context: { modelName: this.name, keys: keysToClear },
                        }
                    )
                    .catch((err) => logger.error('❌ [SHARD SYNC] Broadcast failed:', err));
            }
        };

        const afterSaveLogic = async (instance) => {
            logger.info(`🔄 afterSave for ${this.name}`);
            const cacheKeys = getAllCacheKeysFor(instance);
            if (cacheKeys.length > 0) {
                logger.info(`🔄 Updating cache for keys: ${cacheKeys.join(', ')}`);
                for (const key of cacheKeys) {
                    await this.setCacheEntry(key, instance);
                }
            }
            await clearAllModelCaches();
            broadcastInvalidation(cacheKeys);
        };

        const afterDestroyLogic = async (instance) => {
            logger.info(`🔄 afterDestroy for ${this.name}`);
            const cacheKeys = getAllCacheKeysFor(instance);

            if (this.isRedisConnected && cacheKeys.length > 0) {
                logger.info(`🔄 Deleting cache for keys: ${cacheKeys.join(', ')}`);
                await this.redis.del(cacheKeys).catch(() => {});
            }

            for (const key of cacheKeys) {
                await this.setCacheEntry(key, null);
            }
            await clearAllModelCaches();
            broadcastInvalidation(cacheKeys);
        };

        this.addHook('afterSave', afterSaveLogic);
        this.addHook('afterDestroy', afterDestroyLogic);
        this.addHook('afterBulkCreate', clearAllModelCaches);
        this.addHook('afterBulkUpdate', clearAllModelCaches);
        this.addHook('afterBulkDestroy', clearAllModelCaches);
    }

    /**
     * 🪝 Iterates through all registered Sequelize models and attaches the cache hooks
     * to any model that extends `KythiaModel`. This should be called once after all models
     * have been defined and loaded.
     * @param {Sequelize} sequelizeInstance - The active Sequelize instance containing all models.
     */
    static attachHooksToAllModels(sequelizeInstance, client) {
        if (!this.redis) {
            logger.error('❌ Cannot attach hooks because Redis is not initialized.');
            return;
        }

        for (const modelName in sequelizeInstance.models) {
            const model = sequelizeInstance.models[modelName];
            if (model.prototype instanceof KythiaModel) {
                model.client = client;
                logger.info(`⚙️  Attaching hooks to ${model.name}`);
                model.initializeCacheHooks();
            }
        }
    }
}

module.exports = KythiaModel;
