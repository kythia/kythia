/**
 * @namespace: addons/core/commands/moderation/announce.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta
 */
const { SlashCommandBuilder, PermissionFlagsBits, InteractionContextType } = require('discord.js');
const { t } = require('@utils/translator');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('announce')
        .setDescription('📢 Send an announcement to a specified channel.')
        .addChannelOption((option) => option.setName('channel').setDescription('Channel to send the announcement').setRequired(true))
        .addStringOption((option) => option.setName('message').setDescription('Announcement message').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .setContexts(InteractionContextType.Guild),
    permissions: PermissionFlagsBits.ManageMessages,
    botPermissions: PermissionFlagsBits.ManageMessages,
    async execute(interaction) {
        await interaction.deferReply();
        const channel = interaction.options.getChannel('channel');
        const message = interaction.options.getString('message');

        await channel.send(await t(interaction, 'core_moderation_announce_message_format', { message }));
        return interaction.editReply(await t(interaction, 'core_moderation_announce_success', { channel: channel.name }));
    },
};
