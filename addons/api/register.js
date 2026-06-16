/**
 * @namespace: addons/api/register.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { BaseRegister } = require('kythia-core');

const initializeServer = require('./server');

class ApiRegister extends BaseRegister {
	async register() {
		const bot = this.kythia;
		const summary = [];
		const server = await initializeServer(bot);
		if (server) {
			summary.push('   ╰┈➤ 🚀 Initializing API...');
		}

		return summary;
	}
}

exports.default = ApiRegister;
