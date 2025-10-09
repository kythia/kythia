/**
 * @namespace: addons/core/events/guildDelete.js
 * @type: Event Handler
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc.1
 */

const { EmbedBuilder, WebhookClient } = require('discord.js');
const ServerSetting = require('@coreModels/ServerSetting');
const kythiaManager = require('@src/KythiaManager');
const { t } = require('@utils/translator');

function safeWebhookClient(url) {
    if (typeof url === 'string' && url.trim().length > 0) {
        return new WebhookClient({ url });
    }
    return null;
}

module.exports = async (bot, guild) => {
    // const kythiaManage = new kythiaManager(ServerSetting);
    bot.container.kythiaManager.removeFromCache(guild.id);

    // Webhook URL that has been set up
    const webhookClient = safeWebhookClient(kythia.api.webhookGuildInviteLeave);

    // Use t for all text
    const leaveEmbed = new EmbedBuilder()
        .setColor('Red')
        .setDescription(
            await t(guild, 'core_events_guildDelete_events_guild_delete_webhook_desc', {
                bot: guild.client.user.username,
                guild: guild.name,
                guildId: guild.id,
                ownerId: guild.ownerId,
                memberCount: guild.memberCount ?? '?',
                invite: guild.vanityURLCode
                    ? `https://discord.gg/${guild.vanityURLCode}`
                    : await t(guild, 'core_events_guildDelete_events_guild_delete_no_invite'),
                createdAt: guild.createdAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            })
        )
        .setTimestamp();

    if (webhookClient) {
        webhookClient
            .send({
                embeds: [leaveEmbed],
            })
            .catch(console.error);
    }
};
