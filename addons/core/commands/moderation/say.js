/**
 * @namespace: addons/core/commands/moderation/say.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc.1
 */
const { SlashCommandBuilder, PermissionFlagsBits, InteractionContextType } = require('discord.js');
const { t } = require('@utils/translator');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription('💬 Make the bot send a message')
        .addStringOption((option) => option.setName('message').setDescription('Message to send').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .setContexts(InteractionContextType.Guild),
    permissions: PermissionFlagsBits.ManageGuild,
    botPermissions: PermissionFlagsBits.ManageGuild,
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const message = interaction.options.getString('message');

        await interaction.channel.send(message);
        return interaction.editReply(await t(interaction, 'core_moderation_say_success', { message }));
    },
};
