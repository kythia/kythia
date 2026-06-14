/**
 * @namespace: addons/modmail/buttons/mm-confirm-close.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { closeModmail } = require('../helpers');

const { BaseButton } = require('kythia-core');

class MmConfirmCloseButton extends BaseButton {
	button = {};

	execute(interaction) {
		const container = this.container;

		const rawReason = interaction.customId.split(':').slice(1).join(':');
		const reason = rawReason ? decodeURIComponent(rawReason) : null;
		return closeModmail(interaction, container, reason);
	}
}

module.exports = MmConfirmCloseButton;
