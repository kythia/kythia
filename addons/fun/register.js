/**
 * @namespace: addons/fun/register.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { BaseRegister } = require('kythia-core');

class FunRegister extends BaseRegister {
	register() {
		const _bot = this.kythia;
		return [];
	}
}

exports.default = FunRegister;
