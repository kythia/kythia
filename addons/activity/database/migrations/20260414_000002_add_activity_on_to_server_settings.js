/**
 * @namespace: addons/activity/database/migrations/20260414_000002_add_activity_on_to_server_settings.js
 * @type: Database Migration
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = {
	async up(queryInterface, DataTypes) {
		await queryInterface.addColumn('server_settings', 'activityOn', {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		});
	},

	async down(queryInterface) {
		await queryInterface.removeColumn('server_settings', 'activityOn');
	},
};
