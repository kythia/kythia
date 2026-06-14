/**
 * @namespace: addons/ticket/buttons/ticket-confirm-close.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { closeTicket } = require('../helpers');

const { BaseButton } = require('kythia-core');

class TicketConfirmCloseButton extends BaseButton {
	button = {};

	async execute(interaction) {
		const container = this.container;

		await closeTicket(interaction, container);
	}
}

exports.default = TicketConfirmCloseButton;
