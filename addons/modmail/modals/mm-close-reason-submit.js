/**
 * @namespace: addons/modmail/modals/mm-close-reason-submit.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { closeModmail } = require('../helpers');

module.exports = {
	execute: (interaction, container) => {
		const reason = interaction.fields.getTextInputValue('reason');
		return closeModmail(interaction, container, reason);
	},
};
