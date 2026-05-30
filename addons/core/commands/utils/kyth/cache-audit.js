/**
 * @namespace: addons/core/commands/utils/kyth/cache-audit.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { SlashCommandSubcommandBuilder, MessageFlags } = require('discord.js');

module.exports = {
	slashCommand: new SlashCommandSubcommandBuilder()
		.setName('cache-audit')
		.setDescription(
			'Audit Redis cache against the database to detect stale data.',
		)
		.addStringOption((option) =>
			option
				.setName('model')
				.setDescription('The database model to audit')
				.setRequired(false)
				.setAutocomplete(true),
		)
		.addBooleanOption((option) =>
			option
				.setName('auto_clear')
				.setDescription(
					'Automatically flush the cache for any models found with stale data',
				)
				.setRequired(false),
		),
	ownerOnly: true,

	async autocomplete(interaction) {
		const focusedValue = interaction.options.getFocused();
		const models = Object.keys(interaction.client.container.models);

		const choices = models
			.filter((m) => m.toLowerCase().includes(focusedValue.toLowerCase()))
			.map((m) => ({ name: m, value: m }))
			.slice(0, 25);

		await interaction.respond(choices);
	},

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { models, helpers, kythiaConfig } = container;
		const { simpleContainer } = helpers.discord;

		const modelName = interaction.options.getString('model');
		const autoClear = interaction.options.getBoolean('auto_clear') ?? false;
		const targetModels = modelName ? [modelName] : Object.keys(models);

		if (modelName && !models[modelName]) {
			return interaction.reply({
				components: await simpleContainer(
					interaction,
					`❌ Model **${modelName}** not found.`,
					{ color: 'Red' },
				),
				flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
			});
		}

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		try {
			const cacheVersion = kythiaConfig.db?.redisCacheVersion || '1.0.0';

			let grandTotalKeys = 0;
			let grandSampled = 0;
			let grandStale = 0;
			let grandErrors = 0;
			const staleModels = [];

			for (const mName of targetModels) {
				const Model = models[mName];
				if (!Model) continue;

				const redis = Model.getRedis ? Model.getRedis() : null;
				if (!redis || redis.status !== 'ready') continue;

				const pattern = `${cacheVersion}:${mName}:*`;
				const keys = [];

				let cursor = '0';
				do {
					const res = await redis.scan(
						cursor,
						'MATCH',
						pattern,
						'COUNT',
						'100',
					);
					cursor = res[0];
					keys.push(...res[1]);
				} while (cursor !== '0');

				if (keys.length === 0) continue;

				grandTotalKeys += keys.length;

				const sampleKeys = keys.slice(0, 100);
				const values = await redis.mget(...sampleKeys);

				let staleCount = 0;
				let validCount = 0;
				let errorCount = 0;

				const pkFields = Model.primaryKeyAttributes || [
					Model.primaryKeyAttribute || 'id',
				];

				for (let i = 0; i < sampleKeys.length; i++) {
					const val = values[i];
					if (!val) continue;

					try {
						const parsed = JSON.parse(val);
						const cachedRows = parsed.rows
							? parsed.rows
							: Array.isArray(parsed)
								? parsed
								: [parsed];

						for (const cachedRow of cachedRows) {
							if (pkFields.some((field) => cachedRow[field] === undefined))
								continue;

							const whereClause = {};
							for (const field of pkFields) {
								whereClause[field] = cachedRow[field];
							}

							const liveRow = await Model.findOne({
								where: whereClause,
								raw: true,
							});

							if (!liveRow) {
								// Exists in cache but deleted in DB — definitely stale
								staleCount++;
								continue;
							}

							// Guard: skip rows where timestamps are completely missing to avoid false positives
							const cachedRawTs =
								cachedRow.updatedAt ?? cachedRow.createdAt ?? null;
							const liveRawTs = liveRow.updatedAt ?? liveRow.createdAt ?? null;
							if (!cachedRawTs || !liveRawTs) {
								validCount++;
								continue;
							}

							const cachedTime = new Date(cachedRawTs).getTime();
							const liveTime = new Date(liveRawTs).getTime();

							// Guard: skip if either timestamp parsed to NaN
							if (Number.isNaN(cachedTime) || Number.isNaN(liveTime)) {
								validCount++;
								continue;
							}

							// Allow 1 second drift for write propagation lag
							if (liveTime > cachedTime + 1000) {
								staleCount++;
							} else {
								validCount++;
							}
						}
					} catch (_e) {
						errorCount++;
					}
				}

				if (staleCount > 0) staleModels.push(mName);

				grandSampled += validCount + staleCount;
				grandStale += staleCount;
				grandErrors += errorCount;
			}

			if (grandTotalKeys === 0) {
				return interaction.editReply({
					components: await simpleContainer(
						interaction,
						`✅ No cached entries found for the selected targets.`,
						{ color: 'Green' },
					),
					flags: MessageFlags.IsComponentsV2,
				});
			}

			// Auto-clear runs AFTER we confirm there is actual data to evaluate
			if (staleModels.length > 0 && autoClear) {
				for (const mName of staleModels) {
					if (
						models[mName] &&
						typeof models[mName].invalidateByTags === 'function'
					) {
						await models[mName].invalidateByTags([mName]);
					}
				}
			}

			const statusColor = grandStale > 0 ? 'Red' : 'Green';
			const statusIcon = grandStale > 0 ? '⚠️' : '✅';

			let desc = `### ${statusIcon} Cache Audit: **${modelName ? modelName : 'ALL MODELS'}**\n\n`;
			desc += `**Total Keys in Redis:** \`${grandTotalKeys}\`\n`;
			desc += `**Rows Sampled:** \`${grandSampled}\`\n\n`;

			if (grandStale > 0) {
				desc += `🚨 **${grandStale} STALE ROWS DETECTED!**\n`;
				desc += `The database has newer data than what is currently trapped in Redis.\n\n`;
				desc += `**Models with stale data:**\n> ${staleModels.join(', ')}\n\n`;

				if (autoClear) {
					desc += `🧹 **Action Taken:** Automatically flushed the cache for the affected models!`;
				} else {
					desc += `*Recommendation: Run this command again with \`auto_clear: true\` or use \`/cache-clear\`.*`;
				}
			} else {
				desc += `✅ **Perfect Sync!** All cached data matches the live database.`;
			}

			if (grandErrors > 0)
				desc += `\n\n*(Failed to parse ${grandErrors} cache keys)*`;

			await interaction.editReply({
				components: await simpleContainer(interaction, desc, {
					color: statusColor,
				}),
				flags: MessageFlags.IsComponentsV2,
			});
		} catch (error) {
			container.logger.error(`Cache Audit Error: ${error.message}`);
			await interaction.editReply({
				components: await simpleContainer(
					interaction,
					`❌ Error during audit: ${error.message}`,
					{ color: 'Red' },
				),
				flags: MessageFlags.IsComponentsV2,
			});
		}
	},
};
