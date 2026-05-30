/**
 * @namespace: addons/checklist/database/models/Checklist.js
 * @type: Database Model
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { KythiaModel } = require('kythia-core');

class Checklist extends KythiaModel {
	static cacheKeys = [['guildId', 'userId']];
	static guarded = [];
}

module.exports = Checklist;
