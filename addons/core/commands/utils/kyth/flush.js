/**
 * @namespace: addons/core/commands/utils/kyth/flush.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');

const { BaseCommand } = require('kythia-core');

class FlushCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand.setName('flush').setDescription('💥 Flush Redis Cache (Global)');

	async execute(interaction) {
		const container = this.container;
		const { logger, redis, helpers } = container;
		const { simpleContainer } = helpers.discord;

		await interaction.deferReply({
			flags: MessageFlags.Ephemeral,
		});

		if (redis?.status !== 'ready') {
			const msg =
				'❌ Redis is not connected or is currently down. Unable to flush.';

			return interaction.editReply({
				components: await simpleContainer(interaction, msg, {
					color: 'Red',
				}),
				flags: MessageFlags.IsComponentsV2,
			});
		}

		logger.debug(`Using existing shared container connection...`, {
			label: 'core',
		});

		const pong = await redis.ping();
		logger.debug(`Redis ping response: ${pong}`, { label: 'core' });

		logger.debug(`Attempting to FLUSHALL...`, { label: 'core' });

		const sizeBefore = await redis.dbsize();

		const result = await redis.flushall();
		logger.debug(`FLUSHALL result: ${result}`, { label: 'core' });

		const dbsize = await redis.dbsize();
		logger.debug(`dbsize after FLUSHALL: ${dbsize}`, { label: 'core' });

		if (result === 'OK' && dbsize === 0) {
			await interaction.editReply({
				components: await simpleContainer(
					interaction,
					`## ✅ Redis flush successful!\n🧹 Cleared ${sizeBefore} keys.`,
					{
						color: 'Green',
					},
				),
				flags: MessageFlags.IsComponentsV2,
			});
		} else {
			await interaction.editReply({
				components: await simpleContainer(
					interaction,
					`## ⚠️ REDIS FLUSHALL\ncommand sent, but DB size is still: ${dbsize}.`,
					{
						color: 'Orange',
					},
				),
				flags: MessageFlags.IsComponentsV2,
			});
		}
	}
}

exports.default = FlushCommand;
