/**
 * @namespace: addons/ai/commands/ai/optout.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');

const { BaseCommand } = require('kythia-core');

class OptoutCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('optout')
			.setDescription(
				'Opt-out of all AI features and delete your stored AI memories.',
			);

	async execute(interaction) {
		const container = this.container;
		const { t, models, helpers, logger } = container;
		const { KythiaUser, UserFact } = models;
		const { simpleContainer } = helpers.discord;

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const userId = interaction.user.id;

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

			const userRecord = await KythiaUser.getCache({
				userId,
			});
			const newOptOutStatus = !(userRecord?.isAiOptOut ?? false);

			await KythiaUser.updateOrCreateCache(
				{ userId },
				{ isAiOptOut: newOptOutStatus },
			);

			if (newOptOutStatus) {
				try {
					if (UserFact) {
						await UserFact.destroy({
							where: {
								userId,
							},
						});
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
	}
}

exports.default = OptoutCommand;
