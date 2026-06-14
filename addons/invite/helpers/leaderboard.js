const {
	ActionRowBuilder,
	ContainerBuilder,
	SeparatorBuilder,
	ButtonBuilder,
	ButtonStyle,
	SeparatorSpacingSize,
} = require('discord.js');

const USERS_PER_PAGE = 10;

async function buildNavButtons(
	interaction,
	page,
	totalPages,
	allDisabled = false,
) {
	const { t } = interaction.client.container;
	return [
		new ButtonBuilder()
			.setCustomId('leaderboard_first')
			.setLabel(await t(interaction, 'economy.leaderboard.nav.first'))
			.setStyle(ButtonStyle.Secondary)
			.setDisabled(allDisabled || page <= 1),
		new ButtonBuilder()
			.setCustomId('leaderboard_prev')
			.setLabel(await t(interaction, 'economy.leaderboard.nav.prev'))
			.setStyle(ButtonStyle.Primary)
			.setDisabled(allDisabled || page <= 1),
		new ButtonBuilder()
			.setCustomId('leaderboard_next')
			.setLabel(await t(interaction, 'economy.leaderboard.nav.next'))
			.setStyle(ButtonStyle.Primary)
			.setDisabled(allDisabled || page >= totalPages),
		new ButtonBuilder()
			.setCustomId('leaderboard_last')
			.setLabel(await t(interaction, 'economy.leaderboard.nav.last'))
			.setStyle(ButtonStyle.Secondary)
			.setDisabled(allDisabled || page >= totalPages),
	];
}

async function generateLeaderboardContainer(
	interaction,
	page,
	topUsers,
	totalUsers,
	navDisabled = false,
) {
	const { t, kythiaConfig, helpers } = interaction.client.container;
	const { convertColor } = helpers.color;
	const { chunkTextDisplay } = helpers.discord;

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
					const discordUser = await interaction.client.users.fetch(row.userId);
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
				await t(interaction, 'invite.invite.command.leaderboard.title', {
					page,
					totalPages,
				}),
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
				await t(interaction, 'invite.invite.command.leaderboard.footer', {
					totalUsers,
				}),
			),
		)
		.addActionRowComponents(
			new ActionRowBuilder().addComponents(...navButtons),
		);

	return { leaderboardContainer, page, totalPages };
}

module.exports = {
	buildNavButtons,
	generateLeaderboardContainer,
};
