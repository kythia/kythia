/**
 * @namespace: addons/automod/database/migrations/20260612_000001_add_antighostping_to_server_settings.js
 * @type: Database Migration
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = {
	async up(queryInterface, Sequelize) {
		const tableInfo = await queryInterface.describeTable('server_settings');
		if (!tableInfo.antiGhostPingOn) {
			await queryInterface.addColumn('server_settings', 'antiGhostPingOn', {
				type: Sequelize.BOOLEAN,
				defaultValue: false,
			});
		}
	},

	async down(queryInterface) {
		const tableInfo = await queryInterface.describeTable('server_settings');
		if (tableInfo.antiGhostPingOn) {
			await queryInterface.removeColumn('server_settings', 'antiGhostPingOn');
		}
	},
};
