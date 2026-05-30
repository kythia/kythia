/**
 * @namespace: addons/embed-builder/register.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const editCommand = require('./commands/embed-builder/edit');

module.exports = {
	initialize(bot) {
		const summary = [];

		// Register the modal handler for /embed-builder edit (classic embed mode)
		// customId format: eb-edit|{embedId}  (first pipe-segment is the handler key)
		bot.registerModalHandler('eb-edit', (interaction, container) => {
			return editCommand.modal(interaction, container);
		});

		summary.push('   ╰┈➤ 🎨 Embed Builder loaded (modal handler registered)');

		return summary;
	},
};
