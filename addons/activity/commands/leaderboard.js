/**
 * @namespace: addons/activity/commands/leaderboard.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	SeparatorSpacingSize,
	ActionRowBuilder,
	ContainerBuilder,
	SeparatorBuilder,
	ButtonBuilder,
	MessageFlags,
	ButtonStyle,
} = require('discord.js');
const { Op, fn, col, literal } = require('sequelize');

const USERS_PER_PAGE = 10;
const MAX_USERS = 100;

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
 * Formats a duration in seconds to a human-readable string (e.g. 2h 30m 15s).
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

async function buildNavButtons(
	interaction,
	page,
	totalPages,
	allDisabled = false,
) {
	const { t } = interaction.client.container;
	return [
		new ButtonBuilder()
			.setCustomId('activity_lb_first')
			.setLabel(
				await t(
					interaction,
					'activity.leaderboard.activity.leaderboard.nav.first',
				),
			)
			.setStyle(ButtonStyle.Secondary)
			.setDisabled(allDisabled || page <= 1),
		new ButtonBuilder()
			.setCustomId('activity_lb_prev')
			.setLabel(
				await t(
					interaction,
					'activity.leaderboard.activity.leaderboard.nav.prev',
				),
			)
			.setStyle(ButtonStyle.Primary)
			.setDisabled(allDisabled || page <= 1),
		new ButtonBuilder()
			.setCustomId('activity_lb_next')
			.setLabel(
				await t(
					interaction,
					'activity.leaderboard.activity.leaderboard.nav.next',
				),
			)
			.setStyle(ButtonStyle.Primary)
			.setDisabled(allDisabled || page >= totalPages),
		new ButtonBuilder()
			.setCustomId('activity_lb_last')
			.setLabel(
				await t(
					interaction,
					'activity.leaderboard.activity.leaderboard.nav.last',
				),
			)
			.setStyle(ButtonStyle.Secondary)
			.setDisabled(allDisabled || page >= totalPages),
	];
}

async function generateLeaderboardContainer(
	interaction,
	page,
	allStats,
	totalUsers,
	type,
	periodLabel,
	navDisabled = false,
) {
	const { t, kythiaConfig, helpers } = interaction.client.container;
	const { convertColor } = helpers.color;
	const { chunkTextDisplay } = helpers.discord;

	const totalPages = Math.max(1, Math.ceil(totalUsers / USERS_PER_PAGE));
	page = Math.max(1, Math.min(page, totalPages));

	const startIndex = (page - 1) * USERS_PER_PAGE;
	const pageStats = allStats.slice(startIndex, startIndex + USERS_PER_PAGE);

	let leaderboardText = '';
	if (pageStats.length === 0) {
		leaderboardText = await t(
			interaction,
			'activity.leaderboard.activity.leaderboard.empty',
		);
	} else {
		const entries = await Promise.all(
			pageStats.map((stat, index) => {
				const rank = startIndex + index + 1;
				const medal =
					rank === 1
						? '🥇'
						: rank === 2
							? '🥈'
							: rank === 3
								? '🥉'
								: `**${rank}.**`;

				const value =
					type === 'voice'
						? formatDuration(stat.totalVoiceTime)
						: Number(BigInt(stat.totalMessages)).toLocaleString();

				return t(
					interaction,
					'activity.leaderboard.activity.leaderboard.entry',
					{
						medal,
						userId: stat.userId,
						value,
					},
				);
			}),
		);
		leaderboardText = entries.join('\n');
	}

	const titleKey =
		type === 'voice'
			? 'activity.leaderboard.activity.leaderboard.title.voice'
			: 'activity.leaderboard.activity.leaderboard.title.messages';

	const navButtons = await buildNavButtons(
		interaction,
		page,
		totalPages,
		navDisabled,
	);

	const leaderboardContainer = new ContainerBuilder()
		.setAccentColor(
			convertColor(kythiaConfig.bot.color, { from: 'hex', to: 'decimal' }),
		)
		.addTextDisplayComponents(
			...chunkTextDisplay(
				`## ${await t(interaction, titleKey)} — ${periodLabel}`,
			),
		)
		.addSeparatorComponents(
			new SeparatorBuilder()
				.setSpacing(SeparatorSpacingSize.Small)
				.setDivider(true),
		)
		.addTextDisplayComponents(...chunkTextDisplay(leaderboardText))
		.addSeparatorComponents(
			new SeparatorBuilder()
				.setSpacing(SeparatorSpacingSize.Small)
				.setDivider(true),
		)
		.addTextDisplayComponents(
			...chunkTextDisplay(
				await t(
					interaction,
					'activity.leaderboard.activity.leaderboard.footer',
					{
						server: interaction.guild.name,
					},
				),
			),
		)
		.addActionRowComponents(
			new ActionRowBuilder().addComponents(...navButtons),
		);

	return { leaderboardContainer, page, totalPages };
}

module.exports = {
	subcommand: true,
	slashCommand: (subcommand) =>
		subcommand
			.setName('leaderboard')
			.setDescription('📊 Activity leaderboard for this server.')
			.addStringOption((option) =>
				option
					.setName('type')
					.setDescription('Sort by messages or voice time.')
					.setRequired(false)
					.addChoices(
						{ name: '📨 Messages', value: 'messages' },
						{ name: '🎙️ Voice Time', value: 'voice' },
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
		const { t, models } = container;
		const { ActivityStat, ActivityLog } = models;

		const guildId = interaction.guild.id;
		const type = interaction.options.getString('type') || 'messages';
		const period = interaction.options.getString('period') || 'all';
		const orderColumn = type === 'voice' ? 'totalVoiceTime' : 'totalMessages';

		const periodLabel = await t(
			interaction,
			`activity.leaderboard.activity.leaderboard.period.${period}`,
		);

		await interaction.deferReply();

		let allStats;

		if (period === 'all') {
			allStats = await ActivityStat.getAllCache({
				where: { guildId },
				order: [[orderColumn, 'DESC']],
				limit: MAX_USERS,
				cacheTags: [`ActivityStat:leaderboard:${type}:${guildId}`],
			});
		} else {
			const startDate = getPeriodStart(period);
			const logColumn = type === 'voice' ? 'voiceTime' : 'messages';

			allStats = await ActivityLog.getAllCache({
				where: { guildId, date: { [Op.gte]: startDate } },
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
				/*navDisabled*/ true,
			);
			return interaction.editReply({
				components: [leaderboardContainer],
				flags: MessageFlags.IsComponentsV2,
				allowedMentions: { parse: [] },
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
			allowedMentions: { parse: [] },
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
				allowedMentions: { parse: [] },
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
					allowedMentions: { parse: [] },
				});
			} catch (_e) {}
		});
	},
};
