const {
	ActionRowBuilder,
	ContainerBuilder,
	SeparatorBuilder,
	ButtonBuilder,
	ButtonStyle,
	SeparatorSpacingSize,
} = require('discord.js');

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
	getPeriodStart,
	formatDuration,
	generateLeaderboardContainer,
	USERS_PER_PAGE,
	MAX_USERS,
};
