/**
 * @namespace: addons/core/commands/moderation/say.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */
const { PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: (subcommand) =>
        subcommand
            .setName('say')
            .setDescription('💬 Make the bot send a message')
            .addStringOption((option) => option.setName('message').setDescription('Message to send').setRequired(true)),
    permissions: PermissionFlagsBits.ManageGuild,
    botPermissions: PermissionFlagsBits.ManageGuild,
    async execute(interaction, container) {
        const { t } = container;

        await interaction.deferReply({ ephemeral: true });

        const message = interaction.options.getString('message');

        await interaction.channel.send(message);
        return interaction.editReply(await t(interaction, 'core.moderation.say.success', { message }));
    },
};
