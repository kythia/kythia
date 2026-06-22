/**
 * @namespace: addons/invite/commands/leaderboard.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');
const { BaseCommand } = require('kythia-core');
const leaderboardHelper = require('../helpers/leaderboard');

// Helpers extracted to addons/invite/helpers/leaderboard.js

class LeaderboardCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('leaderboard')
			.setDescription('View top inviters leaderboard');
	async execute(interaction) {
		const container = this.container;
		const { t, models } = container;
		const { Invite } = models;
		const { generateLeaderboardContainer } = leaderboardHelper;
		const MAX_USERS = 100;
		const guildId = interaction.guild.id;
		await interaction.deferReply();
		const allInviters = await Invite.getAllCache({
			where: {
				guildId: guildId,
			},
			order: [['invites', 'DESC']],
			limit: MAX_USERS,
			cacheTags: [`Invite:leaderboard:${guildId}`],
		});
		const totalUsers = allInviters.length;
		let currentPage = 1;
		if (totalUsers === 0) {
			const { leaderboardContainer } = await generateLeaderboardContainer(
				interaction,
				1,
				[],
				0,
				/*navDisabled*/ true,
			);
			return interaction.editReply({
				components: [leaderboardContainer],
				flags: MessageFlags.IsComponentsV2,
				allowedMentions: {
					parse: [],
				},
			});
		}
		const { leaderboardContainer, totalPages } =
			await generateLeaderboardContainer(
				interaction,
				currentPage,
				allInviters,
				totalUsers,
			);
		const message = await interaction.editReply({
			components: [leaderboardContainer],
			flags: MessageFlags.IsComponentsV2,
			fetchReply: true,
		});
		if (totalPages <= 1) return;
		const collector = message.createMessageComponentCollector({
			time: 300000,
		});
		collector.on('collect', async (i) => {
			if (i.user.id !== interaction.user.id) {
				return i.reply({
					content: await t(
						i,
						'economy.commands.leaderboard.not.your.interaction',
					),
					flags: MessageFlags.Ephemeral,
					allowedMentions: {
						parse: [],
					},
				});
			}
			if (i.customId === 'leaderboard_first') {
				currentPage = 1;
			} else if (i.customId === 'leaderboard_prev') {
				currentPage = Math.max(1, currentPage - 1);
			} else if (i.customId === 'leaderboard_next') {
				currentPage = Math.min(totalPages, currentPage + 1);
			} else if (i.customId === 'leaderboard_last') {
				currentPage = totalPages;
			}
			const { leaderboardContainer: newContainer } =
				await generateLeaderboardContainer(
					i,
					currentPage,
					allInviters,
					totalUsers,
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
				const { leaderboardContainer: finalContainer } =
					await generateLeaderboardContainer(
						interaction,
						currentPage,
						allInviters,
						totalUsers,
						true,
					);
				await message.edit({
					components: [finalContainer],
					flags: MessageFlags.IsComponentsV2,
					allowedMentions: {
						parse: [],
					},
				});
			} catch (_error) {}
		});
	}
}

exports.default = LeaderboardCommand;
