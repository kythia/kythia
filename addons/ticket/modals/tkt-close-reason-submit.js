/**
 * @namespace: addons/ticket/modals/tkt-close-reason-submit.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { closeTicket } = require('../helpers');
const { MessageFlags } = require('discord.js');
const { BaseModal } = require('kythia-core');
class TktCloseReasonSubmitModal extends BaseModal {
	modal = {};
	async execute(interaction) {
		const container = this.container;
		const { t, helpers, logger } = container;
		const { simpleContainer } = helpers.discord;
		try {
			const reason = interaction.fields.getTextInputValue('reason');
			await closeTicket(interaction, container, reason);
		} catch (error) {
			logger.error(
				`Error submitting close w/ reason modal: ${error.message || error}`,
				{
					label: 'ticket',
				},
			);
			const descError = await t(
				interaction,
				'ticket.helpers.index.errors.close_failed',
			);
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({
					components: await simpleContainer(interaction, descError, {
						color: 'Red',
					}),
					flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
				});
			}
		}
	}
}
exports.default = TktCloseReasonSubmitModal;
