/**
 * @namespace: addons/music/database/migrations/20260620_000000_add_locked_by_id_to_music_247_status.js
 * @type: Database Migration
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = {
	async up(queryInterface, DataTypes) {
		await queryInterface.addColumn('music_247_status', 'lockedById', {
			type: DataTypes.STRING,
			allowNull: true,
		});
	},
	async down(queryInterface) {
		await queryInterface.removeColumn('music_247_status', 'lockedById');
	},
};
