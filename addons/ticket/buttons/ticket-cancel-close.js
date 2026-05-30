/**
 * @namespace: addons/ticket/buttons/ticket-cancel-close.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
module.exports = {
	execute: async (interaction) => {
		await interaction.message.delete().catch(() => {});
	},
};
