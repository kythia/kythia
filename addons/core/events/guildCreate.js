/**
 * @namespace: addons/core/events/guildCreate.js
 * @type: Event Handler
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc1
 */

const { Events, EmbedBuilder, WebhookClient } = require('discord.js');
const ServerSetting = require('@coreModels/ServerSetting');
const { embedFooter } = require('@utils/discord');
const { t } = require('@utils/translator');

function safeWebhookClient(url) {
    if (typeof url === 'string' && url.trim().length > 0) {
        return new WebhookClient({ url });
    }
    return null;
}

module.exports = async (bot, guild) => {
    // Initialize default settings for new server if not exists
    const locale = guild.preferredLocale || 'en';
    const [setting, created] = await ServerSetting.findOrCreateWithCache({
        where: { guildId: guild.id },
        defaults: {
            guildId: guild.id,
            guildName: guild.name ?? 'Unknown',
            lang: locale,
        },
    });
    if (created) {
        console.log(`Default bot settings created for server: ${guild.name}`);
    }

    // Webhook URL that has been set up
    const webhookClient = safeWebhookClient(kythia.api.webhookGuildInviteLeave);

    // Use t for all text
    // Safely resolve the guild owner's username, fallback to 'Unknown' if not available
    let ownerName = 'Unknown';
    try {
        // Try to fetch the owner if not cached
        let owner = guild.members?.cache?.get(guild.ownerId);
        if (!owner && typeof guild.fetchOwner === 'function') {
            owner = await guild.fetchOwner();
        }
        if (owner && owner.user && owner.user.username) {
            ownerName = owner.user.username;
        }
    } catch (e) {
        // ignore, fallback to 'Unknown'
    }

    const inviteEmbed = new EmbedBuilder()
        .setColor(kythia.bot.color)
        .setDescription(
            await t(guild, 'core_events_guildCreate_events_guild_create_webhook_desc', {
                bot: guild.client.user.username,
                guild: guild.name,
                guildId: guild.id,
                ownerId: guild.ownerId,
                ownerName: ownerName,
                memberCount: guild.memberCount ?? '?',
                invite: guild.vanityURLCode
                    ? `https://discord.gg/${guild.vanityURLCode}`
                    : await t(guild, 'core_events_guildCreate_events_guild_create_no_invite'),
                createdAt: guild.createdAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            })
        )
        .setTimestamp();

    // Send to webhook if webhookClient valid
    if (webhookClient) {
        webhookClient
            .send({
                embeds: [inviteEmbed],
            })
            .catch(console.error);
    }

    // Send info to system channel if available
    const channel = guild.systemChannel;
    if (channel) {
        try {
            const welcomeEmbed = new EmbedBuilder()
                .setColor(kythia.bot.color)
                .setDescription(
                    await t(guild, 'core_events_guildCreate_events_guild_create_welcome_desc', {
                        bot: guild.client.user.username,
                    })
                )
                .setThumbnail(guild.client.user.displayAvatarURL())
                .setFooter(await embedFooter(guild))
                .setTimestamp();

            await channel.send({ embeds: [welcomeEmbed] });
        } catch (e) {
            // fallback if embed fails
            channel.send(
                await t(guild, 'core_events_guildCreate_events_guild_create_welcome_fallback', {
                    bot: guild.client.user.username,
                })
            );
        }
    }
};
