/**
 * @namespace: addons/music/commands/reloadnode.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc1
 */

const { SlashCommandBuilder, InteractionContextType } = require('discord.js');
const logger = require('@utils/logger');
// Path ini mungkin perlu disesuaikan ya
const { reloadLavalinkNodes } = require('../helpers/reloadNode');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reloadnode')
        .setDescription('🔄️ Reload Lavalink nodes and configuration')
        // Bikin command ini bisa dipakai di server & DM, lebih fleksibel
        .setContexts(InteractionContextType.BotDM),
    ownerOnly: true,
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            // Ini perbaikannya: tambahkan `interaction.client` sebagai argumen
            await reloadLavalinkNodes(interaction.client);

            // Kirim konfirmasi kalau berhasil
            await interaction.followUp({ content: '✅ Config and Lavalink nodes have been reloaded!' });
        } catch (error) {
            logger.error('❌ Failed to reload nodes:', error);
            // Kirim pesan error kalau gagal
            await interaction.followUp({ content: `❌ Failed to reload nodes: ${error.message}` });
        }
    },
};
