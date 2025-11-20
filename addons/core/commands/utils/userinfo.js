/**
 * @namespace: addons/core/commands/utils/userinfo.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const {
    SlashCommandBuilder,
    ContextMenuCommandBuilder,
    ApplicationCommandType,
    InteractionContextType,
    ContainerBuilder,
    TextDisplayBuilder,
    SectionBuilder,
    SeparatorBuilder,
    ThumbnailBuilder,
    MessageFlags,
} = require('discord.js');
const { Op } = require('sequelize');

module.exports = {
    slashCommand: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('📄 Displays information about a user.')
        .addUserOption((option) => option.setName('user').setDescription('User to get info about').setRequired(false))
        .setContexts(InteractionContextType.Guild),

    contextMenuCommand: new ContextMenuCommandBuilder()
        .setName('User Info')
        .setType(ApplicationCommandType.User)
        .setContexts(InteractionContextType.Guild),

    contextMenuDescription: '📄 Displays information about a user.',
    async execute(interaction, container) {
        const { t, kythiaConfig, helpers, models } = container;
        const { convertColor } = helpers.color;
        const { Marriage } = models;

        await interaction.deferReply();

        const user = interaction.options.getUser?.('user') || interaction.targetUser || interaction.user;
        let member;
        try {
            member = await interaction.guild?.members.fetch(user.id);
        } catch (e) {
            member = null;
        }

        if (!member && !interaction.guild) {
            return interaction.editReply({
                content: await t(interaction, 'core.utils.userinfo.user.not.found'),
            });
        }

        // Collect role tags, ignore @everyone
        const roles = member
            ? member.roles.cache
                  .filter((role) => role.id !== interaction.guild?.id)
                  .sort((a, b) => b.position - a.position)
                  .map((role) => `<@&${role.id}>`)
                  .join(', ')
            : '';

        // User avatar (mimics marry.js fallback)
        const defaultAvatar = 'https://cdn.discordapp.com/embed/avatars/0.png';
        const avatarUrl = user.displayAvatarURL ? user.displayAvatarURL({ extension: 'png', size: 256 }) : defaultAvatar;

        // Joined at
        let joinedAt = await t(interaction, 'core.utils.userinfo.field.joined.unknown');
        if (member?.joinedTimestamp) {
            joinedAt = `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`;
        }

        // Make General Content
        const generalSection =
            `### ${await t(interaction, 'core.utils.userinfo.field.username')}\n${user.username}\n` +
            `### ${await t(interaction, 'core.utils.userinfo.field.userid')}\n${user.id}\n`;

        const datesSection =
            `### ${await t(interaction, 'core.utils.userinfo.field.created')}\n<t:${Math.floor(user.createdTimestamp / 1000)}:F>\n` +
            `### ${await t(interaction, 'core.utils.userinfo.field.joined.text')}\n${joinedAt}\n`;

        const rolesSection =
            `### ${await t(interaction, 'core.utils.userinfo.field.roles')}\n` +
            (roles || (await t(interaction, 'core.utils.userinfo.value.no.roles')));

        let marriageBlock = null;
        let marriage = null;
        try {
            const marriages = await Marriage.getAllCache({
                where: {
                    [Op.or]: [
                        { user1Id: user.id, status: 'married' },
                        { user2Id: user.id, status: 'married' },
                    ],
                },
                limit: 1,
            });

            marriage = marriages && marriages.length > 0 ? marriages[0] : null;
        } catch {}
        if (marriage) {
            const marriedAtDate = marriage.marriedAt.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
            const marriedFor = marriage.marriedAt ? Math.floor((Date.now() - marriage.marriedAt) / (1000 * 60 * 60 * 24)) : null;

            const partnerId = marriage.user1Id === user.id ? marriage.user2Id : marriage.user1Id;
            let partner = null;
            try {
                partner = await interaction.client.users.fetch(partnerId);
            } catch {}

            const partnerLabel = (await t(interaction, 'fun.marry.profile.partner.label', {}, null)) || 'Partner';

            // Avatar
            const partnerAvatar = partner?.displayAvatarURL ? partner.displayAvatarURL({ extension: 'png', size: 256 }) : defaultAvatar;

            marriageBlock =
                `${(await t(interaction, 'fun.marry.profile.title', {}, null)) || 'Marriage'}\n` +
                `-# **${partnerLabel}**\n### ${partner?.username || 'Unknown'}\n\n` +
                `${(await t(interaction, 'fun.marry.profile.married.since', {}, null)) || 'Married Since'}\n${marriedAtDate}\n` +
                (marriedFor !== null
                    ? `${(await t(interaction, 'fun.marry.profile.days.married', {}, null)) || 'Days Together'}\n${marriedFor} days\n`
                    : '') +
                `${(await t(interaction, 'fun.marry.profile.love.score', {}, null)) || 'Love Score'}\n${marriage.loveScore} ❤️`;

            marriageBlock = {
                content: marriageBlock,
                avatar: partnerAvatar,
                partnerName: partner?.username || 'Unknown',
            };
        }

        const footerText = `${await t(interaction, 'common.container.footer', { username: interaction.client.user.username })}`;

        // Build container
        let containerBuilder = new ContainerBuilder()
            .setAccentColor(convertColor(kythiaConfig.bot.color, { from: 'hex', to: 'decimal' }))
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    `## ${await t(interaction, 'core.utils.userinfo.embed.title')}\n${await t(
                        interaction,
                        'core.utils.userinfo.embed.desc',
                        { tag: user.tag }
                    )}`
                )
            )
            .addSeparatorComponents(new SeparatorBuilder().setDivider(true))
            .addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(new TextDisplayBuilder().setContent(generalSection))
                    .setThumbnailAccessory(new ThumbnailBuilder().setURL(avatarUrl).setDescription(user.username))
            )
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(datesSection));

        if (marriageBlock) {
            // Insert marriage block before roles and after misc
            containerBuilder = containerBuilder
                .addSeparatorComponents(new SeparatorBuilder().setDivider(true))
                .addSectionComponents(
                    new SectionBuilder()
                        .addTextDisplayComponents(new TextDisplayBuilder().setContent(marriageBlock.content))
                        .setThumbnailAccessory(
                            new ThumbnailBuilder().setURL(marriageBlock.avatar).setDescription(marriageBlock.partnerName)
                        )
                );
        }

        containerBuilder = containerBuilder
            .addSeparatorComponents(new SeparatorBuilder().setDivider(true))
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(rolesSection))
            .addSeparatorComponents(new SeparatorBuilder().setDivider(true))
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(footerText));

        return interaction.editReply({
            components: [containerBuilder],
            flags: MessageFlags.IsPersistent | MessageFlags.IsComponentsV2,
        });
    },
};
