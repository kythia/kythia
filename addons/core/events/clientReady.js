/**
 * @namespace: addons/core/events/clientReady.js
 * @type: Event Handler
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta
 */

const ServerSetting = require('../database/models/ServerSetting');
const { updateStats } = require('../helpers/stats');
const { ActivityType } = require('discord.js');
const { t } = require('@utils/translator');
const logger = require('@utils/logger');
const Sentry = require('@sentry/node');

function setBotPresence(client) {
    if (!client.user) {
        logger.error('❌ client.user is undefined, cannot set presence.');
        return;
    }

    try {
        let activityType = ActivityType[kythia.bot.activityType];
        if (activityType === undefined) {
            logger.warn(`Invalid activityType '${kythia.bot.activityType}', defaulting to 'Playing'.`);
            activityType = ActivityType.Playing;
        }
        client.user.setPresence({
            activities: [{
                name: kythia.bot.activity,
                type: activityType,
                url: kythia.bot.streakUrl || null
            }],
            status: kythia.bot.status || 'online',
        });
        logger.info('✅ Bot presence has been set.');
    } catch (err) {
        logger.error('❌ Failed to set bot presence:', err);
    }
}

async function runStatsUpdater(client) {
    logger.info('📊 Starting server stats update cycle...');
    try {
        const allSettings = await ServerSetting.getAllCache();
        const guildsCache = client.guilds.cache;

        if (!guildsCache) {
            logger.error('❌ client.guilds.cache is unavailable during stats update.');
            return;
        }

        const activeSettings = allSettings.filter((s) => guildsCache.has(s.guildId) && s.serverStatsOn);

        if (activeSettings.length === 0) {
            logger.info('📊 No guilds with active server stats. Skipping update cycle.');
            return;
        }

        logger.info(`📊 Found ${activeSettings.length} guild(s) to update stats for.`);

        await updateStats(client, activeSettings);
        logger.info('📊 Server stats update cycle finished.');
    } catch (err) {
        logger.error('❌ A critical error occurred in runStatsUpdater:', err);
        if (kythia.sentry.dsn) {
            Sentry.captureException(err);
        }
    }
}

module.exports = async (bot, client) => {
    setBotPresence(client);

    setTimeout(() => runStatsUpdater(client), 5000);

    const statsInterval = 10 * 60 * 1000;
    setInterval(() => runStatsUpdater(client), statsInterval);

    logger.info(`🕒 Server stats updater scheduled to run every ${statsInterval / 60000} minutes.`);
};
