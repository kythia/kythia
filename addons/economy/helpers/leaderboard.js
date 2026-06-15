const { toBigIntSafe } = require('./bigint');

const USERS_PER_PAGE = 10;

async function generateLeaderboardContainer(
	interaction,
	page,
	topUsers,
	totalUsers,
	navDisabled = false,
) {
	const { t, helpers } = interaction.client.container;
	const { createPaginationContainer } = helpers.discord;

	const totalPages = Math.max(1, Math.ceil(totalUsers / USERS_PER_PAGE));
	page = Math.max(1, Math.min(page, totalPages));

	const startIndex = (page - 1) * USERS_PER_PAGE;
	const pageUsers = topUsers.slice(startIndex, startIndex + USERS_PER_PAGE);

	// Build leaderboard text
	let leaderboardText = '';
	if (pageUsers.length === 0) {
		leaderboardText = await t(interaction, 'economy.leaderboard.empty');
	} else {
		const entries = await Promise.all(
			pageUsers.map(async (user, index) => {
				const rank = startIndex + index + 1;
				const totalWealth =
					toBigIntSafe(user.kythiaCoin) + toBigIntSafe(user.kythiaBank);
				const medal =
					rank === 1
						? '🥇'
						: rank === 2
							? '🥈'
							: rank === 3
								? '🥉'
								: `**${rank}.**`;

				// Fetch username from Discord
				let username;
				try {
					const discordUser = await interaction.client.users.fetch(user.userId);
					username = `${discordUser.username} (${user.userId})`;
				} catch (_error) {
					username = `Unknown User (${user.userId})`;
				}

				return await t(interaction, 'economy.leaderboard.entry', {
					medal,
					username,
					wealth: toBigIntSafe(totalWealth).toLocaleString(),
					coin: toBigIntSafe(user.kythiaCoin).toLocaleString(),
					bank: toBigIntSafe(user.kythiaBank).toLocaleString(),
				});
			}),
		);
		leaderboardText = entries.join('\n');
	}

	const [leaderboardContainer] = await createPaginationContainer(interaction, {
		page,
		totalPages,
		title: await t(interaction, 'economy.leaderboard.title', {
			page,
			totalPages,
		}),
		content: leaderboardText,
		footer: await t(interaction, 'economy.leaderboard.footer', {
			totalUsers,
		}),
		customIdPrefix: 'leaderboard',
		navDisabled,
	});

	return { leaderboardContainer, page, totalPages };
}

module.exports = {
	generateLeaderboardContainer,
};
