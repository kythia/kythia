/**
 * @namespace: addons/globalchat/tasks/webhookHealthCheck.js
 * @type: Scheduled Task
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const fetch = require('node-fetch');
const cron = require('node-cron');
const { handleFailedGlobalChat } = require('../helpers/handleFailedGlobalChat');

/**
 * Sleep for ms milliseconds
 * @param {number} ms
 * @returns {Promise<void>}
 */
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Initializes the webhook health check task for Global Chat.
 * Syncs with both API and the local DB, then checks each webhook for health.
 * If API/DB out of sync, attempts DB fix; dead webhooks trigger self-heal.
 * @param {object} bot - The bot instance with client, logger, container
 */
function initializeWebhookHealthCheck(bot) {
    const client = bot.client;
    const container = bot.client.container;
    const { logger, models, kythiaConfig } = container;
    const { GlobalChat } = models;

    const apiUrl = kythiaConfig.addons.globalchat.apiUrl;
    const apiKey = kythiaConfig.addons.globalchat.apiKey;
    const schedule = kythiaConfig.addons.globalchat.healthCheckSchedule || '0 */1 * * *';
    const checkDelayMs = kythiaConfig.addons.globalchat.healthCheckDelay || 1000;

    logger.info(`🌏 [GlobalChat] Initializing webhook health check SYNC task with schedule: ${schedule}`);

    cron.schedule(
        schedule,
        async () => {
            logger.info('🌏 [GlobalChat] Starting webhook health check (API+DB sync, then probe)...');

            // Step 1: Get list from API
            let apiGuilds;
            try {
                const apiRes = await fetch(`${apiUrl}/list`, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${apiKey}`,
                    },
                });
                if (!apiRes.ok) throw new Error(`API /list returned status ${apiRes.status}`);
                const apiData = await apiRes.json();
                if (apiData.status !== 'ok' || !Array.isArray(apiData.data?.guilds)) {
                    throw new Error(`API /list failed or returned invalid data: ${apiData.message || apiData.error || 'Unknown error'}`);
                }
                apiGuilds = apiData.data.guilds;
            } catch (apiErr) {
                logger.error(`❌ [GlobalChat-Cron] Failed to fetch /list from API:`, apiErr);
                return;
            }

            // Step 2: Get local DB list
            let dbGuilds;
            try {
                dbGuilds = await GlobalChat.getAllCache();
            } catch (err) {
                logger.error('❌ [GlobalChat-Cron] Failed to fetch guild list from local DB:', err);
                return;
            }

            // Sanity: Prepare guild sets for easier lookup
            const dbGuildMap = new Map(dbGuilds.map((g) => [g.guildId, g]));
            const apiGuildMap = new Map(apiGuilds.map((g) => [g.id, g]));

            // Step 3: Compare and sync: Are all API guilds also in DB?
            // If API has a guild that's missing or badly out of sync DB, warn/fix.
            for (const apiGuild of apiGuilds) {
                const dbEntry = dbGuildMap.get(apiGuild.id);

                const shouldUpdate =
                    !dbEntry ||
                    dbEntry.globalChannelId !== apiGuild.globalChannelId ||
                    dbEntry.webhookId !== apiGuild.webhookId ||
                    dbEntry.webhookToken !== apiGuild.webhookToken;

                if (shouldUpdate) {
                    logger.warn(
                        `⚠️ [GlobalChat-Cron] DB desync: Entry for ${apiGuild.guildName || apiGuild.id} is missing/out-of-date vs API. Will update local DB cache.`
                    );
                    // Use update; if no rows updated, perform create (save fallback)
                    try {
                        const updateRes = await GlobalChat.update(
                            {
                                guildName: apiGuild.guildName,
                                globalChannelId: apiGuild.globalChannelId,
                                webhookId: apiGuild.webhookId,
                                webhookToken: apiGuild.webhookToken,
                            },
                            {
                                where: { guildId: apiGuild.id },
                            }
                        );
                        // If nothing was updated (updateRes[0] === 0 or falsey), create a new record
                        let updatedCount = (Array.isArray(updateRes) ? updateRes[0] : updateRes) || 0;
                        if (!updatedCount) {
                            // fallback to create, using save
                            const newRec = GlobalChat.build({
                                guildId: apiGuild.id,
                                guildName: apiGuild.guildName,
                                globalChannelId: apiGuild.globalChannelId,
                                webhookId: apiGuild.webhookId,
                                webhookToken: apiGuild.webhookToken,
                            });
                            await newRec.save();
                        }
                    } catch (err) {
                        logger.error(`❌ [GlobalChat-Cron] Failed to update DB from API for guild ${apiGuild.id}:`, err);
                    }
                }
            }

            // Step 4: Health check all webhooks (only for guilds we are still in)
            const managedGuildsToCheck = dbGuilds.filter((g) => client.guilds.cache.has(g.guildId));

            logger.info(`🌏 [GlobalChat-Cron] Checking webhook health for ${managedGuildsToCheck.length} guild(s) in our local DB...`);

            for (const guildInfo of managedGuildsToCheck) {
                // Only check if present in API as well (should be after sync above, but extra safety)
                const apiGuild = apiGuildMap.get(guildInfo.guildId);
                if (!apiGuild) {
                    logger.warn(`[GlobalChat-Cron] Skipping guild ${guildInfo.guildId}: not present in latest API list.`);
                    continue;
                }

                try {
                    const webhookUrl = `https://discord.com/api/webhooks/${guildInfo.webhookId}/${guildInfo.webhookToken}`;
                    const webhookRes = await fetch(webhookUrl);

                    if (webhookRes.status === 404) {
                        logger.warn(
                            `⚠️ [GlobalChat-Cron] DEAD webhook (404) for guild ${guildInfo.guildName || guildInfo.guildId}. Will trigger self-heal!`
                        );
                        const failedGuild = {
                            guildId: guildInfo.guildId,
                            guildName:
                                guildInfo.guildName ||
                                (await client.guilds.fetch(guildInfo.guildId).catch(() => null))?.name ||
                                guildInfo.guildId,
                            error: 'Proactive check failed: 404 Not Found',
                        };
                        handleFailedGlobalChat([failedGuild], container).catch((err) => {
                            logger.error(`❌ [GlobalChat-Cron] Self-heal attempt failed:`, err);
                        });
                    } else if (!webhookRes.ok) {
                        logger.warn(`⚠️ [GlobalChat-Cron] Webhook for ${guildInfo.guildId} returned non-OK status: ${webhookRes.status}`);
                    }
                } catch (fetchErr) {
                    logger.error(`❌ [GlobalChat-Cron] Error fetching webhook for guild ${guildInfo.guildId}:`, fetchErr);
                }
                await sleep(checkDelayMs);
            }

            logger.info('🌏 [GlobalChat] Webhook health check (API+DB sync & probe) finished.');
        },
        {
            timezone: kythiaConfig.bot.timezone,
        }
    );
}

module.exports = { initializeWebhookHealthCheck };
