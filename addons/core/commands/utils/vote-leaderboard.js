/**
 * @namespace: addons/core/commands/utils/vote-leaderboard.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 1.0.0-rc
 */

const {
	SlashCommandBuilder,
	ContainerBuilder,
	TextDisplayBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	MessageFlags,
	SeparatorBuilder,
	SeparatorSpacingSize,
} = require('discord.js');
const { Op } = require('sequelize');

module.exports = {
	slashCommand: new SlashCommandBuilder()
		.setName('vote-leaderboard')
		.setDescription('🏆 View top voters for Kythia!'),

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { t, kythiaConfig, helpers, models } = container;
		const { KythiaUser } = models;
		const { convertColor } = helpers.color;

		// We assume caching tags will be handled properly if we add a cache tag for user updates,
		// but since we update KythiaUser for vote points, we might just query the DB.
		await interaction.deferReply();

		try {
			// Find top users who have votePoints > 0
			const leaderboard = await KythiaUser.getAllCache({
				where: {
					votePoints: { [Op.gt]: 0 },
				},
				order: [['votePoints', 'DESC']],
				limit: 10,
				// Optionally add cacheTags if core model invalidates them, e.g. cacheTags: ['KythiaUser:voteleaderboard']
			});

			// Resolve User Mentions/Tags and convert into lines
			const entries = await Promise.all(
				leaderboard.map(async (lbUser, index) => {
					return await t(interaction, 'core.utils.vote.leaderboard.entry', {
						index: index + 1,
						user: `<@${lbUser.userId}>`,
						votes: lbUser.votePoints,
					});
				}),
			);

			let leaderboardText = entries.join('\n');
			if (!leaderboardText) {
				leaderboardText = await t(
					interaction,
					'core.utils.vote.leaderboard.empty',
				);
			}

			const accentColor = convertColor(kythiaConfig.bot.color, {
				from: 'hex',
				to: 'decimal',
			});

			const mainContainer = new ContainerBuilder()
				.setAccentColor(accentColor)
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(
						`## 🏆 ${await t(interaction, 'core.utils.vote.leaderboard.title')}`,
					),
				)
				.addSeparatorComponents(
					new SeparatorBuilder()
						.setSpacing(SeparatorSpacingSize.Small)
						.setDivider(true),
				)
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(leaderboardText),
				)
				.addSeparatorComponents(
					new SeparatorBuilder()
						.setSpacing(SeparatorSpacingSize.Small)
						.setDivider(true),
				)
				.addActionRowComponents(
					new ActionRowBuilder().addComponents(
						new ButtonBuilder()
							.setLabel(
								await t(interaction, 'core.utils.vote.button.topgg', {
									username: interaction.client.user.username,
								}),
							)
							.setStyle(ButtonStyle.Link)
							.setURL(`https://top.gg/bot/${kythiaConfig.bot.clientId}/vote`),
					),
				);

			await interaction.editReply({
				components: [mainContainer],
				flags: MessageFlags.IsComponentsV2,
			});
		} catch (error) {
			container.logger.error(
				`[vote-leaderboard] Error: ${error.message || String(error)}`,
				{ label: 'vote-leaderboard' },
			);
			const { simpleContainer } = helpers.discord;
			const components = await simpleContainer(
				interaction,
				await t(interaction, 'common.error'),
				{ mode: 'error' },
			);
			await interaction.editReply({ components });
		}
	},
};
