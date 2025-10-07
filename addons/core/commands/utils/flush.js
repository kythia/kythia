/**
 * @namespace: addons/core/commands/utils/flush.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc1
 */

const { SlashCommandBuilder, InteractionContextType } = require('discord.js');
const Redis = require('ioredis');
const logger = require('@utils/logger');

module.exports = {
    data: new SlashCommandBuilder().setName('flush').setDescription('💥 Flush Redis Cache').setContexts(InteractionContextType.BotDM),
    ownerOnly: true,

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const redis = new Redis(kythia.db.redis);

        try {
            await redis.flushall();
            await interaction.editReply('✅ Cache Redis berhasil di-flush.');
        } catch (e) {
            logger.error('Manual flush failed:', e);
            await interaction.editReply('❌ Gagal melakukan flush cache.');
        } finally {
            redis.disconnect();
        }
    },
};
