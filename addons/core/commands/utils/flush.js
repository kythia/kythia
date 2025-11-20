/**
 * @namespace: addons/core/commands/utils/flush.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { SlashCommandBuilder, InteractionContextType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('flush')
        .setDescription('💥 Flush Redis Cache (Global)')
        .setContexts(InteractionContextType.BotDM),
    ownerOnly: true,

    async execute(interaction, container) {
        const { logger, redis } = container;

        await interaction.deferReply({ ephemeral: true });

        if (!redis || redis.status !== 'ready') {
            return interaction.editReply('❌ Redis is not connected or is currently down. Unable to flush.');
        }

        try {
            logger.debug('[REDIS FLUSH] Using existing shared container connection...');

            const pong = await redis.ping();
            logger.debug(`[REDIS FLUSH] Redis ping response: ${pong}`);

            logger.debug('[REDIS FLUSH] Attempting to FLUSHALL...');

            const sizeBefore = await redis.dbsize();

            const result = await redis.flushall();
            logger.debug(`[REDIS FLUSH] FLUSHALL result: ${result}`);

            const dbsize = await redis.dbsize();
            logger.debug(`[REDIS FLUSH] dbsize after FLUSHALL: ${dbsize}`);

            if (result === 'OK' && dbsize === 0) {
                await interaction.editReply(`✅ **Redis flush successful!**\n🧹 Cleared ${sizeBefore} keys.`);
            } else {
                await interaction.editReply(`⚠️ FLUSHALL command sent, but DB size is still: ${dbsize}.`);
            }
        } catch (e) {
            logger.error('[REDIS FLUSH] Flush failed:', e);
            await interaction.editReply(`❌ Failed to flush cache: \`${e.message}\``);
        }
    },
};
