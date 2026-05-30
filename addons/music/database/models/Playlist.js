/**
 * @namespace: addons/music/database/models/Playlist.js
 * @type: Database Model
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { KythiaModel } = require('kythia-core');

class Playlist extends KythiaModel {
	static guarded = [];

	static get structure() {
		return {
			options: { timestamps: true },
		};
	}

	static associate(models) {
		this.hasMany(models.PlaylistTrack, {
			foreignKey: 'playlistId',
			as: 'tracks',
		});
	}
}

module.exports = Playlist;
