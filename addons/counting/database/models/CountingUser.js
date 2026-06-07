/**
 * @namespace: addons/counting/database/models/CountingUser.js
 * @type: Database Model
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { KythiaModel } = require('kythia-core');

class CountingUser extends KythiaModel {
	static guarded = [];

	static primaryKey = ['guildId', 'userId'];
}

module.exports = CountingUser;
