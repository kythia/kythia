/**
 * @namespace: addons/dashboard/web/helpers/settings.js
 * @type: Helper Script
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const fs = require('fs');
const path = require('path');

/**
 * Get all available languages from the language directory
 * @returns {Array} Array of language objects with name and value
 */
function getAvailableLanguages() {
    const langDir = path.join(__dirname, '../../core/lang');
    let availableLanguages = [];

    try {
        const files = fs.readdirSync(langDir);
        availableLanguages = files
            .filter((file) => file.endsWith('.json'))
            .map((file) => {
                const langCode = path.basename(file, '.json');
                try {
                    const langData = JSON.parse(fs.readFileSync(path.join(langDir, file), 'utf8'));
                    return {
                        name: langData.languageName || langCode,
                        value: langCode,
                    };
                } catch {
                    return {
                        name: langCode,
                        value: langCode,
                    };
                }
            });
            console.log(availableLanguages);
    } catch (e) {
        availableLanguages = [{ name: 'English', value: 'en' }];
    }

    return availableLanguages;
}

/**
 * Ensure that a database field is properly formatted as an array
 * @param {*} dbField - Field from database
 * @returns {Array} Properly formatted array
 */
function ensureArray(dbField) {
    if (Array.isArray(dbField)) {
        return dbField;
    }
    if (typeof dbField === 'string') {
        try {
            const parsed = JSON.parse(dbField);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }
    return [];
}

/**
 * Get feature toggle settings for a server
 * @param {Object} settings - Server settings object
 * @returns {Object} Feature toggle status
 */
function getFeatureToggles(settings) {
    return {
        antiInviteOn: settings.antiInviteOn || false,
        antiLinkOn: settings.antiLinkOn || false,
        antiSpamOn: settings.antiSpamOn || false,
        antiBadwordOn: settings.antiBadwordOn || false,
        antiMentionOn: settings.antiMentionOn || false,
        serverStatsOn: settings.serverStatsOn || false,
        levelingOn: settings.levelingOn || false,
        welcomeInOn: settings.welcomeInOn || false,
        welcomeOutOn: settings.welcomeOutOn || false,
        adventureOn: settings.adventureOn || false,
        streakOn: settings.streakOn || false,
        minecraftStatsOn: settings.minecraftStatsOn || false,
        invitesOn: settings.invitesOn || false,
        rolePrefixOn: settings.rolePrefixOn || false,
    };
}

/**
 * Get server statistics summary
 * @param {Object} guild - Discord guild object
 * @param {Object} settings - Server settings object
 * @returns {Object} Server statistics
 */
function getServerStats(guild, settings) {
    return {
        memberCount: guild.memberCount,
        channelCount: guild.channels.cache.size,
        roleCount: guild.roles.cache.size,
        enabledFeatures: Object.values(getFeatureToggles(settings)).filter(Boolean).length,
        totalFeatures: Object.keys(getFeatureToggles(settings)).length,
        language: settings.lang || 'en',
        hasWelcome: !!(settings.welcomeInChannelId || settings.welcomeOutChannelId),
        hasLeveling: !!settings.levelingChannelId,
        hasStats: !!(settings.serverStats && settings.serverStats.length > 0),
    };
}

/**
 * Validate server setting values
 * @param {Object} data - Form data
 * @param {string} category - Setting category
 * @returns {Object} Validation result
 */
function validateSettings(data, category) {
    const errors = [];

    switch (category) {
        case 'leveling':
            if (data.levelingXp && (data.levelingXp < 1 || data.levelingXp > 1000)) {
                errors.push('XP per message must be between 1 and 1000');
            }
            if (data.levelingCooldown && (data.levelingCooldown < 1 || data.levelingCooldown > 3600)) {
                errors.push('XP cooldown must be between 1 and 3600 seconds');
            }
            break;

        case 'welcome':
            if (data.welcomeInBackgroundUrl && !isValidUrl(data.welcomeInBackgroundUrl)) {
                errors.push('Welcome in background URL must be a valid URL');
            }
            if (data.welcomeOutBackgroundUrl && !isValidUrl(data.welcomeOutBackgroundUrl)) {
                errors.push('Welcome out background URL must be a valid URL');
            }
            break;

        case 'minecraft':
            if (data.minecraftPort && (data.minecraftPort < 1 || data.minecraftPort > 65535)) {
                errors.push('Minecraft port must be between 1 and 65535');
            }
            break;
    }

    return {
        isValid: errors.length === 0,
        errors: errors,
    };
}

/**
 * Check if a string is a valid URL
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid URL
 */
function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

/**
 * Format cooldown value for display
 * @param {number} seconds - Cooldown in seconds
 * @returns {string} Formatted cooldown string
 */
function formatCooldown(seconds) {
    if (seconds < 60) {
        return `${seconds} seconds`;
    } else if (seconds < 3600) {
        return `${Math.floor(seconds / 60)} minutes`;
    } else if (seconds < 86400) {
        return `${Math.floor(seconds / 3600)} hours`;
    } else {
        return `${Math.floor(seconds / 86400)} days`;
    }
}

/**
 * Get setting categories with their descriptions
 * @returns {Object} Setting categories
 */
function getSettingCategories() {
    return {
        automod: {
            name: 'Automod',
            description: 'Anti-spam and moderation features',
            icon: 'fas fa-shield-alt',
            color: 'danger',
        },
        stats: {
            name: 'Server Stats',
            description: 'Dynamic server statistics channels',
            icon: 'fas fa-chart-line',
            color: 'info',
        },
        welcome: {
            name: 'Welcome System',
            description: 'Member onboarding and greetings',
            icon: 'fas fa-hand-wave',
            color: 'success',
        },
        leveling: {
            name: 'Leveling System',
            description: 'XP and level progression',
            icon: 'fas fa-trophy',
            color: 'warning',
        },
        minecraft: {
            name: 'Minecraft',
            description: 'Minecraft server integration',
            icon: 'fas fa-cube',
            color: 'secondary',
        },
        language: {
            name: 'Language',
            description: 'Bot language settings',
            icon: 'fas fa-language',
            color: 'primary',
        },
        testimony: {
            name: 'Testimony',
            description: 'User feedback system',
            icon: 'fas fa-comment-dots',
            color: 'info',
        },
        ai: {
            name: 'AI Features',
            description: 'AI-powered features',
            icon: 'fas fa-robot',
            color: 'primary',
        },
        streak: {
            name: 'Streak System',
            description: 'Daily streak tracking',
            icon: 'fas fa-fire',
            color: 'danger',
        },
        channels: {
            name: 'Channels',
            description: 'Channel-specific settings',
            icon: 'fas fa-hashtag',
            color: 'success',
        },
        features: {
            name: 'Feature Toggle',
            description: 'Enable/disable features',
            icon: 'fas fa-toggle-on',
            color: 'warning',
        },
    };
}

module.exports = {
    getAvailableLanguages,
    ensureArray,
    getFeatureToggles,
    getServerStats,
    validateSettings,
    isValidUrl,
    formatCooldown,
    getSettingCategories,
};
