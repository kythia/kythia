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
		leaderboardText = await t(
			interaction,
			'invite.invite.command.leaderboard.empty',
		);
	} else {
		const entries = await Promise.all(
			pageUsers.map(async (row, index) => {
				const rank = startIndex + index + 1;
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
					const discordUser = await helpers.discord.getUserSafe(
						interaction.client,
						row.userId,
					);
					username = `${discordUser.username} (${row.userId})`;
				} catch (_error) {
					username = `Unknown User (${row.userId})`;
				}
				return await t(interaction, 'invite.invite.command.leaderboard.entry', {
					medal,
					username,
					invites: row.invites || 0,
				});
			}),
		);
		leaderboardText = entries.join('\n');
	}

	// Build container, insert navigation buttons inside
	const [leaderboardContainer] = await createPaginationContainer(interaction, {
		page,
		totalPages,
		title: await t(interaction, 'invite.invite.command.leaderboard.title', {
			page,
			totalPages,
		}),
		content: leaderboardText,
		footer: await t(interaction, 'invite.invite.command.leaderboard.footer', {
			totalUsers,
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
