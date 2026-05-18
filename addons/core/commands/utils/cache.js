/**
 * @namespace: addons/core/commands/utils/cache.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 1.0.0-rc
 */

const { SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = {
	slashCommand: new SlashCommandBuilder()
		.setName('cache')
		.setDescription('Shows cache statistics.'),

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { helpers, models } = container;
		const { simpleContainer } = helpers.discord;

		const anyModelKey = models ? Object.keys(models)[0] : undefined;
		const KythiaModel = anyModelKey
			? Object.getPrototypeOf(models[anyModelKey])
			: null;

		if (!KythiaModel?.cacheStats) {
			const components = await simpleContainer(
				interaction,
				'❌ No cache stats are available for this model.',
				{ color: 'Red' },
			);
			return interaction.reply({
				components,
				flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
			});
		}

		const stats = KythiaModel.cacheStats;
		const urls = KythiaModel._redisFallbackURLs || [];
		const currentIndex = KythiaModel._redisCurrentIndex || 0;

		let cacheStatus;
		if (KythiaModel.isRedisConnected) {
			if (urls.length > 1) {
				const statusList = [];
				urls.forEach((_url, index) => {
					const name = `Kythia Redis #${index + 1}`;
					if (index === currentIndex) {
						statusList.push(`✅ **${name} (Active)**`);
					} else if (KythiaModel._redisFailedIndexes?.has(index)) {
						statusList.push(`❌ ${name} (Failed)`);
					} else {
						statusList.push(`⚪ ${name} (Standby)`);
					}
				});
				cacheStatus = statusList.join('\n');
			} else {
				cacheStatus = '### `✅` **Kythia Redis (Online)**';
			}
		} else if (!KythiaModel.isShardMode) {
			cacheStatus = '### `⚠️` **In-Memory (Fallback)**';
		} else {
			cacheStatus = '### `❌` **DISABLED (Sharding)**';
		}

		const desc = [
			'## 📊 Cache Engine Statistics',
			cacheStatus,
			'',
			`**Redis Hits:** \`${stats.redisHits || 0}\``,
			`**In-Memory Hits:** \`${stats.mapHits || 0}\``,
			`**Cache Misses:** \`${stats.misses || 0}\``,
			`**Cache Sets:** \`${stats.sets || 0}\``,
			`**Cache Clears:** \`${stats.clears || 0}\``,
		].join('\n');

		const components = await simpleContainer(interaction, desc);

		await interaction.reply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	},
};
