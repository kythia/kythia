/**
 * @namespace: addons/streak/commands/leaderboard.js
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

const USERS_PER_PAGE = 10;
const MAX_USERS = 100;

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
			.setLabel(await t(interaction, 'streak.streak.leaderboard.nav.first'))
			.setStyle(ButtonStyle.Secondary)
			.setDisabled(allDisabled || page <= 1),
		new ButtonBuilder()
			.setCustomId('leaderboard_prev')
			.setLabel(await t(interaction, 'streak.streak.leaderboard.nav.prev'))
			.setStyle(ButtonStyle.Primary)
			.setDisabled(allDisabled || page <= 1),
		new ButtonBuilder()
			.setCustomId('leaderboard_next')
			.setLabel(await t(interaction, 'streak.streak.leaderboard.nav.next'))
			.setStyle(ButtonStyle.Primary)
			.setDisabled(allDisabled || page >= totalPages),
		new ButtonBuilder()
			.setCustomId('leaderboard_last')
			.setLabel(await t(interaction, 'streak.streak.leaderboard.nav.last'))
			.setStyle(ButtonStyle.Secondary)
			.setDisabled(allDisabled || page >= totalPages),
	];
}

async function generateLeaderboardContainer(
	interaction,
	page,
	topStreaks,
	totalUsers,
	streakEmoji,
	navDisabled = false,
) {
	const { t, kythiaConfig, helpers } = interaction.client.container;
	const { convertColor } = helpers.color;
	const { chunkTextDisplay } = helpers.discord;

	const totalPages = Math.max(1, Math.ceil(totalUsers / USERS_PER_PAGE));
	page = Math.max(1, Math.min(page, totalPages));

	const startIndex = (page - 1) * USERS_PER_PAGE;
	const pageStreaks = topStreaks.slice(startIndex, startIndex + USERS_PER_PAGE);

	let leaderboardText = '';
	if (pageStreaks.length === 0) {
		leaderboardText = await t(interaction, 'streak.streak.leaderboard.empty');
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

				return await t(interaction, 'streak.streak.leaderboard.entry', {
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
				`## ${await t(interaction, 'streak.streak.leaderboard.title')}`,
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
				await t(interaction, 'streak.streak.leaderboard.footer', {
					server: interaction.guild.name,
				}),
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
			.setDescription('🥇 Streak leaderboard in this server'),

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { t, models } = container;
		const { ServerSetting, Streak } = models;

		const guildId = interaction.guild.id;

		const serverSetting = await ServerSetting.getCache({ guildId });
		const streakEmoji = serverSetting.streakEmoji || '🔥';

		await interaction.deferReply();

		const allStreaks = await Streak.getAllCache({
			where: { guildId },
			order: [
				['currentStreak', 'DESC'],
				['highestStreak', 'DESC'],
			],
			limit: MAX_USERS,
			cacheTags: [`Streak:leaderboard`],
		});

		const totalUsers = allStreaks.length;
		let currentPage = 1;

		if (totalUsers === 0) {
			const { leaderboardContainer } = await generateLeaderboardContainer(
				interaction,
				1,
				[],
				0,
				streakEmoji,
				/*navDisabled*/ true,
			);
			return interaction.editReply({
				components: [leaderboardContainer],
				flags: MessageFlags.IsComponentsV2,
				allowedMentions: {
					parse: [],
				},
			});
		}

		const { leaderboardContainer, totalPages } =
			await generateLeaderboardContainer(
				interaction,
				currentPage,
				allStreaks,
				totalUsers,
				streakEmoji,
			);

		const message = await interaction.editReply({
			components: [leaderboardContainer],
			flags: MessageFlags.IsComponentsV2,
			fetchReply: true,
			allowedMentions: {
				parse: [],
			},
		});

		if (totalPages <= 1) return;

		const collector = message.createMessageComponentCollector({ time: 300000 });

		collector.on('collect', async (i) => {
			if (i.user.id !== interaction.user.id) {
				return i.reply({
					content: await t(i, 'streak.streak.leaderboard.not.your.interaction'),
					flags: MessageFlags.Ephemeral,
				});
			}

			if (i.customId === 'leaderboard_first') {
				currentPage = 1;
			} else if (i.customId === 'leaderboard_prev') {
				currentPage = Math.max(1, currentPage - 1);
			} else if (i.customId === 'leaderboard_next') {
				currentPage = Math.min(totalPages, currentPage + 1);
			} else if (i.customId === 'leaderboard_last') {
				currentPage = totalPages;
			}

			const { leaderboardContainer: newLeaderboardContainer } =
				await generateLeaderboardContainer(
					i,
					currentPage,
					allStreaks,
					totalUsers,
					streakEmoji,
				);

			await i.update({
				components: [newLeaderboardContainer],
				flags: MessageFlags.IsComponentsV2,
				allowedMentions: {
					parse: [],
				},
			});
		});

		collector.on('end', async () => {
			try {
				const { leaderboardContainer: finalContainer } =
					await generateLeaderboardContainer(
						interaction,
						currentPage,
						allStreaks,
						totalUsers,
						streakEmoji,
						true,
					);

				await message.edit({
					components: [finalContainer],
					flags: MessageFlags.IsComponentsV2,
					allowedMentions: {
						parse: [],
					},
				});
			} catch (_e) {}
		});
	},
};
