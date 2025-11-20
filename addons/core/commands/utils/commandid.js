/**
 * @namespace: addons/core/commands/utils/commandid.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */
const { SlashCommandBuilder, InteractionContextType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('command-id')
        .setDescription("🔍 Find a command's ID and generate its mention.")
        .addStringOption((opt) => opt.setName('name').setDescription('The name of the command to look up').setRequired(true))
        .setContexts(InteractionContextType.BotDM),
    ownerOnly: true,
    async execute(interaction, container) {
        const { t } = container;

        await interaction.deferReply({ ephemeral: true });

        const input = interaction.options.getString('name');
        const parts = input.trim().split(/\s+/);
        const commandName = parts[0];

        await interaction.client.application.commands.fetch();
        const cmd = interaction.client.application.commands.cache.find((c) => c.name === commandName);

        if (!cmd) {
            return interaction.editReply({
                content: await t(interaction, 'core.utils.commandid.not.found', { commandName }),
            });
        }

        const mention = `</${parts.join(' ')}:${cmd.id}>`;
        return interaction.editReply({
            content: await t(interaction, 'core.utils.commandid.success', { commandId: cmd.id, mention }),
        });
    },
};
