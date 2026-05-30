/**
 * @namespace: addons/invite/database/models/Invite.js
 * @type: Database Model
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { KythiaModel } = require('kythia-core');

class Invite extends KythiaModel {
	static cacheKeys = [['userId', 'guildId']];
	static guarded = [];

	static get structure() {
		return {
			options: { timestamps: false },
		};
	}
}

module.exports = Invite;
