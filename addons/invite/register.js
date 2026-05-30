/**
 * @namespace: addons/invite/register.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { refreshGuildInvites } = require('./helpers');

const initialize = (bot) => {
	const summary = [];
	bot.addClientReadyHook(async ({ client }) => {
		for (const [, guild] of client.guilds.cache) {
			await refreshGuildInvites(guild);
		}
	});
	summary.push('  ╰┈➤ ReadyHook: warm invite caches');
	return summary;
};

module.exports = {
	initialize,
};
