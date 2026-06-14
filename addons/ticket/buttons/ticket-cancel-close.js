/**
 * @namespace: addons/ticket/buttons/ticket-cancel-close.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { BaseButton } = require('kythia-core');

class TicketCancelCloseButton extends BaseButton {
	button = {};

	async execute(interaction) {
		const _container = this.container;

		await interaction.message.delete().catch(() => {});
	}
}

module.exports = TicketCancelCloseButton;
