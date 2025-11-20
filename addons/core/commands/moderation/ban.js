/**
 * @namespace: addons/core/commands/moderation/ban.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */
const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: (subcommand) =>
        subcommand
            .setName('ban')
            .setDescription('⚠️ Ban a user from the server.')
            .addUserOption((option) => option.setName('user').setDescription('User to ban').setRequired(true))
            .addStringOption((option) => option.setName('reason').setDescription('Reason for ban (optional)').setRequired(false)),
    permissions: PermissionFlagsBits.BanMembers,
    botPermissions: PermissionFlagsBits.BanMembers,
    async execute(interaction, container) {
        const { t, helpers } = container;
        const { embedFooter } = helpers.discord;

        await interaction.deferReply();

        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || (await t(interaction, 'core.moderation.ban.default.reason'));

        let member;
        try {
            member = await interaction.guild.members.fetch(user.id);
        } catch (e) {
            member = null;
        }

        // Prevent self-ban
        if (user.id === interaction.user.id) {
            return interaction.editReply({
                content: await t(interaction, 'core.moderation.ban.cannot.self'),
                ephemeral: true,
            });
        }

        if (member) {
            await member.ban({ reason });
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setTitle(await t(interaction, 'core.moderation.ban.embed.title'))
                .setDescription(
                    await t(interaction, 'core.moderation.ban.embed.desc', {
                        tag: user.tag,
                        reason,
                    })
                )
                .setThumbnail(interaction.client.user.displayAvatarURL())
                .setTimestamp()
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        } else {
            return interaction.editReply({
                content: await t(interaction, 'core.moderation.ban.user.not.found'),
            });
        }
    },
};
