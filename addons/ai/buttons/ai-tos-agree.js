/**
 * @namespace: addons/ai/buttons/ai_tos_agree.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');
const { BaseButton } = require('kythia-core');

class AiTosAgreeButton extends BaseButton {
	async execute(interaction) {
		const container = this.container;
		const { t, models, helpers, logger } = container;
		const { KythiaUser } = models;
		const { simpleContainer } = helpers.discord;

		const userId = interaction.user.id;

		try {
			await interaction.deferUpdate();

			if (!KythiaUser) {
				logger.error(`[AI TOS] KythiaUser model not found`, { label: 'ai' });
				return;
			}

			// User agreed to TOS
			await KythiaUser.updateOrCreateCache(
				{ userId },
				{ hasAgreedToAiTos: true },
			);

			const msg = await t(interaction, 'ai.events.messageCreate.tos.agreed', {
				username: interaction.client.user.username,
			});
			const components = await simpleContainer(interaction, msg, {
				color: 'Green',
			});

			await interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		} catch (error) {
			logger.error(`[AI TOS] Error handling agree button: ${error.message}`, {
				label: 'ai',
			});
		}
	}
}

exports.default = AiTosAgreeButton;
