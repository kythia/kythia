/**
 * @namespace: addons/economy/commands/leaderboard.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');
const { BaseCommand } = require('kythia-core');
const leaderboardHelper = require('../helpers/leaderboard');

// Helpers extracted to addons/economy/helpers/leaderboard.js

class LeaderboardCommand extends BaseCommand {
	subcommand = true;
	slashCommand = (subcommand) =>
		subcommand
			.setName('leaderboard')
			.setDescription('🏆 View the global economy leaderboard.');
	async execute(interaction) {
		const container = this.container;
		const { t, models } = container;
		const { KythiaUser } = models;
		const { generateLeaderboardContainer } = leaderboardHelper;
		const MAX_USERS = 100;
		await interaction.deferReply();

		// Fetch all users ordered by total wealth (coin + bank)
		const allUsers = await KythiaUser.getAllCache({
			attributes: ['userId', 'kythiaCoin', 'kythiaBank'],
			order: [
				[KythiaUser.sequelize.literal('(kythiaCoin + kythiaBank)'), 'DESC'],
			],
			limit: MAX_USERS,
			cacheTags: ['KythiaUser:leaderboard'],
		});
		const totalUsers = allUsers.length;
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
			});
		}
		const { leaderboardContainer, totalPages } =
			await generateLeaderboardContainer(
				interaction,
				currentPage,
				allUsers,
				totalUsers,
			);
		const message = await interaction.editReply({
			components: [leaderboardContainer],
			flags: MessageFlags.IsComponentsV2,
			fetchReply: true,
		});

		// Only add collector if there are multiple pages
		if (totalPages <= 1) return;
		const collector = message.createMessageComponentCollector({
			time: 300000,
		});
		collector.on('collect', async (i) => {
			if (i.user.id !== interaction.user.id) {
				return i.reply({
					content: await t(i, 'economy.leaderboard.not.your.interaction'),
					flags: MessageFlags.Ephemeral,
				});
			}

			// Handle navigation
			if (i.customId === 'leaderboard_first') {
				currentPage = 1;
			} else if (i.customId === 'leaderboard_prev') {
				currentPage = Math.max(1, currentPage - 1);
			} else if (i.customId === 'leaderboard_next') {
				currentPage = Math.min(totalPages, currentPage + 1);
			} else if (i.customId === 'leaderboard_last') {
				currentPage = totalPages;
			}
			const { leaderboardContainer: newLeaderboardContainer } =
				await generateLeaderboardContainer(
					i,
					currentPage,
					allUsers,
					totalUsers,
				);
			await i.update({
				components: [newLeaderboardContainer],
				flags: MessageFlags.IsComponentsV2,
			});
		});
		collector.on('end', async () => {
			try {
				const { leaderboardContainer: finalContainer } =
					await generateLeaderboardContainer(
						interaction,
						currentPage,
						allUsers,
						totalUsers,
						true,
					);
				await message.edit({
					components: [finalContainer],
					flags: MessageFlags.IsComponentsV2,
				});
			} catch (_error) {}
		});
	}
}
exports.default = LeaderboardCommand;
