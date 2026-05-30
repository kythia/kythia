/**
 * @namespace: addons/core/commands/utils/cache.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
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
		const { helpers, models, sequelize } = container;
		const { simpleContainer } = helpers.discord;

		// Get any registered model subclass. Since static methods/properties
		// are inherited, we can just use the subclass directly as our KythiaModel proxy.
		const anyModelKey = models ? Object.keys(models)[0] : undefined;
		const KythiaModel = anyModelKey ? models[anyModelKey] : null;

		if (!KythiaModel || typeof KythiaModel.getGlobalCacheStats !== 'function') {
			const components = await simpleContainer(
				interaction,
				'❌ No cache stats are available.',
				{ color: 'Red' },
			);
			return interaction.reply({
				components,
				flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
			});
		}

		// ✅ Aggregate across ALL model subclasses in this shard.
		// Reading KythiaModel.cacheStats directly always returns 0 because
		// each subclass gets its own isolated cacheStats object in autoBoot().
		const sequelizeModels =
			sequelize?.models ?? (anyModelKey ? { [anyModelKey]: KythiaModel } : {});
		const stats = KythiaModel.getGlobalCacheStats(sequelizeModels);
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
