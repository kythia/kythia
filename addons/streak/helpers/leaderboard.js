/**
 * @namespace: addons/streak/helpers/leaderboard.js
 * @type: Helper Script
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const USERS_PER_PAGE = 10;
async function generateLeaderboardContainer(
	interaction,
	page,
	topStreaks,
	totalUsers,
	streakEmoji,
	navDisabled = false,
) {
	const { t, helpers } = interaction.client.container;
	const { createPaginationContainer } = helpers.discord;
	const totalPages = Math.max(1, Math.ceil(totalUsers / USERS_PER_PAGE));
	page = Math.max(1, Math.min(page, totalPages));
	const startIndex = (page - 1) * USERS_PER_PAGE;
	const pageStreaks = topStreaks.slice(startIndex, startIndex + USERS_PER_PAGE);
	let leaderboardText = '';
	if (pageStreaks.length === 0) {
		leaderboardText = await t(
			interaction,
			'streak.helpers.leaderboard.streak.empty',
		);
	} else {
		const entries = await Promise.all(
			pageStreaks.map(async (streak, index) => {
				const rank = startIndex + index + 1;
				const medal =
					rank === 1
						? '🥇'
						: rank === 2
							? '🥈'
							: rank === 3
								? '🥉'
								: `**${rank}.**`;
				const username = `<@${streak.userId}>`;
				return await t(interaction, 'streak.helpers.leaderboard.streak.entry', {
					medal,
					username,
					emoji: streakEmoji,
					current: streak.currentStreak,
					highest: streak.highestStreak,
					freeze: streak.streakFreezes ?? 0,
				});
			}),
		);
		leaderboardText = entries.join('\n');
	}
	const [leaderboardContainer] = await createPaginationContainer(interaction, {
		page,
		totalPages,
		title: await t(interaction, 'streak.helpers.leaderboard.streak.title_md'),
		content: leaderboardText,
		footer: await t(interaction, 'streak.helpers.leaderboard.streak.footer', {
			server: interaction.guild.name,
		}),
		customIdPrefix: 'leaderboard',
		navDisabled,
	});
	return {
		leaderboardContainer,
		page,
		totalPages,
	};
}
module.exports = {
	generateLeaderboardContainer,
};
