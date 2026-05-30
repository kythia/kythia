/**
 * @namespace: addons/core/commands/utils/kyth/vote/remove.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = {
	slashCommand: (subcommand) =>
		subcommand
			.setName('remove')
			.setDescription('Remove vote points from a user')
			.addUserOption((option) =>
				option
					.setName('user')
					.setDescription('The user to remove points from')
					.setRequired(true),
			)
			.addIntegerOption((option) =>
				option
					.setName('amount')
					.setDescription('The number of points to remove')
					.setRequired(true)
					.setMinValue(1),
			),

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { t, models, helpers } = container;
		const { simpleContainer } = helpers.discord;
		const { KythiaUser } = models;

		const targetUser = interaction.options.getUser('user', true);
		const amount = interaction.options.getInteger('amount', true);

		await interaction.deferReply();

		try {
			const userRecord = await KythiaUser.getCache({ userId: targetUser.id });

			if (!userRecord || (userRecord.votePoints || 0) < amount) {
				const components = await simpleContainer(
					interaction,
					await t(interaction, 'core.utils.kyth.vote.remove.insufficient', {
						user: targetUser.toString(),
					}),
					{ mode: 'warn' },
				);
				return await interaction.editReply({ components });
			}

			userRecord.votePoints -= amount;
			await userRecord.save();

			const components = await simpleContainer(
				interaction,
				await t(interaction, 'core.utils.kyth.vote.remove.success', {
					user: targetUser.toString(),
					amount,
					total: userRecord.votePoints,
				}),
				{ mode: 'success' },
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
