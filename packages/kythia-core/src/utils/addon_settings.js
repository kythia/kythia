/**
 * @file src/utils/addon_settings.js
 * @description Utilities to read and update per-addon settings stored within `ServerSetting`.
 * This module provides helpers to safely access a specific addon's settings and to merge updates
 * without clobbering existing values.
 * @copyright © 2025 kenndeclouv
 * @version 0.9.9-beta
 */
const ServerSetting = require('@coreModels/ServerSetting');

/**
 * Gets settings for a specific addon from the main `ServerSetting` object.
 * Automatically handles the case where the addon does not yet have any settings.
 *
 * @param {object} settings - The `ServerSetting` object retrieved from the database.
 * @param {string} addonName - The addon name (e.g., 'economy', 'leveling').
 * @returns {object} The settings object for that addon, or an empty object if none exist.
 */
function getAddonSettings(settings, addonName) {
    if (!settings || !settings.addonSettings) {
        return {};
    }
    return settings.addonSettings[addonName] || {};
}

/**
 * Updates settings for a specific addon in the database. The new values are merged with
 * existing settings so you can update a single key without losing others.
 *
 * @param {string} guildId - Target guild ID.
 * @param {string} addonName - Addon name to update (e.g., 'economy').
 * @param {object} newSettings - New settings to persist for the addon.
 * @returns {Promise<object>} The updated `ServerSetting` instance.
 */
async function setAddonSettings(guildId, addonName, newSettings) {
    // 1) Fetch or create the ServerSetting record for this guild
    const [settings] = await ServerSetting.findOrCreate({
        where: { guildId },
        // `guildName` will be kept in sync when the bot joins or when activity occurs
        defaults: { guildId, guildName: 'Unknown Guild Name' },
    });

    // 2) Get previous settings (if any) for this addon
    const currentAddonSettings = settings.addonSettings[addonName] || {};

    // 3) Merge existing and new settings. New keys overwrite previous values
    const mergedSettings = { ...currentAddonSettings, ...newSettings };

    // 4) Prepare the complete addonSettings object to be saved back
    const allAddonSettings = {
        ...(settings.addonSettings || {}),
        [addonName]: mergedSettings,
    };

    // 5) Persist to database
    await settings.update({ addonSettings: allAddonSettings });

    console.log(`Updated settings for addon '${addonName}' in guild '${guildId}'`);
    return settings;
}

module.exports = {
    getAddonSettings,
    setAddonSettings,
};
