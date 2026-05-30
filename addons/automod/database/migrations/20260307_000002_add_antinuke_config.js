/**
 * @namespace: addons/automod/database/migrations/20260307_000002_add_antinuke_config.js
 * @type: Database Migration
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = {
	async up(queryInterface, DataTypes) {
		await queryInterface.addColumn('server_settings', 'antiNukeConfig', {
			type: DataTypes.TEXT,
			defaultValue: null,
			allowNull: true,
		});
	},

	async down(queryInterface) {
		await queryInterface.removeColumn('server_settings', 'antiNukeConfig');
	},
};
