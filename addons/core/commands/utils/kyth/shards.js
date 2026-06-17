/**
 * @namespace: addons/core/commands/utils/kyth/shards.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');
const { BaseCommand } = require('kythia-core');
const shardsuiHelper = require('../../../helpers/shardsUi');

// Helpers extracted to addons/core/helpers/shards-ui.js

class ShardsCommand extends BaseCommand {
	subcommand = true;
	aliases = ['shards'];

	slashCommand = (subcommand) =>
		subcommand
			.setName('shards')
			.setDescription('🧩 List all bot shards and their info');

	async execute(interaction) {
		const container = this.container;
		const { t } = container;
		await interaction.deferReply();
		let shards = [];
		if (interaction.client.shard) {
			const results = await interaction.client.shard.broadcastEval((c) => ({
				id: c.shard.ids[0],
				guilds: c.guilds.cache.size,
				users: c.guilds.cache.reduce(
					(acc, guild) => acc + guild.memberCount,
					0,
				),
				uptime: c.uptime,
				rss: process.memoryUsage().rss,
				telemetry: c.container.metrics?.getCacheTelemetry() || [],
			}));
			shards = results;
		} else {
			shards = [
				{
					id: 0,
					guilds: interaction.client.guilds.cache.size,
					users: interaction.client.guilds.cache.reduce(
						(acc, guild) => acc + guild.memberCount,
						0,
					),
					uptime: interaction.client.uptime,
					rss: process.memoryUsage().rss,
					telemetry: container.metrics?.getCacheTelemetry() || [],
				},
			];
		}

		// Sort by ID ascending
		shards.sort((a, b) => a.id - b.id);
		const totalShards = shards.length;
		let currentPage = 1;
		if (totalShards === 0) {
			const { containerStr } = await shardsuiHelper.generateShardsContainer(
				interaction,
				1,
				[],
				0,
				true,
			);
			return interaction.editReply({
				components: [containerStr],
				flags: MessageFlags.IsComponentsV2,
				allowedMentions: {
					parse: [],
				},
			});
		}
		const { containerStr: initContainer, totalPages: initPages } =
			await shardsuiHelper.generateShardsContainer(
				interaction,
				currentPage,
				shards,
				totalShards,
			);
		const message = await interaction.editReply({
			components: [initContainer],
			flags: MessageFlags.IsComponentsV2,
			fetchReply: true,
			allowedMentions: {
				parse: [],
			},
		});
		if (initPages <= 1) return;
		const collector = message.createMessageComponentCollector({
			time: 300000,
		});
		collector.on('collect', async (i) => {
			if (i.user.id !== interaction.user.id) {
				return i.reply({
					content: await t(i, 'common.pagination.not.your.interaction'),
					flags: MessageFlags.Ephemeral,
				});
			}
			if (i.customId === 'kyth_shards_first') {
				currentPage = 1;
			} else if (i.customId === 'kyth_shards_prev') {
				currentPage = Math.max(1, currentPage - 1);
			} else if (i.customId === 'kyth_shards_next') {
				currentPage = Math.min(initPages, currentPage + 1);
			} else if (i.customId === 'kyth_shards_last') {
				currentPage = initPages;
			}
			const { containerStr: newContainer } =
				await shardsuiHelper.generateShardsContainer(
					i,
					currentPage,
					shards,
					totalShards,
				);
			await i.update({
				components: [newContainer],
				flags: MessageFlags.IsComponentsV2,
				allowedMentions: {
					parse: [],
				},
			});
		});
		collector.on('end', async () => {
			try {
				const { containerStr: finalContainer } =
					await shardsuiHelper.generateShardsContainer(
						interaction,
						currentPage,
						shards,
						totalShards,
						true,
					);
				await interaction.editReply({
					components: [finalContainer],
					flags: MessageFlags.IsComponentsV2,
					allowedMentions: {
						parse: [],
					},
				});
			} catch (_e) {}
		});
	}
}

exports.default = ShardsCommand;
