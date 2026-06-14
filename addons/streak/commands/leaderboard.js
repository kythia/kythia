/**
 * @namespace: addons/streak/commands/leaderboard.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');

const { BaseCommand } = require('kythia-core');

// Helpers extracted to addons/streak/helpers/leaderboard.js

class LeaderboardCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('leaderboard')
			.setDescription('🥇 Streak leaderboard in this server');

	async execute(interaction) {
		const container = this.container;
		const { t, models, helpers } = container;
		const { ServerSetting, Streak } = models;
		const { generateLeaderboardContainer } = helpers.streak.leaderboard;

		const MAX_USERS = 100;
		const guildId = interaction.guild.id;

		const serverSetting = await ServerSetting.getCache({ guildId });
		const streakEmoji = serverSetting.streakEmoji || '🔥';

		await interaction.deferReply();

		const allStreaks = await Streak.getAllCache({
			where: { guildId },
			order: [
				['currentStreak', 'DESC'],
				['highestStreak', 'DESC'],
			],
			limit: MAX_USERS,
			cacheTags: [`Streak:leaderboard`],
		});

		const totalUsers = allStreaks.length;
		let currentPage = 1;

		if (totalUsers === 0) {
			const { leaderboardContainer } = await generateLeaderboardContainer(
				interaction,
				1,
				[],
				0,
				streakEmoji,
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
				allStreaks,
				totalUsers,
				streakEmoji,
			);

		const message = await interaction.editReply({
			components: [leaderboardContainer],
			flags: MessageFlags.IsComponentsV2,
			fetchReply: true,
			allowedMentions: {
				parse: [],
			},
		});

		if (totalPages <= 1) return;

		const collector = message.createMessageComponentCollector({ time: 300000 });

		collector.on('collect', async (i) => {
			if (i.user.id !== interaction.user.id) {
				return i.reply({
					content: await t(i, 'streak.streak.leaderboard.not.your.interaction'),
					flags: MessageFlags.Ephemeral,
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

			const { leaderboardContainer: newLeaderboardContainer } =
				await generateLeaderboardContainer(
					i,
					currentPage,
					allStreaks,
					totalUsers,
					streakEmoji,
				);

			await i.update({
				components: [newLeaderboardContainer],
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
						allStreaks,
						totalUsers,
						streakEmoji,
						true,
					);

				await message.edit({
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

exports.default = LeaderboardCommand;
