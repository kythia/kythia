/**
 * @namespace: addons/music/database/migrations/20251124_000023_create_playlist_tracks_table.js
 * @type: Database Migration
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = {
	async up(queryInterface, DataTypes) {
		await queryInterface.createTable('playlist_tracks', {
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			playlistId: {
				type: DataTypes.INTEGER,
				allowNull: false,
				references: { model: 'playlists', key: 'id' },
				onDelete: 'CASCADE',
			},
			title: { type: DataTypes.STRING, allowNull: false },
			identifier: { type: DataTypes.STRING, allowNull: false },
			author: { type: DataTypes.STRING, allowNull: false },
			length: { type: DataTypes.BIGINT, allowNull: false },
			uri: { type: DataTypes.STRING, allowNull: false },
		});
	},
	async down(queryInterface) {
		await queryInterface.dropTable('playlist_tracks');
	},
};
