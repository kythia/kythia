/**
 * @namespace: addons/activity/commands/stats.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');
const { Op, fn, col } = require('sequelize');

/**
 * Returns the start date string (YYYY-MM-DD) for a given period.
 * Returns null for 'all'.
 *
 * @param {string} period
 * @returns {string|null}
 */
const getPeriodStart = (period) => {
	const now = new Date();
	if (period === 'daily') return now.toISOString().slice(0, 10);
	if (period === 'weekly') {
		const d = new Date(now);
		d.setDate(d.getDate() - 6);
		return d.toISOString().slice(0, 10);
	}
	if (period === 'monthly') {
		const d = new Date(now);
		d.setDate(d.getDate() - 29);
		return d.toISOString().slice(0, 10);
	}
	return null;
};

/**
 * Formats a duration in seconds to a human-readable string (Xh Ym Zs).
 *
 * @param {bigint|number} totalSeconds
 * @returns {string}
 */
const formatDuration = (totalSeconds) => {
	const secs = Number(totalSeconds);
	if (secs <= 0) return '0s';

	const h = Math.floor(secs / 3600);
	const m = Math.floor((secs % 3600) / 60);
	const s = secs % 60;

	const parts = [];
	if (h > 0) parts.push(`${h}h`);
	if (m > 0) parts.push(`${m}m`);
	if (s > 0 || parts.length === 0) parts.push(`${s}s`);
	return parts.join(' ');
};

module.exports = {
	subcommand: true,
	slashCommand: (subcommand) =>
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
						{ name: '🕰️ All Time', value: 'all' },
						{ name: '📅 Today', value: 'daily' },
						{ name: '📆 This Week', value: 'weekly' },
						{ name: '🗓️ This Month', value: 'monthly' },
					),
			),

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { t, models, helpers, kythiaConfig } = container;
		const { simpleContainer } = helpers.discord;
		const { ActivityStat, ActivityLog } = models;

		await interaction.deferReply();

		const targetUser = interaction.options.getUser('user') || interaction.user;
		const guildId = interaction.guild.id;
		const userId = targetUser.id;
		const period = interaction.options.getString('period') || 'all';

		const periodLabel = await t(
			interaction,
			`activity.leaderboard.activity.leaderboard.period.${period}`,
		);

		let totalMessages = 0;
		let totalVoiceTime = 0;

		if (period === 'all') {
			const stat = await ActivityStat.getCache({ guildId, userId });
			totalMessages = stat ? Number(BigInt(stat.totalMessages)) : 0;
			totalVoiceTime = stat ? Number(BigInt(stat.totalVoiceTime)) : 0;
		} else {
			const startDate = getPeriodStart(period);
			const [row] = await ActivityLog.getAllCache({
				where: { guildId, userId, date: { [Op.gte]: startDate } },
				attributes: [
					[fn('SUM', col('messages')), 'totalMessages'],
					[fn('SUM', col('voiceTime')), 'totalVoiceTime'],
				],
				raw: true,
			});
			totalMessages = row?.totalMessages ? Number(row.totalMessages) : 0;
			totalVoiceTime = row?.totalVoiceTime ? Number(row.totalVoiceTime) : 0;
		}

		const title = `## ${await t(interaction, 'activity.stats.activity.stats.title')} — ${periodLabel}`;
		const desc = await t(interaction, 'activity.stats.activity.stats.desc', {
			username: targetUser.username,
			messages: totalMessages.toLocaleString(),
			voiceTime: formatDuration(totalVoiceTime),
		});

		const components = await simpleContainer(interaction, `${title}\n${desc}`, {
			color: kythiaConfig.bot.color,
		});

		await interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
			allowedMentions: { parse: [] },
		});
	},
};
