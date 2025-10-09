/**
 * @namespace: addons/core/commands/moderation/slowmode.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc.1
 */
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, InteractionContextType } = require('discord.js');
const { embedFooter } = require('@utils/discord');
const { t } = require('@utils/translator');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('slowmode')
        .setDescription('⏳ Sets the slowmode for the channel.')
        .addIntegerOption((option) => option.setName('duration').setDescription('Duration in seconds').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .setContexts(InteractionContextType.Guild),

    permissions: PermissionFlagsBits.ManageChannels,
    botPermissions: PermissionFlagsBits.ManageChannels,
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const duration = interaction.options.getInteger('duration');
        await interaction.channel.setRateLimitPerUser(duration);

        const embed = new EmbedBuilder()
            .setColor(kythia.bot.color)
            .setDescription(
                `## ⏳ ${await t(interaction, 'core_moderation_slowmode_title')}\n` +
                    (await t(interaction, 'core_moderation_slowmode_set_success', { duration }))
            )
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .setTimestamp()
            .setFooter(await embedFooter(interaction));
        return interaction.editReply({ embeds: [embed] });
    },
};
