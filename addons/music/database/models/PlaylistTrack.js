/**
 * @namespace: addons/music/database/models/PlaylistTrack.js
 * @type: Database Model
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { KythiaModel } = require('kythia-core');

class PlaylistTrack extends KythiaModel {
	static guarded = [];

	static get structure() {
		return {
			options: { timestamps: false },
		};
	}

	static associate(models) {
		this.belongsTo(models.Playlist, {
			foreignKey: 'playlistId',
			as: 'playlist',
		});

		this.setupParentTouch('playlistId', models.Playlist, 'updatedAt');
	}
}

module.exports = PlaylistTrack;
