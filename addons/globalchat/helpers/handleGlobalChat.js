/**
 * @namespace: addons/globalchat/helpers/handleGlobalChat.js
 * @type: Helper Script
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const fetch = require('node-fetch');
const { handleFailedGlobalChat } = require('./handleFailedGlobalChat');

async function handleGlobalChat(message, container) {
    const { logger, kythiaConfig } = container;

    if (message.author.bot) return;
    if (!message.guild) return;

    try {
        const referencedMessageData = message.referencedMessage
            ? {
                  id: message.referencedMessage.id,
                  content: message.referencedMessage.content,
                  author: {
                      id: message.referencedMessage.author.id,
                      username: message.referencedMessage.author.username,
                      globalName: message.referencedMessage.author.globalName || message.referencedMessage.author.username,
                      avatarURL: message.referencedMessage.author.displayAvatarURL(),
                  },
              }
            : null;

        const safeMessage = {
            id: message.id,
            content: message.content,
            author: {
                id: message.author.id,
                username: message.author.username,
                globalName: message.author.globalName || message.author.username,
                avatarURL: message.author.displayAvatarURL(),
            },
            channelId: message.channelId,
            guildId: message.guildId,
            referencedMessage: referencedMessageData,
            attachments: message.attachments.map((a) => ({
                url: a.url,
                contentType: a.contentType,

                id: a.id,
                filename: a.name,
                size: a.size,
                width: a.width,
                height: a.height,
            })),
            stickerItems: message.stickers.map((s) => ({
                id: s.id,
                name: s.name,
                formatType: s.format,
            })),
        };

     
        const apiUrl = kythiaConfig.addons.globalchat.apiUrl;
        const apiKey = kythiaConfig.addons.globalchat.apiKey;

        const response = await fetch(`${apiUrl}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                message: safeMessage,
                guildName: message.guild.name,
            }),
        });

        const result = await response.json();

        switch (result.status) {
            case 'ok':
                break;
            case 'ignored':
                break;
            case 'skipped':
                break;
            case 'partial': {
                const stats = result.data?.deliveryStats || {};
                logger.info(`Partially delivered: ${stats.successful || 0}/${stats.total || 0}`);
                if (Array.isArray(result.data?.failedGuilds) && result.data.failedGuilds.length > 0) {
                    const failedGuildNames = result.data.failedGuilds.map((g) => g.guildName || g.guildId).join(', ');
                    logger.warn(`Failed guilds: ${failedGuildNames}`);

                    handleFailedGlobalChat(result.data.failedGuilds, container).catch((err) => {
                        logger.error('[GlobalChat] Error during background webhook fix attempt:', err);
                    });
                }
                break;
            }

            case 'failed': {
                logger.error(`All deliveries failed for message ${safeMessage.id}`);

                if (Array.isArray(result.data?.failedGuilds) && result.data.failedGuilds.length > 0) {
                    const failedNames = result.data.failedGuilds.map((g) => g.guildName || g.guildId).join(', ');
                    logger.error(`Failed guilds: ${failedNames}`);

                    handleFailedGlobalChat(result.data.failedGuilds, container).catch((err) => {
                        logger.error('[GlobalChat] Error during background webhook fix attempt:', err);
                    });
                } else {
                    logger.debug("[GlobalChat] Status was 'failed' but failedGuilds array was empty or missing.");
                }
                break;
            }
            default:
                logger.warn(`⚠️ [GlobalChat] Unknown API response status: ${result.status}`);
                logger.info('🌏 [GlobalChat] Full response:', result);
        }

        if (result.status === 'ok' || result.status === 'partial') {
            logger.info(`🌏 [GlobalChat] 📤 Sent from: ${message.guild.name} (${message.guildId}) by ${message.author.tag}`);
        }
    } catch (apiError) {
        logger.error('❌ [GlobalChat] Failed to send message to API:', apiError);
    }
}

module.exports = { handleGlobalChat };
