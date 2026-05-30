/**
 * @namespace: addons/api/register.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const initializeServer = require('./server');

module.exports = {
	async initialize(bot) {
		const summary = [];
		const server = await initializeServer(bot);
		if (server) {
			summary.push('   ╰┈➤ 🚀 Initializing API...');
		}

		return summary;
	},
};
