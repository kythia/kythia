/**
 * @namespace: addons/dashboard/web/helpers/session.js
 * @type: Helper Script
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const session = require('express-session');

/**
 * Session store with in-memory caching to reduce calls to the backing store.
 */
class CachedSessionStore extends session.Store {
    constructor(backingStore, options = {}) {
        super(options);
        this.backingStore = backingStore;
        this.cache = new Map();
        this.ttl = options.ttl || 1000 * 60 * 60;
        this.negativeTtl = options.negativeTtl || 1000 * 60 * 5;
    }

    /**
     * Retrieves a session by ID.
     * Positive hits are cached for `ttl`; misses are cached for `negativeTtl`.
     * @param {string} sid - Session ID
     * @param {(err: any, session?: object|null) => void} callback - Node-style callback
     */
    get = (sid, callback) => {
        const cachedEntry = this.cache.get(sid);
        if (cachedEntry && cachedEntry.expires > Date.now()) {
            return callback(null, cachedEntry.data);
        }

        this.backingStore.get(sid, (err, sessionData) => {
            if (err) {
                return callback(err);
            }

            if (sessionData) {
                this.cache.set(sid, {
                    data: sessionData,
                    expires: Date.now() + this.ttl,
                });
            } else {
                this.cache.set(sid, {
                    data: null,
                    expires: Date.now() + this.negativeTtl,
                });
            }
            return callback(null, sessionData);
        });
    };

    /**
     * Stores a session by ID and updates the cache.
     * @param {string} sid - Session ID
     * @param {object} sessionData - Session payload
     * @param {(err?: any) => void} callback - Completion callback
     */
    set = (sid, sessionData, callback) => {
        this.cache.set(sid, {
            data: sessionData,
            expires: Date.now() + this.ttl,
        });
        this.backingStore.set(sid, sessionData, callback);
    };

    /**
     * Destroys a session and removes it from the cache.
     * @param {string} sid - Session ID
     * @param {(err?: any) => void} callback - Completion callback
     */
    destroy = (sid, callback) => {
        this.cache.delete(sid);
        this.backingStore.destroy(sid, callback);
    };
}

module.exports = CachedSessionStore;
