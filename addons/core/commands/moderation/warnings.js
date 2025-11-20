/**
 * @namespace: addons/core/commands/moderation/warnings.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */
const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: (subcommand) =>
        subcommand
            .setName('warnings')
            .setDescription('🔖 Show user warnings.')
            .addUserOption((option) => option.setName('user').setDescription('User to check').setRequired(false)),

    permissions: PermissionFlagsBits.ModerateMembers,
    botPermissions: PermissionFlagsBits.ModerateMembers,
    async execute(interaction, container) {
        const { t, helpers, models } = container;
        const { embedFooter } = helpers.discord;
        const { User } = models;
        await interaction.deferReply({ ephemeral: true });

        const user = interaction.options.getUser('user') || interaction.user;
        const userRecord = await User.getCache({ userId: user.id, guildId: interaction.guild.id });

        if (!userRecord || !Array.isArray(userRecord.warnings) || userRecord.warnings.length === 0) {
            return interaction.editReply({
                content: await t(interaction, 'core.moderation.warnings.none', {
                    user: user.tag,
                }),
            });
        }

        const warningsList = (
            await Promise.all(
                userRecord.warnings.map(async (warning, idx) => {
                    return await t(interaction, 'core.moderation.warnings.item', {
                        number: idx + 1,
                        reason: warning.reason || (await t(interaction, 'core.moderation.warnings.unknown.reason')),
                        date: warning.date
                            ? new Date(warning.date).toLocaleString()
                            : await t(interaction, 'core.moderation.warnings.unknown.date'),
                    });
                })
            )
        ).join('\n');

        const embed = new EmbedBuilder()
            .setColor('Red')
            .setDescription(
                await t(interaction, 'core.moderation.warnings.embed.description', {
                    user: `<@${user.id}>`,
                    warnings: warningsList,
                })
            )
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .setTimestamp()
            .setFooter(await embedFooter(interaction));

        return interaction.editReply({ embeds: [embed] });
    },
};
