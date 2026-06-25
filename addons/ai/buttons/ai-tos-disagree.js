/**
 * @namespace: addons/ai/buttons/ai_tos_disagree.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');
const { BaseButton } = require('kythia-core');

class AiTosDisagreeButton extends BaseButton {
	async execute(interaction) {
		const container = this.container;
		const { t, models, helpers, logger } = container;
		const { KythiaUser, UserFact } = models;
		const { simpleContainer } = helpers.discord;

		const userId = interaction.user.id;

		try {
			await interaction.deferUpdate();

			if (!KythiaUser) {
				logger.error(`[AI TOS] KythiaUser model not found`, { label: 'ai' });
				return;
			}

			// User disagreed to TOS
			await KythiaUser.updateOrCreateCache(
				{ userId },
				{ hasAgreedToAiTos: false, isAiOptOut: true },
			);

			// Delete any existing facts (similar to optout)
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

			const msg = await t(interaction, 'ai.events.messageCreate.tos.disagreed');
			const components = await simpleContainer(interaction, msg, {
				color: 'Red',
			});

			await interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		} catch (error) {
			logger.error(
				`[AI TOS] Error handling disagree button: ${error.message}`,
				{
					label: 'ai',
				},
			);
		}
	}
}

exports.default = AiTosDisagreeButton;
