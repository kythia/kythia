/**
 * @namespace: addons/globalchat/helpers/handleFailedGlobalChat.js
 * @type: Helper Script
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const fetch = require('node-fetch');
const { PermissionsBitField } = require('discord.js');

/**
 * Attempts to automatically fix broken webhooks for guilds that failed delivery.
 * Fetches guild info, creates a new webhook, updates the API, and persists in DB.
 * @param {Array<{guildId: string, guildName?: string, error: string}>} failedGuilds - Array of failed guilds from API response.
 * @param {object} container - The Kythia container object (client, logger, kythiaConfig, models, etc.).
 */
async function handleFailedGlobalChat(failedGuilds, container) {
    const { logger, client, kythiaConfig, models } = container;
    const { GlobalChat } = models;

    const apiUrl = kythiaConfig.addons.globalchat.apiUrl;
    const apiKey = kythiaConfig.addons.globalchat.apiKey;
    const webhookName = kythiaConfig.addons.globalchat.webhookName || 'Global Chat via Kythia';

    logger.info(`🌏 [GlobalChat] Starting webhook fix process for ${failedGuilds.length} failed guild(s)...`);

    let allGuildsData;
    try {
        logger.info('🌏 [GlobalChat] Fetching master guild list from API...');
        const listResponse = await fetch(`${apiUrl}/list`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
            },
        });
        if (!listResponse.ok) throw new Error(`API /list returned status ${listResponse.status}`);

        const listData = await listResponse.json();
        if (listData.status !== 'ok' || !listData.data?.guilds) {
            throw new Error(`API /list failed or returned invalid data: ${listData.message || listData.error || 'Unknown error'}`);
        }
        allGuildsData = listData.data.guilds;
    } catch (listError) {
        logger.error(`❌ [GlobalChat] Error fetching master /list. Aborting fix process.`, listError.message);
        return;
    }

    for (const failedGuild of failedGuilds) {
        logger.warn(`⚠️ [GlobalChat] Handling failed guild: ${failedGuild.guildName || failedGuild.guildId}. Reason: ${failedGuild.error}`);

        try {
            logger.info(`🌏 [GlobalChat] Attempting to fix webhook for guild ${failedGuild.guildName || failedGuild.guildId}`);

            const guildInfo = allGuildsData.find((g) => g.id === failedGuild.guildId);

            if (!guildInfo || !guildInfo.globalChannelId) {
                logger.warn(
                    `⚠️ [GlobalChat] Could not find registered channel info for guild ${failedGuild.guildId} in API /list response. Skipping fix.`
                );
                continue;
            }

            let channel;
            try {
                channel = await client.channels.fetch(guildInfo.globalChannelId).catch(() => null);
                if (!channel || !channel.isTextBased() || channel.isDMBased()) {
                    logger.warn(
                        `⚠️ [GlobalChat] Channel ${guildInfo.globalChannelId} for guild ${failedGuild.guildId} not found, not text-based, or is DM. Skipping fix.`
                    );
                    continue;
                }

                const guild = channel.guild;
                if (!guild) {
                    logger.warn(
                        `⚠️ [GlobalChat] Cannot access guild ${failedGuild.guildId} for channel ${channel.id}. Bot might have been kicked. Skipping fix.`
                    );
                    continue;
                }
                const me = await guild.members.fetchMe().catch(() => null);
                if (!me) {
                    logger.warn(`⚠️ [GlobalChat] Bot is not a member of guild ${guild.name} (${guild.id}). Skipping fix.`);
                    continue;
                }

                if (!channel.permissionsFor(me).has(PermissionsBitField.Flags.ManageWebhooks)) {
                    logger.warn(
                        `⚠️ [GlobalChat] Missing 'Manage Webhooks' permission in channel #${channel.name} (${channel.id}) for guild ${guild.name} (${guild.id}). Cannot fix webhook.`
                    );
                    continue;
                }
            } catch (channelError) {
                logger.error(
                    `❌ [GlobalChat] Error accessing channel/permissions for ${guildInfo.globalChannelId} in guild ${failedGuild.guildId}:`,
                    channelError
                );
                continue;
            }

            try {
                logger.info(`🧹 [GlobalChat] Checking for old webhooks in #${channel.name}...`);
                const webhooks = await channel.fetchWebhooks();

                const kythWebhooks = webhooks.filter((wh) => wh.owner && wh.owner.id === client.user.id);

                if (kythWebhooks.size > 0) {
                    logger.info(`🧹 [GlobalChat] Found ${kythWebhooks.size} old webhook(s) owned by me. Deleting...`);

                    for (const [id, webhook] of kythWebhooks) {
                        await webhook
                            .delete('Cleaning up old Kythia webhooks before creation')
                            .then(() => logger.debug(`🗑️ [GlobalChat] Deleted old webhook: ${webhook.name} (${webhook.id})`))
                            .catch((err) => logger.warn(`⚠️ [GlobalChat] Failed to delete old webhook ${webhook.id}:`, err));
                    }
                } else {
                    logger.debug(`✨ [GlobalChat] No old webhooks found to clean.`);
                }
            } catch (cleanupError) {
                logger.warn(`⚠️ [GlobalChat] Error during webhook cleanup (ignoring to proceed):`, cleanupError);
            }

            let newWebhook;
            try {
                logger.info(`🌏 [GlobalChat] Creating new webhook in #${channel.name} (${channel.id})...`);
                newWebhook = await channel.createWebhook({
                    name: webhookName,
                    avatar: client.user.displayAvatarURL(),
                    reason: 'Automatic webhook recreation for Kythia Global Chat',
                });
                logger.info(`🌏 [GlobalChat] New webhook created: ${newWebhook.id}`);
            } catch (webhookError) {
                logger.error(
                    `❌ [GlobalChat] Failed to create webhook in channel ${channel.id} for guild ${failedGuild.guildId}:`,
                    webhookError
                );
                continue;
            }

            let webhookUpdateSuccess = false;
            try {
                logger.info(`🌏 [GlobalChat] Updating API with new webhook info for guild ${failedGuild.guildId}...`);
                const updateResponse = await fetch(`${apiUrl}/add`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${apiKey}`,
                    },
                    body: JSON.stringify({
                        guildId: failedGuild.guildId,
                        globalChannelId: guildInfo.globalChannelId,
                        webhookId: newWebhook.id,
                        webhookToken: newWebhook.token,
                    }),
                });
                if (!updateResponse.ok) throw new Error(`API /add returned status ${updateResponse.status}`);
                const updateResult = await updateResponse.json();

                if (updateResult.status === 'ok') {
                    logger.info(
                        `✅ [GlobalChat] Successfully fixed and updated webhook for guild ${failedGuild.guildName || failedGuild.guildId}`
                    );
                    webhookUpdateSuccess = true;
                } else {
                    logger.error(
                        `❌ [GlobalChat] Failed to update guild ${failedGuild.guildName || failedGuild.guildId} in API after creating webhook:`,
                        updateResult.message || updateResult.error || updateResult
                    );
                    await newWebhook
                        .delete('Failed to update Global Chat API')
                        .catch((delErr) => logger.warn(`⚠️ [GlobalChat] Failed to delete orphaned webhook ${newWebhook.id}:`, delErr));
                }
            } catch (updateError) {
                logger.error(`[GlobalChat] ❌ Error calling API /add to update webhook for guild ${failedGuild.guildId}:`, updateError);

                await newWebhook
                    .delete('Failed to call Global Chat API /add')
                    .catch((delErr) => logger.warn(`⚠️ [GlobalChat] Failed to delete orphaned webhook ${newWebhook.id}:`, delErr));
            }

            // Update our local DB only if API update succeeded
            if (webhookUpdateSuccess) {
                try {
                    // Try to find and update existing entry, or fallback to upsert/create
                    logger.info(`🌏 [GlobalChat] Updating local database with new webhook for guild ${failedGuild.guildId}...`);
                    const updateResult = await GlobalChat.update(
                        {
                            globalChannelId: guildInfo.globalChannelId,
                            webhookId: newWebhook.id,
                            webhookToken: newWebhook.token,
                        },
                        {
                            where: { guildId: failedGuild.guildId },
                        }
                    );

                    if (!updateResult || (Array.isArray(updateResult) && updateResult[0] === 0)) {
                        await GlobalChat.create({
                            guildId: failedGuild.guildId,
                            globalChannelId: guildInfo.globalChannelId,
                            webhookId: newWebhook.id,
                            webhookToken: newWebhook.token,
                        });
                    }
                    logger.info(`✅ [GlobalChat] Local DB updated for guild ${failedGuild.guildId}.`);
                } catch (dbErr) {
                    logger.error(`❌ [GlobalChat] Failed to update local DB for guild ${failedGuild.guildId}:`, dbErr);
                }
            }
        } catch (error) {
            logger.error(`❌ [GlobalChat] Unexpected error during webhook fix for guild ${failedGuild.guildId}:`, error);
        }
    }
    logger.info(`🌏 [GlobalChat] Webhook fix process finished.`);
}

module.exports = { handleFailedGlobalChat };
