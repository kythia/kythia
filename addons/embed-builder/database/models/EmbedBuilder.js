/**
 * @namespace: addons/embed-builder/database/models/EmbedBuilder.js
 * @type: Database Model
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { KythiaModel } = require('kythia-core');

class EmbedBuilder extends KythiaModel {
	static cacheKeys = [['guildId', 'name']];
	static guarded = [];

	static get structure() {
		return {
			tableName: 'embed_builders',
			options: { timestamps: true },
		};
	}
}

module.exports = EmbedBuilder;
