/**
 * @namespace: addons/core/commands/utils/kyth/servers.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');
const { BaseCommand } = require('kythia-core');
const serversuiHelper = require('../../../helpers/serversUi');

// Helpers extracted to addons/core/helpers/servers-ui.js

class ServersCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('servers')
			.setDescription('🌐 List all servers the bot is in');
	async execute(interaction) {
		const container = this.container;
		const { t } = container;
		await interaction.deferReply({
			flags: MessageFlags.Ephemeral,
		});
		let guilds = [];
		if (interaction.client.shard) {
			const results = await interaction.client.shard.broadcastEval((c) =>
				c.guilds.cache.map((g) => ({
					id: g.id,
					name: g.name,
					members: g.memberCount,
				})),
			);
			guilds = results.flat();
		} else {
			guilds = interaction.client.guilds.cache.map((g) => ({
				id: g.id,
				name: g.name,
				members: g.memberCount,
			}));
		}

		// Sort by members descending
		guilds.sort((a, b) => b.members - a.members);
		const totalGuilds = guilds.length;
		let currentPage = 1;
		if (totalGuilds === 0) {
			const { containerStr } = await serversuiHelper.generateServersContainer(
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
			await serversuiHelper.generateServersContainer(
				interaction,
				currentPage,
				guilds,
				totalGuilds,
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
			if (i.customId === 'kyth_servers_first') {
				currentPage = 1;
			} else if (i.customId === 'kyth_servers_prev') {
				currentPage = Math.max(1, currentPage - 1);
			} else if (i.customId === 'kyth_servers_next') {
				currentPage = Math.min(initPages, currentPage + 1);
			} else if (i.customId === 'kyth_servers_last') {
				currentPage = initPages;
			}
			const { containerStr: newContainer } =
				await serversuiHelper.generateServersContainer(
					i,
					currentPage,
					guilds,
					totalGuilds,
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
					await serversuiHelper.generateServersContainer(
						interaction,
						currentPage,
						guilds,
						totalGuilds,
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

exports.default = ServersCommand;
