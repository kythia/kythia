/**
 * @namespace: addons/core/commands/utils/kyth/vote/info.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = {
	slashCommand: (subcommand) =>
		subcommand
			.setName('info')
			.setDescription('View vote information for a user')
			.addUserOption((option) =>
				option
					.setName('user')
					.setDescription('The user to view vote info for')
					.setRequired(true),
			),

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { t, models, helpers } = container;
		const { simpleContainer } = helpers.discord;
		const { KythiaVoter, KythiaUser } = models;

		const targetUser = interaction.options.getUser('user', true);

		await interaction.deferReply();

		try {
			const userRecord = await KythiaUser.getCache({ userId: targetUser.id });
			const voterRecord = await KythiaVoter.getCache({ userId: targetUser.id });

			const points = userRecord?.votePoints || 0;
			const lastVoted = voterRecord?.votedAt
				? `<t:${Math.floor(voterRecord.votedAt.getTime() / 1000)}:R>`
				: 'Never';
			const expiresAt = userRecord?.voteExpiresAt
				? `<t:${Math.floor(userRecord.voteExpiresAt.getTime() / 1000)}:R>`
				: 'N/A';
			const hasVotedStatus = userRecord?.isVoted ? '✅ Yes' : '❌ No';

			const components = await simpleContainer(
				interaction,
				await t(interaction, 'core.utils.kyth.vote.info.display', {
					user: targetUser.toString(),
					points,
					lastVoted,
					expiresAt,
					hasVotedStatus,
				}),
				{ color: container.kythiaConfig.bot.color },
			);

			await interaction.editReply({ components });
		} catch (error) {
			container.logger.error(
				`[kythia-vote] Error: ${error.message || String(error)}`,
				{ label: 'kythia-vote' },
			);
			const components = await simpleContainer(
				interaction,
				await t(interaction, 'common.error'),
				{ mode: 'error' },
			);
			await interaction.editReply({ components });
		}
	},
};
