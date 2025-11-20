/**
 * @namespace: addons/core/events/guildMemberAdd.js
 * @type: Event Handler
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { resolvePlaceholders, safeResolvePlaceholder } = require("../helpers/stats");
const { generateBanner } = require('../helpers/canvas');
const { EmbedBuilder } = require('discord.js');
const { rolePrefix } = require('../helpers');

module.exports = async (bot, member) => {
    const container = bot.client.container;
    const { t, models, helpers, kythiaConfig } = container;
    const { ServerSetting, User } = models;
    const { embedFooter } = helpers.discord;

    let user = await User.getCache({ userId: member.user.id, guildId: member.guild.id });
    if (!user) {
        user = await User.create({ userId: member.user.id, guildId: member.guild.id });
    }
    const guild = member.guild;
    const guildId = guild.id;

    const setting = await ServerSetting.getCache({ guildId: guildId });
    if (!setting || !setting.welcomeInOn) return;

    const channel = guild.channels.cache.get(setting.welcomeInChannelId);
    if (!channel) return console.log('Welcome channel not found');

    if (setting.welcomeRoleId) {
        try {
            const welcomeRole = guild.roles.cache.get(setting.welcomeRoleId);
            if (welcomeRole) {
                await member.roles.add(welcomeRole);
                console.log(`Added welcome role to ${member.user.tag}`);
            }
        } catch (err) {
            console.error(`Failed to add welcome role: ${err}`);
        }
    }
    if (setting.rolePrefixOn) {
        await rolePrefix(member.guild);
    }

    const statsData = {
        userId: member.user.id,
        tag: member.user.tag,
        username: member.user.username,
        userTag: member.user.id,
        guildName: guild.name,
        guildId: guild.id,
        ownerName: guild.members.cache.get(guild.ownerId)?.user?.tag || 'Unknown',
        ownerId: guild.ownerId,
        region: guild.preferredLocale,
        createdAt: guild.createdAt,
        boosts: guild.premiumSubscriptionCount || 0,
        boostLevel: guild.premiumTier || 0,
        members: guild.memberCount,
        roles: guild.roles.cache.size,
        emojis: guild.emojis.cache.size,
        stickers: guild.stickers.cache.size,
        memberJoin: member.joinedAt,
        online: guild.members.cache.filter((m) => m.presence?.status === 'online').size,
        idle: guild.members.cache.filter((m) => m.presence?.status === 'idle').size,
        dnd: guild.members.cache.filter((m) => m.presence?.status === 'dnd').size,
        offline: guild.members.cache.filter((m) => !m.presence || m.presence.status === 'offline').size,
        bots: guild.members.cache.filter((m) => m.user.bot).size,
        humans: guild.members.cache.filter((m) => !m.user.bot).size,
        onlineBots: guild.members.cache.filter((m) => m.user.bot && m.presence && m.presence.status !== 'offline').size,
        onlineHumans: guild.members.cache.filter((m) => !m.user.bot && m.presence && m.presence.status !== 'offline').size,
        channels: guild.channels.cache.size,
        textChannels: guild.channels.cache.filter((c) => c.type === 0 || c.type === 'GUILD_TEXT').size,
        voiceChannels: guild.channels.cache.filter((c) => c.type === 2 || c.type === 'GUILD_VOICE').size,
        categories: guild.channels.cache.filter((c) => c.type === 4 || c.type === 'GUILD_CATEGORY').size,
        announcementChannels: guild.channels.cache.filter((c) => c.type === 5 || c.type === 'GUILD_ANNOUNCEMENT').size,
        stageChannels: guild.channels.cache.filter((c) => c.type === 13 || c.type === 'GUILD_STAGE_VOICE').size,
        verified: guild.verified,
        partnered: guild.partnered,
        membersTotal: guild.members.cache.size,
    };

    let welcomeText;
    if (setting.welcomeInEmbedText) {
        let welcomeInTextValue = setting.welcomeInEmbedText;
        if (typeof welcomeInTextValue !== 'string' || !welcomeInTextValue.trim()) {
            welcomeText = `${member.user.username} has joined the server!`;
        } else {
            try {
                welcomeText = await resolvePlaceholders(welcomeInTextValue, statsData, member.guild.preferredLocale);
                if (typeof welcomeText === 'string') {
                    welcomeText = welcomeText.replace(/\\n/g, '\n');
                }
                if (welcomeText == null) {
                    welcomeText = `${member.user.username} has joined the server!`;
                }
            } catch (err) {
                console.error('Error in resolvePlaceholders for welcomeInText:', err);
                welcomeText = `${member.user.username} has joined the server!`;
            }
        }
    } else {
        welcomeText = `${member.user.username} has joined the server!`;
    }

    let welcomeInImage = await generateBanner({
        width: setting.welcomeInBannerWidth,
        height: setting.welcomeInBannerHeight,
        backgroundURL: setting.welcomeInBackgroundUrl,
        foregroundURL: setting.welcomeInForegroundUrl,
        overlay: { color: setting.welcomeInOverlayColor },
        avatar: {
            enabled: true,
            url: member.user.displayAvatarURL({ extension: 'png', size: 512 }),
            size: setting.welcomeInAvatarSize,
            round: (setting.welcomeInAvatarShape || 'circle') === 'circle',
            yOffset: setting.welcomeInAvatarYOffset,
            border: {
                color: setting.welcomeInAvatarBorderColor,
                width: setting.welcomeInAvatarBorderWidth,
            },
        },
        texts: [
            {
                text: await safeResolvePlaceholder(member, setting.welcomeInMainTextContent, statsData, ''),
                font: setting.welcomeInMainTextFont,
                color: setting.welcomeInMainTextColor,
                align: 'center',
                baseline: 'middle',
                x: (setting.welcomeInBannerWidth || 800) / 2,
                y: (setting.welcomeInBannerHeight || 300) / 2 + (setting.welcomeInMainTextYOffset || -80),
                shadow: {
                    color: setting.welcomeInShadowColor,
                    blur: setting.welcomeInShadowBlur,
                },
                maxWidth: (setting.welcomeInBannerWidth || 800) * 0.9,
                uppercase: false,
            },
            {
                text: await safeResolvePlaceholder(member, setting.welcomeInSubTextContent, statsData, ''),
                font: setting.welcomeInSubTextFont,
                color: setting.welcomeInSubTextColor,
                align: 'center',
                baseline: 'middle',
                x: (setting.welcomeInBannerWidth || 800) / 2,
                y: (setting.welcomeInBannerHeight || 300) / 2 + (setting.welcomeInSubTextYOffset || 100),
                shadow: {
                    color: setting.welcomeInShadowColor,
                    blur: setting.welcomeInShadowBlur,
                },
                maxWidth: (setting.welcomeInBannerWidth || 800) * 0.8,
                uppercase: false,
            },
        ],
        fontFamily: guild.welcomeInMainTextFontFamily,
        subTextFontFamily: guild.welcomeInSubTextFontFamily,
        memberCount: guild.memberCount,
        username: member.user.username,
        guildName: guild.name,
        interaction: member,
        border: {
            color: setting.welcomeInBorderColor,
            width: setting.welcomeInBorderWidth,
        },
        extraDraw: setting.welcomeInExtraDraw,
    });

    let safeWelcomeText;
    try {
        if (typeof welcomeText !== 'string') {
            safeWelcomeText = String(welcomeText ?? '');
        } else {
            safeWelcomeText = welcomeText;
        }
    } catch (e) {
        safeWelcomeText = '';
    }

    let embedImageUrl = welcomeInImage;
    let files = [];
    if (Buffer.isBuffer(welcomeInImage)) {
        const { AttachmentBuilder } = require('discord.js');
        const attachment = new AttachmentBuilder(welcomeInImage, { name: 'welcome.png' });
        files.push(attachment);
        embedImageUrl = 'attachment://welcome.png';
    }

    const welcomeEmbed = new EmbedBuilder()
        .setColor(kythiaConfig.bot.color)
        .setDescription(safeWelcomeText)
        .setImage(embedImageUrl)
        .setFooter(await embedFooter(member));

    channel.send({ embeds: [welcomeEmbed], files });
};
