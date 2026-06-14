/**
 * @namespace: addons/modmail/modals/mm-close-reason-submit.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { closeModmail } = require('../helpers');

const { BaseModal } = require('kythia-core');

class MmCloseReasonSubmitModal extends BaseModal {
	modal = {};

	execute(interaction) {
		const container = this.container;

		const reason = interaction.fields.getTextInputValue('reason');
		return closeModmail(interaction, container, reason);
	}
}

module.exports = MmCloseReasonSubmitModal;
