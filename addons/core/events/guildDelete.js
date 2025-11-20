/**
 * @namespace: addons/core/events/guildDelete.js
 * @type: Event Handler
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { EmbedBuilder, WebhookClient } = require('discord.js');

function safeWebhookClient(url) {
    if (typeof url === 'string' && url.trim().length > 0) {
        return new WebhookClient({ url });
    }
    return null;
}

module.exports = async (bot, guild) => {
    const container = bot.client.container;
    const { t, kythiaConfig } = container;

    const webhookClient = safeWebhookClient(kythiaConfig.api.webhookGuildInviteLeave);

    // Use t for all text
    const leaveEmbed = new EmbedBuilder()
        .setColor('Red')
        .setDescription(
            await t(guild, 'core.events.guildDelete.events.guild.delete.webhook.desc', {
                bot: guild.client.user.username,
                guild: guild.name,
                guildId: guild.id,
                ownerId: guild.ownerId,
                memberCount: guild.memberCount ?? '?',
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
