/**
 * @namespace: addons/activity/database/migrations/20260604_000008_add_achievement_channel_to_server_settings.js
 * @type: Database Migration
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = {
	async up(queryInterface, DataTypes) {
		await queryInterface.addColumn('server_settings', 'achievementChannelId', {
			type: DataTypes.STRING,
			allowNull: true,
			defaultValue: null,
		});
	},

	async down(queryInterface) {
		await queryInterface.removeColumn(
			'server_settings',
			'achievementChannelId',
		);
	},
};
