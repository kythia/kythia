/**
 * @namespace: addons/activity/commands/stats.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');
const { fn, Op, col } = require('sequelize');

const { BaseCommand } = require('kythia-core');

const leaderboardHelper = require('../helpers/leaderboard');

class StatsCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('stats')
			.setDescription(
				'Check your activity stats (total messages & voice time).',
			)
			.addUserOption((option) =>
				option
					.setName('user')
					.setDescription(
						'The user whose stats you want to see. Defaults to yourself.',
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
		const { t, models, kythiaConfig, helpers } = container;
		const { ActivityStat, ActivityLog } = models;
		const { simpleContainer } = helpers.discord;

		await interaction.deferReply();

		const targetUser = interaction.options.getUser('user') || interaction.user;
		const period = interaction.options.getString('period') || 'all';

		const guildId = interaction.guild.id;
		const userId = targetUser.id;

		const periodLabel = await t(
			interaction,
			`activity.commands.leaderboard.period.${period}`,
		);

		let totalMessages = 0;
		let totalVoiceTime = 0;

		if (period === 'all') {
			const stat = await ActivityStat.getCache({
				guildId,
				userId,
			});
			totalMessages = stat ? Number(BigInt(stat.totalMessages)) : 0;
			totalVoiceTime = stat ? Number(BigInt(stat.totalVoiceTime)) : 0;
		} else {
			const startDate = leaderboardHelper.getPeriodStart(period);
			const [row] = await ActivityLog.getAllCache({
				where: {
					guildId,
					userId,
					date: {
						[Op.gte]: startDate,
					},
				},
				attributes: [
					[fn('SUM', col('messages')), 'totalMessages'],
					[fn('SUM', col('voiceTime')), 'totalVoiceTime'],
				],
				raw: true,
			});
			totalMessages = row?.totalMessages ? Number(row.totalMessages) : 0;
			totalVoiceTime = row?.totalVoiceTime ? Number(row.totalVoiceTime) : 0;
		}

		const title = await t(interaction, 'activity.commands.stats.title', {
			periodLabel,
		});
		const desc = await t(interaction, 'activity.commands.stats.desc', {
			username: targetUser.username,
			messages: totalMessages.toLocaleString(),
			voiceTime: leaderboardHelper.formatDuration(totalVoiceTime),
		});

		const components = await simpleContainer(interaction, `${title}\n${desc}`, {
			color: kythiaConfig.bot.color,
		});

		await interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
			allowedMentions: {
				parse: [],
			},
		});
	}
}

exports.default = StatsCommand;
