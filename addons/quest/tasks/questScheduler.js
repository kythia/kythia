/**
 * @namespace: addons/quest/tasks/questScheduler.js
 * @type: Scheduled Task
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */
const cron = require('node-cron');
const { buildQuestNotification } = require('../helpers/questHelper');
const { Op } = require('sequelize');

/**
 * Try a list of API URLs and return the first successful quests response.
 * @param {string[]} urls
 * @param {object} logger
 * @returns {Promise<null|Array>} - API Quests array, or null if all fail
 */

async function fetchQuestsFromAny(urls, logger) {
    const TIMEOUT_MS = 5000;

    for (let url of urls) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
            logger.warn(`[QuestNotifier] API timeout (5s) for ${url}. Aborting...`);
            controller.abort();
        }, TIMEOUT_MS);

        try {
            logger.info(`[QuestNotifier] Trying quest API: ${url}`);

            const response = await fetch(url, {
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                logger.warn(`[QuestNotifier] API fetch failed with status ${response.status} for ${url}`);
                continue;
            }

            const apiQuests = await response.json();
            logger.info(`[QuestNotifier] Got quest data from: ${url}`);
            return apiQuests;
        } catch (e) {
            clearTimeout(timeoutId);

            if (e.name === 'AbortError') {
                continue;
            } else {
                logger.warn(`[QuestNotifier] Error fetching from ${url}: ${e.message}`);
            }
        }
    }

    return null;
}

async function checkQuests(container) {
    const { models, logger, client, t, kythiaConfig } = container;
    const { QuestConfig, QuestGuildLog } = models;
    logger.info('[QuestNotifier] Running cron job...');

    const apiUrlsConfig = kythiaConfig.addons.quest.apiUrls || '';

    const apiUrls = apiUrlsConfig
        .split(',')
        .map((v) => v.trim())
        .filter((v) => v.length > 0);

    if (apiUrls.length === 0) {
        logger.error('[QuestNotifier] No API URLs configured!');
        return;
    }

    try {
        const apiQuests = await fetchQuestsFromAny(apiUrls, logger);

        if (!apiQuests) {
            logger.error('[QuestNotifier] All API quest endpoints failed. No quests retrieved.');
            return;
        }

        const now = new Date();
        const TwodayAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

        const validQuests = apiQuests.filter((quest) => {
            const startsAt = new Date(quest.config.starts_at);
            const expiresAt = new Date(quest.config.expires_at);

            const isExpired = expiresAt < now;
            const isTooOld = startsAt < TwodayAgo;

            return !isExpired && !isTooOld;
        });

        if (validQuests.length === 0) {
            logger.info('[QuestNotifier] No new quests found.');
            return;
        }

        const allGuildConfigs = await QuestConfig.getAllCache();
        if (allGuildConfigs.length === 0) {
            logger.info('[QuestNotifier] No guilds have set up the notifier.');
            return;
        }

        const validQuestIds = validQuests.map((q) => q.id);

        for (const config of allGuildConfigs) {
            try {
                const channel = await client.channels.fetch(config.channelId, { force: true }).catch(() => null);
                if (!channel) {
                    logger.warn(`[QuestNotifier] Channel ${config.channelId} not found for guild ${config.guildId}. Skipping.`);
                    continue;
                }

                const sentLogs = await QuestGuildLog.getAllCache({
                    where: {
                        guildId: config.guildId,
                        questId: { [Op.in]: validQuestIds },
                    },
                    attributes: ['questId'],
                });
                const sentQuestIds = new Set(sentLogs.map((log) => log.questId));

                const questsToSend = validQuests.filter((quest) => !sentQuestIds.has(quest.id));

                if (questsToSend.length === 0) continue;

                logger.info(`[QuestNotifier] Sending ${questsToSend.length} new quest(s) to guild ${config.guildId}...`);

                for (const quest of questsToSend) {
                    let role = config.roleId ? `<@&${config.roleId}>` : null;
                    const { components, flags } = await buildQuestNotification(container, quest, role);

                    await channel.send({ components, flags });

                    await QuestGuildLog.create({
                        guildId: config.guildId,
                        questId: quest.id,
                    });
                }
            } catch (guildError) {
                logger.error(`[QuestNotifier] Failed to process guild ${config.guildId}: ${guildError.message}`);
            }
        }
        logger.info('[QuestNotifier] Cron job finished.');
    } catch (error) {
        logger.error(`[QuestNotifier] CRON JOB FAILED: ${error.message}`);
    }
}

function initializeQuestScheduler(bot) {
    const container = bot.client.container;
    const { logger } = container;

    cron.schedule('*/30 * * * *', () => checkQuests(container));

    logger.info('⏰ [QuestNotifier] Cron job scheduled (every 30 minutes).');

    checkQuests(container);
}

module.exports = {
    initializeQuestScheduler,
    checkQuests,
};
