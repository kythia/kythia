/**
 * @namespace: addons/core/commands/moderation/timeout.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */
const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: (subcommand) =>
        subcommand
            .setName('timeout')
            .setDescription('⏰ Puts a user in timeout for a specified duration.')
            .addUserOption((option) => option.setName('user').setDescription('User to timeout').setRequired(true))
            .addIntegerOption((option) => option.setName('duration').setDescription('Duration in seconds').setRequired(true)),
    permissions: PermissionFlagsBits.ModerateMembers,
    botPermissions: PermissionFlagsBits.ModerateMembers,
    async execute(interaction, container) {
        const { t, helpers } = container;
        const { embedFooter } = helpers.discord;

        await interaction.deferReply({ ephemeral: true });

        const user = interaction.options.getUser('user');
        const duration = interaction.options.getInteger('duration') * 1000;

        let member;
        try {
            member = await interaction.guild.members.fetch(user.id);
        } catch (e) {
            member = null;
        }

        if (member) {
            try {
                await member.timeout(duration, await t(interaction, 'core.moderation.timeout.reason'));
                const embed = new EmbedBuilder()
                    .setColor('Red')
                    .setDescription(
                        `## ${await t(interaction, 'core.moderation.timeout.embed.title')}\n` +
                            (await t(interaction, 'core.moderation.timeout.embed.desc', {
                                user: `<@${user.id}>`,
                                duration: duration / 1000,
                                moderator: `<@${interaction.user.id}>`,
                            }))
                    )
                    .setThumbnail(interaction.client.user.displayAvatarURL())
                    .setTimestamp()
                    .setFooter(await embedFooter(interaction));
                return interaction.editReply({ embeds: [embed] });
            } catch (error) {
                console.error('Error during timeout:', error);
                return interaction.editReply({
                    content: await t(interaction, 'core.moderation.timeout.failed', { error: error.message }),
                });
            }
        } else {
            return interaction.editReply({
                content: await t(interaction, 'core.moderation.timeout.user.not.found'),
            });
        }
    },
};
