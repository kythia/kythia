/**
 * @namespace: addons/core/commands/moderation/warnings.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta
 */
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, InteractionContextType } = require('discord.js');
const User = require('@coreModels/User');
const { embedFooter } = require('@utils/discord');
const { t } = require('@utils/translator');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warnings')
        .setDescription('🔖 Show user warnings.') // This is not translated, but Discord slash command descriptions are not dynamic
        .addUserOption((option) => option.setName('user').setDescription('User to check').setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .setContexts(InteractionContextType.Guild),

    permissions: PermissionFlagsBits.ModerateMembers,
    botPermissions: PermissionFlagsBits.ModerateMembers,
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const user = interaction.options.getUser('user') || interaction.user;
        const userRecord = await User.getCache({ userId: user.id, guildId: interaction.guild.id });

        if (!userRecord || !Array.isArray(userRecord.warnings) || userRecord.warnings.length === 0) {
            return interaction.editReply({
                content: await t(interaction, 'core_moderation_warnings_none', {
                    user: user.tag,
                }),
            });
        }

        const warningsList = (
            await Promise.all(
                userRecord.warnings.map(async (warning, idx) => {
                    return await t(interaction, 'core_moderation_warnings_item', {
                        number: idx + 1,
                        reason: warning.reason || (await t(interaction, 'core_moderation_warnings_unknown_reason')),
                        date: warning.date
                            ? new Date(warning.date).toLocaleString()
                            : await t(interaction, 'core_moderation_warnings_unknown_date'),
                    });
                })
            )
        ).join('\n');

        const embed = new EmbedBuilder()
            .setColor('Red')
            .setDescription(
                await t(interaction, 'core_moderation_warnings_embed_description', {
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
