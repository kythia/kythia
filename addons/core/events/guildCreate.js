/**
 * @namespace: addons/core/events/guildCreate.js
 * @type: Event Handler
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const {
    Events,
    EmbedBuilder,
    WebhookClient,
    PermissionsBitField,
    ContainerBuilder,
    TextDisplayBuilder,
    MediaGalleryBuilder,
    MediaGalleryItemBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    MessageFlags,
} = require('discord.js');

function safeWebhookClient(url) {
    if (typeof url === 'string' && url.trim().length > 0) {
        return new WebhookClient({ url });
    }
    return null;
}

async function getInviteLink(guild) {
    if (guild.vanityURLCode) {
        return `https://discord.gg/${guild.vanityURLCode}`;
    }
    try {
        const channels = guild.channels.cache.filter((ch) => ch.type === 0 || ch.type === 2 || ch.type === 5);
        let existingInvites = [];
        try {
            existingInvites = await guild.invites.fetch();
            if (existingInvites && existingInvites.size > 0) {
                const useable = existingInvites.find((i) => !i.expired && i.url);
                if (useable) return useable.url;
                const anyInvite = existingInvites.first();
                if (anyInvite) return anyInvite.url;
            }
        } catch (err) {}
        for (const channel of channels.values()) {
            const perms = channel.permissionsFor(guild.members.me);
            if (perms && perms.has(PermissionsBitField.Flags.CreateInstantInvite)) {
                try {
                    const invite = await channel.createInvite({
                        maxAge: 0,
                        maxUses: 0,
                        reason: 'Bot joined - sharing server invite for logging',
                    });
                    if (invite && invite.url) {
                        return invite.url;
                    }
                } catch (e) {}
            }
        }
    } catch (e) {}
    return null;
}

module.exports = async (bot, guild) => {
    const container = bot.client.container;
    const { t, models, helpers, kythiaConfig } = container;
    const { ServerSetting } = models;

    const { convertColor } = helpers.color;

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

    const webhookClient = safeWebhookClient(kythiaConfig.api.webhookGuildInviteLeave);
    let ownerName = 'Unknown';
    try {
        let owner = guild.members?.cache?.get(guild.ownerId);
        if (!owner && typeof guild.fetchOwner === 'function') {
            owner = await guild.fetchOwner();
        }
        if (owner && owner.user && owner.user.username) {
            ownerName = owner.user.username;
        }
    } catch (e) {}

    let inviteUrl = await getInviteLink(guild);
    let inviteText = inviteUrl ? inviteUrl : await t(guild, 'core.events.guildCreate.events.guild.create.no.invite');

    const inviteEmbed = new EmbedBuilder()
        .setColor(kythiaConfig.bot.color)
        .setDescription(
            await t(guild, 'core.events.guildCreate.events.guild.create.webhook.desc', {
                bot: guild.client.user.username,
                guild: guild.name,
                guildId: guild.id,
                ownerId: guild.ownerId,
                ownerName: ownerName,
                memberCount: guild.memberCount ?? '?',
                invite: inviteText,
                createdAt: guild.createdAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            })
        )
        .setThumbnail(guild.iconURL({ dynamic: true }))

        .setFooter({ text: `Guild Create Event | ${bot.client.user.username}` })
        .setTimestamp();

    if (webhookClient) {
        webhookClient.send({ embeds: [inviteEmbed] }).catch(console.error);
    }

    let channel = guild.systemChannel;

    if (!channel) {
        channel = guild.channels.cache.find((ch) => ch.type === 0 && typeof ch.name === 'string' && ch.name.toLowerCase() === 'general');
    }
    if (channel) {
        try {
            const fakeInteraction = { client: bot.client, guild: guild, user: bot.client.user };
            const accentColor = convertColor(kythiaConfig.bot.color, { from: 'hex', to: 'decimal' });

            const welcomeContainer = new ContainerBuilder()
                .setAccentColor(accentColor)

                .addMediaGalleryComponents(
                    new MediaGalleryBuilder().addItems([new MediaGalleryItemBuilder().setURL(kythiaConfig.settings.bannerImage)])
                )
                .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))

                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                        await t(guild, 'core.events.guildCreate.events.guild.create.welcome.desc', {
                            bot: guild.client.user.username,
                        })
                    )
                )
                .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))

                .addActionRowComponents(
                    new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setLabel('Official Web')
                            .setStyle(ButtonStyle.Link)
                            .setURL(kythiaConfig.settings.kythiaWeb)
                            .setEmoji('🌸'),
                        new ButtonBuilder()
                            .setLabel('Support server')
                            .setStyle(ButtonStyle.Link)
                            .setURL(kythiaConfig.settings.supportServer)
                            .setEmoji('🎂'),
                        new ButtonBuilder()
                            .setLabel('Contact Owner')
                            .setStyle(ButtonStyle.Link)
                            .setURL(kythiaConfig.settings.ownerWeb)
                            .setEmoji('❄️')
                    )
                )
                .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))

                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                        await t(fakeInteraction, 'common.container.footer', { username: bot.client.user.username })
                    )
                );

            await channel.send({
                components: [welcomeContainer],
                flags: MessageFlags.IsComponentsV2,
            });
        } catch (e) {
            try {
                await channel.send(
                    await t(guild, 'core.events.guildCreate.events.guild.create.welcome.fallback', {
                        bot: guild.client.user.username,
                    })
                );
            } catch (fallbackError) {
                console.error(`[guildCreate] Gagal kirim welcome message & fallback: ${fallbackError.message}`);
            }
        }
    }
};
