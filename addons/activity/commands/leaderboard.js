/**
 * @namespace: addons/activity/commands/leaderboard.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');
const { fn, Op, col, literal } = require('sequelize');

const { BaseCommand } = require('kythia-core');

const leaderboardHelper = require('../helpers/leaderboard');

class LeaderboardCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('leaderboard')
			.setDescription('📊 Activity leaderboard for this server.')
			.addStringOption((option) =>
				option
					.setName('type')
					.setDescription('Sort by messages or voice time.')
					.setRequired(false)
					.addChoices(
						{
							name: '📨 Messages',
							value: 'messages',
						},
						{
							name: '🎙️ Voice Time',
							value: 'voice',
						},
					),
			)
			.addStringOption((option) =>
				option
					.setName('period')
					.setDescription('Time period to show. Defaults to all time.')
					.setRequired(false)
					.addChoices(
						{
							name: '🕰️ All Time',
							value: 'all',
						},
						{
							name: '📅 Today',
							value: 'daily',
						},
						{
							name: '📆 This Week',
							value: 'weekly',
						},
						{
							name: '🗓️ This Month',
							value: 'monthly',
						},
					),
			);

	async execute(interaction) {
		const container = this.container;
		const { t, models } = container;
		const { ActivityStat, ActivityLog } = models;
		const { getPeriodStart, generateLeaderboardContainer, MAX_USERS } =
			leaderboardHelper;

		await interaction.deferReply();

		const guildId = interaction.guild.id;
		const type = interaction.options.getString('type') || 'messages';
		const period = interaction.options.getString('period') || 'all';

		const orderColumn = type === 'voice' ? 'totalVoiceTime' : 'totalMessages';
		const periodLabel = await t(
			interaction,
			`activity.leaderboard.activity.leaderboard.period.${period}`,
		);

		let allStats;

		if (period === 'all') {
			allStats = await ActivityStat.getAllCache({
				where: {
					guildId,
				},
				order: [[orderColumn, 'DESC']],
				limit: MAX_USERS,
				cacheTags: [`ActivityStat:leaderboard:${type}:${guildId}`],
			});
		} else {
			const startDate = getPeriodStart(period);
			const logColumn = type === 'voice' ? 'voiceTime' : 'messages';
			allStats = await ActivityLog.getAllCache({
				where: {
					guildId,
					date: {
						[Op.gte]: startDate,
					},
				},
				attributes: ['userId', [fn('SUM', col(logColumn)), orderColumn]],
				group: ['userId'],
				order: [[literal(orderColumn), 'DESC']],
				limit: MAX_USERS,
				raw: true,
			});
		}

		const totalUsers = allStats.length;
		let currentPage = 1;

		if (totalUsers === 0) {
			const { leaderboardContainer } = await generateLeaderboardContainer(
				interaction,
				1,
				[],
				0,
				type,
				periodLabel,
				true,
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
				allStats,
				totalUsers,
				type,
				periodLabel,
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

		const collector = message.createMessageComponentCollector({
			time: 300_000,
		});

		collector.on('collect', async (i) => {
			if (i.user.id !== interaction.user.id) {
				return i.reply({
					content: await t(
						i,
						'activity.leaderboard.activity.leaderboard.not.your.interaction',
					),
					flags: MessageFlags.Ephemeral,
				});
			}

			if (i.customId === 'activity_lb_first') {
				currentPage = 1;
			} else if (i.customId === 'activity_lb_prev') {
				currentPage = Math.max(1, currentPage - 1);
			} else if (i.customId === 'activity_lb_next') {
				currentPage = Math.min(totalPages, currentPage + 1);
			} else if (i.customId === 'activity_lb_last') {
				currentPage = totalPages;
			}

			const { leaderboardContainer: newContainer } =
				await generateLeaderboardContainer(
					i,
					currentPage,
					allStats,
					totalUsers,
					type,
					periodLabel,
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
						allStats,
						totalUsers,
						type,
						periodLabel,
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
