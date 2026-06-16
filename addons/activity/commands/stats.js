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
		const { createContainer } = helpers.discord;

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

		// QuickChart config for the last 30 days
		const thirtyDaysAgo = new Date();
		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
		const startDateStr = thirtyDaysAgo.toISOString().split('T')[0];

		const logs = await ActivityLog.getAllCache({
			where: {
				guildId,
				userId,
				date: {
					[Op.gte]: startDateStr,
				},
			},
			attributes: ['date', 'messages'],
			order: [['date', 'ASC']],
			raw: true,
		});

		const labels = [];
		const dataPoints = [];
		const activityMap = new Map();
		for (const log of logs) {
			activityMap.set(log.date, Number(log.messages));
		}

		for (let i = 29; i >= 0; i--) {
			const d = new Date();
			d.setDate(d.getDate() - i);
			const dStr = d.toISOString().split('T')[0];
			const shortDate = dStr.slice(5).replace('-', '/'); // MM/DD
			labels.push(shortDate);
			dataPoints.push(activityMap.get(dStr) || 0);
		}

		const primaryColor = kythiaConfig.bot.color?.startsWith('#')
			? kythiaConfig.bot.color
			: `#${kythiaConfig.bot.color || '5c5cff'}`;

		const chartConfig = {
			type: 'line',
			data: {
				labels: labels,
				datasets: [
					{
						label: 'Messages',
						data: dataPoints,
						borderColor: primaryColor,
						backgroundColor: `${primaryColor}1A`, // 10% opacity
						borderWidth: 2,
						pointRadius: 0,
						fill: true,
						tension: 0.4,
					},
				],
			},
			options: {
				legend: { display: false },
				scales: {
					xAxes: [
						{
							gridLines: { display: false },
							ticks: { fontColor: '#888', maxTicksLimit: 6 },
						},
					],
					yAxes: [
						{
							gridLines: { color: 'rgba(255,255,255,0.05)' },
							ticks: { fontColor: '#888', beginAtZero: true, maxTicksLimit: 5 },
						},
					],
				},
				layout: {
					padding: { left: 10, right: 10, top: 10, bottom: 10 },
				},
			},
		};

		const encodedConfig = encodeURIComponent(JSON.stringify(chartConfig));
		const chartUrl = `https://quickchart.io/chart?w=600&h=300&bkg=1A1B1E&c=${encodedConfig}`;

		const components = await createContainer(interaction, {
			title: title,
			description: desc,
			media: [chartUrl],
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
