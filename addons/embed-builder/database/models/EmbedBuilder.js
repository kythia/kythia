/**
 * @namespace: addons/embed-builder/database/models/EmbedBuilder.js
 * @type: Database Model
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 1.0.0-rc
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
