/**
 * @namespace: addons/streak/database/migrations/20260519_000038_add_timezone_to_server_settings.js
 * @type: Database Migration
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 1.0.0-rc
 */

module.exports = {
	async up(queryInterface, DataTypes) {
		await queryInterface.addColumn('server_settings', 'streakTimezone', {
			type: DataTypes.STRING,
			allowNull: true,
			defaultValue: null, // null = falls back to global bot timezone
		});
	},

	async down(queryInterface) {
		await queryInterface.removeColumn('server_settings', 'streakTimezone');
	},
};
