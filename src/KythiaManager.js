/**
 * 🧭 Kythia Manager
 *
 * @file src/KythiaManager.js
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta
 *
 * @description
 * Lightweight manager for accessing and updating per-guild settings with an
 * in-memory cache. It reduces database hits by caching settings in a
 * `Collection` and keeping them synchronized after updates.
 */

const { Collection } = require('discord.js');
const logger = require('@utils/logger');

class KythiaManager {
    /**
     * @param {import('sequelize').Model} serverSettingModel Sequelize model for `ServerSetting`.
     */
    constructor(serverSettingModel) {
        /**
         * @type {Collection<string, object>}
         * @private
         */
        this._cache = new Collection();
        /**
         * @private
         */
        this._model = serverSettingModel;

        logger.info('🔧 KythiaManager initialized.');
    }

    /**
     * Loads all settings from the database into the in-memory cache.
     * Call this during bot startup for optimal performance.
     */
    async warmCache() {
        logger.info('🔥 Warming up KythiaManager cache...');
        try {
            const allSettings = await this._model.findAll();
            for (const setting of allSettings) {
                this._cache.set(setting.guildId, setting);
            }
            logger.info(`✅ Settings cache warmed with ${this._cache.size} guilds.`);
        } catch (error) {
            logger.error('❌ Failed to warm settings cache:', error);
        }
    }

    /**
     * Retrieves settings for a guild.
     * Uses the cache if available, otherwise queries the database.
     * Creates a new entry if the guild does not exist yet.
     * @param {string} guildId The guild ID to fetch settings for.
     * @returns {Promise<object|null>} The Sequelize settings instance or null on error.
     */
    async get(guildId) {
        // 1. Cek cache dulu
        if (this._cache.has(guildId)) {
            return this._cache.get(guildId);
        }

        try {
            // 2. Otherwise, look in the database
            let settings = await this._model.findOne({ where: { guildId } });

            // 3. If not found (newly joined guild), create a new entry
            if (!settings) {
                logger.info(`Creating new settings entry for guild ${guildId}...`);
                settings = await this._model.create({ guildId: guildId });
            }

            // 4. Store in cache for subsequent lookups
            this._cache.set(guildId, settings);
            return settings;
        } catch (error) {
            logger.error(`Error fetching settings for guild ${guildId}:`, error);
            return null;
        }
    }

    /**
     * Updates settings for a guild in both the database and the cache.
     * @param {string} guildId Guild ID to update.
     * @param {object} data Partial settings object to apply.
     * @returns {Promise<object|null>} The updated settings instance or null on error.
     */
    async update(guildId, data) {
        try {
            // Use `get` to ensure the guild entry exists (cache & DB)
            const settings = await this.get(guildId);
            if (!settings) {
                throw new Error('Could not find or create settings for this guild.');
            }

            // 1. Update the database
            await this._model.update(data, { where: { guildId } });

            // 2. Update cache to stay in sync
            const updatedSettings = Object.assign(settings, data);
            this._cache.set(guildId, updatedSettings);

            logger.info(`Settings updated for guild ${guildId}.`);
            return updatedSettings;
        } catch (error) {
            logger.error(`Error updating settings for guild ${guildId}:`, error);
            return null;
        }
    }
    /**
     * Removes a guild's settings from the cache.
     * Useful when the bot leaves a server.
     * @param {string} guildId Guild ID to remove from cache.
     */
    removeFromCache(guildId) {
        if (this._cache.has(guildId)) {
            this._cache.delete(guildId);
            logger.info(`Removed guild ${guildId} from settings cache.`);
        }
    }
}

module.exports = KythiaManager;
