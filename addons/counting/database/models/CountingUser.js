/**
 * @namespace: addons/_counting/database/models/CountingUser.js
 * @type: Database Model
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 1.0.0-rc
 */

const { KythiaModel } = require('kythia-core');

class CountingUser extends KythiaModel {
	static guarded = [];

	static primaryKey = ['guildId', 'userId'];
}

module.exports = CountingUser;
