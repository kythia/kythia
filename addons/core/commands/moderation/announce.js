/**
 * @namespace: addons/core/commands/moderation/announce.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */
const { SlashCommandBuilder, PermissionFlagsBits, InteractionContextType } = require('discord.js');

module.exports = {
    data: (subcommand) =>
        subcommand
            .setName('announce')
            .setDescription('📢 Send an announcement to a specified channel.')
            .addChannelOption((option) => option.setName('channel').setDescription('Channel to send the announcement').setRequired(true))
            .addStringOption((option) => option.setName('message').setDescription('Announcement message').setRequired(true)),
    permissions: PermissionFlagsBits.ManageMessages,
    botPermissions: PermissionFlagsBits.ManageMessages,
    async execute(interaction, container) {
        const { t } = container;

        await interaction.deferReply();
        const channel = interaction.options.getChannel('channel');
        const message = interaction.options.getString('message');

        await channel.send(await t(interaction, 'core.moderation.announce.message.format', { message }));
        return interaction.editReply(await t(interaction, 'core.moderation.announce.success', { channel: channel.name }));
    },
};
