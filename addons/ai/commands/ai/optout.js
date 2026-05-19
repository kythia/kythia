/**
 * @namespace: addons/ai/commands/ai/optout.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 1.0.0-rc
 */

const { MessageFlags } = require('discord.js');

module.exports = {
	subcommand: true,
	slashCommand: (subcommand) =>
		subcommand
			.setName('optout')
			.setDescription(
				'Opt-out of all AI features and delete your stored AI memories.',
			),

	/**
	 * @param {import("discord.js").CommandInteraction} interaction
	 * @param {import("kythia-core/src/structures/Container")} container
	 */
	async execute(interaction, container) {
		const { logger, models, helpers, t } = container;
		const { KythiaUser, UserFact } = models;
		const { simpleContainer } = helpers.discord;

		const userId = interaction.user.id;

		await interaction.deferReply({ ephemeral: true });

		try {
			if (!KythiaUser) {
				const msg = await t(interaction, 'ai.ai.optout.database_error');
				const components = await simpleContainer(interaction, msg, {
					color: 'Red',
				});
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}

			// Find the current user record
			const userRecord = await KythiaUser.getCache({ userId });

			// Toggle the opt-out status (default to false if doesn't exist)
			const newOptOutStatus = !(userRecord?.isAiOptOut ?? false);

			// Update record for this user and cache automatically
			await KythiaUser.updateOrCreateCache(
				{ userId },
				{ isAiOptOut: newOptOutStatus },
			);

			if (newOptOutStatus) {
				// User opted out
				try {
					if (UserFact) {
						await UserFact.destroy({ where: { userId } });
					}
				} catch (e) {
					logger.warn(`[AI OptOut] Failed to clear facts: ${e.message}`, {
						label: 'ai',
					});
				}

				const msg = await t(interaction, 'ai.ai.optout.success');
				const components = await simpleContainer(interaction, msg, {
					color: 'Green',
				});
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			} else {
				// User opted back in
				const msg = await t(interaction, 'ai.ai.optout.revert');
				const components = await simpleContainer(interaction, msg, {
					color: 'Green',
				});
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}
		} catch (error) {
			logger.error(`[AI OptOut] Error: ${error.message}`, { label: 'ai' });
			const msg = await t(interaction, 'ai.ai.optout.error');
			const components = await simpleContainer(interaction, msg, {
				color: 'Red',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
	},
};
