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

// Removed buildNavButtons in favor of core pagination helper

async function generateLeaderboardContainer(
	interaction,
	page,
	allStats,
	totalUsers,
	type,
	periodLabel,
	navDisabled = false,
) {
	const container = interaction.client.container;
	const { t, helpers } = container;
	const { createPaginationContainer } = helpers.discord;

	const totalPages = Math.max(1, Math.ceil(totalUsers / USERS_PER_PAGE));
	page = Math.max(1, Math.min(page, totalPages));

	const startIndex = (page - 1) * USERS_PER_PAGE;
	const pageStats = allStats.slice(startIndex, startIndex + USERS_PER_PAGE);

	let leaderboardText = '';
	if (pageStats.length === 0) {
		leaderboardText = await t(
			interaction,
			'activity.helpers.leaderboard.empty',
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

				return t(interaction, 'activity.helpers.leaderboard.entry', {
					medal,
					userId: stat.userId,
					value,
				});
			}),
		);
		leaderboardText = entries.join('\n');
	}

	const titleKey =
		type === 'voice'
			? 'activity.helpers.leaderboard.title.voice'
			: 'activity.helpers.leaderboard.title.messages';

	const [leaderboardContainer] = await createPaginationContainer(interaction, {
		page,
		totalPages,
		title: await t(interaction, titleKey, { periodLabel }),
		content: leaderboardText,
		footer: await t(interaction, 'activity.helpers.leaderboard.footer', {
			server: interaction.guild.name,
		}),
		customIdPrefix: 'activity_lb',
		navDisabled,
	});

	return { leaderboardContainer, page, totalPages };
}

module.exports = {
	getPeriodStart,
	formatDuration,
	generateLeaderboardContainer,
	USERS_PER_PAGE,
	MAX_USERS,
};
