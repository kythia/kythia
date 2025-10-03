/**
 * @namespace: addons/core/commands/utils/serverinfo.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta
 */
const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType,
    InteractionContextType,
} = require('discord.js');
const { embedFooter } = require('@utils/discord');
const { t } = require('@utils/translator');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('📰 Displays detailed information about the server.')
        .setContexts(InteractionContextType.Guild),
    guildOnly: true,
    async execute(interaction) {
        const guild = interaction.guild;

        // Fetch all data to ensure up-to-date info
        await guild.fetch();
        const owner = await guild.fetchOwner().catch(() => null);

        // Verification and filter levels (pakai t)
        const verificationLevels = {
            0: await t(interaction, 'core_utils_serverinfo_verification_none'),
            1: await t(interaction, 'core_utils_serverinfo_verification_low'),
            2: await t(interaction, 'core_utils_serverinfo_verification_medium'),
            3: await t(interaction, 'core_utils_serverinfo_verification_high'),
            4: await t(interaction, 'core_utils_serverinfo_verification_very_high'),
        };
        const explicitContentFilterLevels = {
            0: await t(interaction, 'core_utils_serverinfo_filter_disabled'),
            1: await t(interaction, 'core_utils_serverinfo_filter_members_without_roles'),
            2: await t(interaction, 'core_utils_serverinfo_filter_all_members'),
        };
        const nsfwLevels = {
            0: await t(interaction, 'core_utils_serverinfo_nsfw_default'),
            1: await t(interaction, 'core_utils_serverinfo_nsfw_explicit'),
            2: await t(interaction, 'core_utils_serverinfo_nsfw_safe'),
            3: await t(interaction, 'core_utils_serverinfo_nsfw_age_restricted'),
        };
        const mfaLevels = {
            0: await t(interaction, 'core_utils_serverinfo_mfa_not_required'),
            1: await t(interaction, 'core_utils_serverinfo_mfa_required'),
        };
        const premiumTiers = {
            0: await t(interaction, 'core_utils_serverinfo_boost_none'),
            1: await t(interaction, 'core_utils_serverinfo_boost_level1'),
            2: await t(interaction, 'core_utils_serverinfo_boost_level2'),
            3: await t(interaction, 'core_utils_serverinfo_boost_level3'),
        };

        // Emojis for fields
        const emojis = {
            name: '🏷️',
            region: '🌍',
            members: '👥',
            created: '📅',
            owner: '👑',
            description: '📝',
            verification: '🔒',
            boost: '🚀',
            boosts: '💎',
            afk: '💤',
            afkTimeout: '⏰',
            filter: '🛡️',
            roles: '🔖',
            emojis: '😃',
            stickers: '🏷️',
            banner: '🖼️',
            splash: '🌊',
            features: '✨',
            vanity: '🔗',
            mfa: '🛡️',
            nsfw: '🔞',
            system: '💬',
            rules: '📜',
            locale: '🌐',
            icon: '🖼️',
            threads: '🧵',
            stage: '🎤',
            forum: '🗂️',
            categories: '📁',
            text: '💬',
            voice: '🔊',
            news: '📰',
            announcement: '📢',
            publicUpdates: '🌟',
            widget: '🔲',
            maxPresences: '👤',
            maxMembers: '👥',
            maxVideo: '🎥',
            maxEmojis: '😃',
            maxStickers: '🏷️',
            partner: '🤝',
            verified: '✅',
            discovery: '🔍',
            welcome: '👋',
            community: '🌐',
            premiumProgressBar: '📈',
            safety: '🛡️',
            inviteSplash: '🌊',
            invite: '🔗',
            application: '🧩',
            directory: '📚',
            monetization: '💰',
            creator: '🎨',
            memberVerification: '📝',
            roleSubscription: '💳',
            soundboard: '🎵',
            serverGuidelines: '📖',
            serverAvatar: '🖼️',
            serverSoundboard: '🎵',
            serverDirectory: '📚',
            serverMonetization: '💰',
            serverCreator: '🎨',
            serverMemberVerification: '📝',
            serverRoleSubscription: '💳',
            serverWelcomeScreen: '👋',
            serverSafety: '🛡️',
            serverPremiumProgressBar: '📈',
            serverCommunity: '🌐',
            serverPartner: '🤝',
            serverVerified: '✅',
            serverDiscovery: '🔍',
            serverInviteSplash: '🌊',
            serverApplication: '🧩',
            serverAnnouncement: '📢',
            serverNews: '📰',
            serverPublicUpdates: '🌟',
            serverWidget: '🔲',
            serverMaxPresences: '👤',
            serverMaxMembers: '👥',
            serverMaxVideo: '🎥',
            serverMaxEmojis: '😃',
            serverMaxStickers: '🏷️',
        };

        // Format creation date
        const createdAt = `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`;

        // Banner, splash, icon, etc
        const bannerURL = guild.bannerURL({ size: 1024 });
        const splashURL = guild.splashURL({ size: 1024 });
        const iconURL = guild.iconURL({ size: 1024, dynamic: true });
        const discoverySplashURL = guild.discoverySplashURL?.({ size: 1024 });
        const widgetURL = guild.widgetEnabled ? guild.widgetImageURL({ size: 1024 }) : null;

        // Owner mention
        const ownerMention = owner
            ? `<@${owner.id}> (${owner.user.tag})`
            : guild.ownerId
              ? `<@${guild.ownerId}>`
              : await t(interaction, 'core_utils_serverinfo_unknown');

        // Vanity URL
        const vanity = guild.vanityURLCode
            ? `https://discord.gg/${guild.vanityURLCode}`
            : await t(interaction, 'core_utils_serverinfo_none');

        // Channels breakdown
        const allChannels = guild.channels.cache;
        const channelCounts = {
            categories: allChannels.filter((c) => c.type === ChannelType.GuildCategory).size,
            text: allChannels.filter((c) => c.type === ChannelType.GuildText).size,
            voice: allChannels.filter((c) => c.type === ChannelType.GuildVoice).size,
            stage: allChannels.filter((c) => c.type === ChannelType.GuildStageVoice).size,
            forum: allChannels.filter((c) => c.type === ChannelType.GuildForum).size,
            announcement: allChannels.filter((c) => c.type === ChannelType.GuildAnnouncement).size,
            publicThreads: allChannels.filter((c) => c.type === ChannelType.PublicThread).size,
            privateThreads: allChannels.filter((c) => c.type === ChannelType.PrivateThread).size,
            news: allChannels.filter((c) => c.type === ChannelType.GuildAnnouncement).size,
        };

        // Members breakdown
        const members = await guild.members.fetch({ withPresences: false }).catch(() => null);
        const memberCount = guild.memberCount;
        let botCount = 0,
            humanCount = 0,
            onlineCount = 0,
            offlineCount = 0,
            dndCount = 0,
            idleCount = 0;
        if (members) {
            botCount = members.filter((m) => m.user.bot).size;
            humanCount = members.filter((m) => !m.user.bot).size;
            // If presences are available
            onlineCount = members.filter((m) => m.presence?.status === 'online').size;
            idleCount = members.filter((m) => m.presence?.status === 'idle').size;
            dndCount = members.filter((m) => m.presence?.status === 'dnd').size;
            offlineCount = memberCount - (onlineCount + idleCount + dndCount);
        }

        // Roles
        const roles = guild.roles.cache
            .sort((a, b) => b.position - a.position)
            .map((r) => r)
            .filter((r) => r.id !== guild.id);
        const roleCount = roles.length;
        const topRoles =
            roles
                .slice(0, 10)
                .map((r) => r.toString())
                .join(', ') + (roleCount > 10 ? `, +${roleCount - 10} ${await t(interaction, 'core_utils_serverinfo_more')}` : '');

        // Emojis and stickers
        const emojisAll = guild.emojis.cache;
        const emojiCount = emojisAll.size;
        const animatedEmojis = emojisAll.filter((e) => e.animated).size;
        const staticEmojis = emojiCount - animatedEmojis;
        const stickers = guild.stickers.cache;
        const stickerCount = stickers.size;

        // Features
        const features =
            guild.features.length > 0
                ? guild.features.map((f) => `\`${f}\``).join(', ')
                : await t(interaction, 'core_utils_serverinfo_none');

        // System, rules, public updates, widget, etc
        const systemChannel = guild.systemChannel ? `<#${guild.systemChannel.id}>` : await t(interaction, 'core_utils_serverinfo_none');
        const rulesChannel = guild.rulesChannel ? `<#${guild.rulesChannel.id}>` : await t(interaction, 'core_utils_serverinfo_none');
        const publicUpdatesChannel = guild.publicUpdatesChannel
            ? `<#${guild.publicUpdatesChannel.id}>`
            : await t(interaction, 'core_utils_serverinfo_none');
        const afkChannel = guild.afkChannel ? `<#${guild.afkChannel.id}>` : await t(interaction, 'core_utils_serverinfo_none');
        const afkTimeout = guild.afkTimeout
            ? `${guild.afkTimeout / 60} ${await t(interaction, 'core_utils_serverinfo_minutes')}`
            : await t(interaction, 'core_utils_serverinfo_none');
        const widgetEnabled = guild.widgetEnabled
            ? await t(interaction, 'core_utils_serverinfo_enabled')
            : await t(interaction, 'core_utils_serverinfo_disabled');
        const maxPresences = guild.maxPresences || (await t(interaction, 'core_utils_serverinfo_unlimited'));
        const maxMembers = guild.maxMembers || (await t(interaction, 'core_utils_serverinfo_unlimited'));
        const maxVideoChannelUsers = guild.maxVideoChannelUsers || (await t(interaction, 'core_utils_serverinfo_unlimited'));
        const maxEmojis = guild.maximumEmojis || (await t(interaction, 'core_utils_serverinfo_unknown'));
        const maxStickers = guild.maximumStickers || (await t(interaction, 'core_utils_serverinfo_unknown'));
        const preferredLocale = guild.preferredLocale || (await t(interaction, 'core_utils_serverinfo_unknown'));

        // Welcome screen
        let welcomeScreen = null;
        if (guild.features.includes('WELCOME_SCREEN_ENABLED')) {
            try {
                welcomeScreen = await guild.fetchWelcomeScreen();
            } catch {}
        }

        // Buttons for icon, banner, splash, widget, etc
        const row = new ActionRowBuilder().addComponents(
            ...(iconURL
                ? [
                      new ButtonBuilder()
                          .setLabel(await t(interaction, 'core_utils_serverinfo_button_icon'))
                          .setStyle(ButtonStyle.Link)
                          .setURL(iconURL),
                  ]
                : []),
            ...(bannerURL
                ? [
                      new ButtonBuilder()
                          .setLabel(await t(interaction, 'core_utils_serverinfo_button_banner'))
                          .setStyle(ButtonStyle.Link)
                          .setURL(bannerURL),
                  ]
                : []),
            ...(splashURL
                ? [
                      new ButtonBuilder()
                          .setLabel(await t(interaction, 'core_utils_serverinfo_button_splash'))
                          .setStyle(ButtonStyle.Link)
                          .setURL(splashURL),
                  ]
                : []),
            ...(discoverySplashURL
                ? [
                      new ButtonBuilder()
                          .setLabel(await t(interaction, 'core_utils_serverinfo_button_discovery_splash'))
                          .setStyle(ButtonStyle.Link)
                          .setURL(discoverySplashURL),
                  ]
                : []),
            ...(widgetURL
                ? [
                      new ButtonBuilder()
                          .setLabel(await t(interaction, 'core_utils_serverinfo_button_widget'))
                          .setStyle(ButtonStyle.Link)
                          .setURL(widgetURL),
                  ]
                : [])
        );

        // Compose description using foreach style
        let descLines = [];

        descLines.push(
            `**\`${emojis.description}\` ${await t(interaction, 'core_utils_serverinfo_field_description')}:** ${guild.description || `*${await t(interaction, 'core_utils_serverinfo_no_description')}*`}`
        );
        descLines.push(`**\`${emojis.owner}\` ${await t(interaction, 'core_utils_serverinfo_field_owner')}:** ${ownerMention}`);
        descLines.push(`**\`${emojis.created}\` ${await t(interaction, 'core_utils_serverinfo_field_created')}:** ${createdAt}`);

        descLines.push(
            `**\`${emojis.members}\` ${await t(interaction, 'core_utils_serverinfo_field_members')}:** ${await t(interaction, 'core_utils_serverinfo_members_total', { count: memberCount })} | ${await t(interaction, 'core_utils_serverinfo_members_humans', { count: humanCount })} | ${await t(interaction, 'core_utils_serverinfo_members_bots', { count: botCount })}`
        );
        descLines.push(
            `  ${await t(interaction, 'core_utils_serverinfo_members_online', { count: onlineCount })} | ${await t(interaction, 'core_utils_serverinfo_members_idle', { count: idleCount })} | ${await t(interaction, 'core_utils_serverinfo_members_dnd', { count: dndCount })} | ${await t(interaction, 'core_utils_serverinfo_members_offline', { count: offlineCount })}`
        );

        descLines.push(
            `**\`${emojis.roles}\` ${await t(interaction, 'core_utils_serverinfo_field_roles')}:** ${await t(interaction, 'core_utils_serverinfo_roles_total', { count: roleCount })}`
        );
        descLines.push(`  ${topRoles}`);

        descLines.push(
            `**\`${emojis.emojis}\` ${await t(interaction, 'core_utils_serverinfo_field_emojis')}:** ${await t(interaction, 'core_utils_serverinfo_emojis_total', { count: emojiCount })} | ${await t(interaction, 'core_utils_serverinfo_emojis_static', { count: staticEmojis })} | ${await t(interaction, 'core_utils_serverinfo_emojis_animated', { count: animatedEmojis })} | ${await t(interaction, 'core_utils_serverinfo_emojis_max', { count: maxEmojis })}`
        );
        descLines.push(
            `**\`${emojis.stickers}\` ${await t(interaction, 'core_utils_serverinfo_field_stickers')}:** ${await t(interaction, 'core_utils_serverinfo_stickers_total', { count: stickerCount })} | ${await t(interaction, 'core_utils_serverinfo_stickers_max', { count: maxStickers })}`
        );

        descLines.push(
            `**\`${emojis.categories}\` ${await t(interaction, 'core_utils_serverinfo_field_categories')}:** ${channelCounts.categories}`
        );
        descLines.push(
            `**\`${emojis.text}\` ${await t(interaction, 'core_utils_serverinfo_field_text_channels')}:** ${channelCounts.text}`
        );
        descLines.push(
            `**\`${emojis.voice}\` ${await t(interaction, 'core_utils_serverinfo_field_voice_channels')}:** ${channelCounts.voice}`
        );
        descLines.push(
            `**\`${emojis.stage}\` ${await t(interaction, 'core_utils_serverinfo_field_stage_channels')}:** ${channelCounts.stage}`
        );
        descLines.push(
            `**\`${emojis.forum}\` ${await t(interaction, 'core_utils_serverinfo_field_forum_channels')}:** ${channelCounts.forum}`
        );
        descLines.push(
            `**\`${emojis.announcement}\` ${await t(interaction, 'core_utils_serverinfo_field_announcement_channels')}:** ${channelCounts.announcement}`
        );
        descLines.push(
            `**\`${emojis.threads}\` ${await t(interaction, 'core_utils_serverinfo_field_threads')}:** ${await t(interaction, 'core_utils_serverinfo_threads_public', { count: channelCounts.publicThreads })} | ${await t(interaction, 'core_utils_serverinfo_threads_private', { count: channelCounts.privateThreads })}`
        );

        descLines.push(
            `**\`${emojis.verification}\` ${await t(interaction, 'core_utils_serverinfo_field_verification_level')}:** ${verificationLevels[guild.verificationLevel] || (await t(interaction, 'core_utils_serverinfo_unknown'))}`
        );
        descLines.push(
            `**\`${emojis.filter}\` ${await t(interaction, 'core_utils_serverinfo_field_explicit_content_filter')}:** ${explicitContentFilterLevels[guild.explicitContentFilter] || (await t(interaction, 'core_utils_serverinfo_unknown'))}`
        );
        descLines.push(
            `**\`${emojis.nsfw}\` ${await t(interaction, 'core_utils_serverinfo_field_nsfw_level')}:** ${nsfwLevels[guild.nsfwLevel] || (await t(interaction, 'core_utils_serverinfo_unknown'))}`
        );
        descLines.push(
            `**\`${emojis.mfa}\` ${await t(interaction, 'core_utils_serverinfo_field_mfa')}:** ${mfaLevels[guild.mfaLevel] || (await t(interaction, 'core_utils_serverinfo_unknown'))}`
        );

        descLines.push(
            `**\`${emojis.boost}\` ${await t(interaction, 'core_utils_serverinfo_field_boost_level')}:** ${premiumTiers[guild.premiumTier] || guild.premiumTier} (${guild.premiumTier})`
        );
        descLines.push(
            `**\`${emojis.boosts}\` ${await t(interaction, 'core_utils_serverinfo_field_total_boosts')}:** ${guild.premiumSubscriptionCount || 0}`
        );

        descLines.push(`**\`${emojis.afk}\` ${await t(interaction, 'core_utils_serverinfo_field_afk_channel')}:** ${afkChannel}`);
        descLines.push(`**\`${emojis.afkTimeout}\` ${await t(interaction, 'core_utils_serverinfo_field_afk_timeout')}:** ${afkTimeout}`);

        descLines.push(`**\`${emojis.system}\` ${await t(interaction, 'core_utils_serverinfo_field_system_channel')}:** ${systemChannel}`);
        descLines.push(`**\`${emojis.rules}\` ${await t(interaction, 'core_utils_serverinfo_field_rules_channel')}:** ${rulesChannel}`);
        descLines.push(
            `**\`${emojis.publicUpdates}\` ${await t(interaction, 'core_utils_serverinfo_field_public_updates_channel')}:** ${publicUpdatesChannel}`
        );

        descLines.push(`**\`${emojis.features}\` ${await t(interaction, 'core_utils_serverinfo_field_features')}:** ${features}`);
        descLines.push(`**\`${emojis.widget}\` ${await t(interaction, 'core_utils_serverinfo_field_widget')}:** ${widgetEnabled}`);
        descLines.push(
            `**\`${emojis.maxPresences}\` ${await t(interaction, 'core_utils_serverinfo_field_max_presences')}:** ${maxPresences}`
        );
        descLines.push(`**\`${emojis.maxMembers}\` ${await t(interaction, 'core_utils_serverinfo_field_max_members')}:** ${maxMembers}`);
        descLines.push(
            `**\`${emojis.maxVideo}\` ${await t(interaction, 'core_utils_serverinfo_field_max_video_channel_users')}:** ${maxVideoChannelUsers}`
        );

        // Welcome screen info
        if (welcomeScreen) {
            descLines.push(
                `**${emojis.welcome} ${await t(interaction, 'core_utils_serverinfo_field_welcome_screen')}:** ${welcomeScreen.description || `*${await t(interaction, 'core_utils_serverinfo_no_description')}*`}`
            );
            if (welcomeScreen.welcomeChannels?.length) {
                descLines.push(`**${await t(interaction, 'core_utils_serverinfo_field_welcome_channels')}:**`);
                for (const wc of welcomeScreen.welcomeChannels) {
                    descLines.push(
                        `  ${wc.channel ? `<#${wc.channel.id}>` : await t(interaction, 'core_utils_serverinfo_unknown')}: ${wc.description || `*${await t(interaction, 'core_utils_serverinfo_no_description')}*`}`
                    );
                }
            }
        }

        // Compose the embed
        const serverInfoEmbed = new EmbedBuilder()
            .setColor(kythia.bot.color)
            .setThumbnail(iconURL)
            .setFooter(await embedFooter(interaction))
            .setTimestamp()
            .setDescription(`## ${emojis.name} ${guild.name}\n` + descLines.join('\n'));

        // Set banner/splash if available
        if (bannerURL) {
            serverInfoEmbed.setImage(bannerURL);
        } else if (splashURL) {
            serverInfoEmbed.setImage(splashURL);
        }

        return interaction.reply({
            embeds: [serverInfoEmbed],
            components: row.components.length > 0 ? [row] : [],
        });
    },
};
