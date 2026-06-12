/**
 * @namespace: addons/automod/database/migrations/20260612_184226_add_automodconfig_to_server_settings.js
 * @type: Database Migration
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = {
	async up(queryInterface, Sequelize) {
		const tableInfo = await queryInterface.describeTable('server_settings');
		if (!tableInfo.automodConfig) {
			await queryInterface.addColumn('server_settings', 'automodConfig', {
				type: Sequelize.JSON,
				allowNull: true,
			});
		}
	},

	async down(queryInterface) {
		const tableInfo = await queryInterface.describeTable('server_settings');
		if (tableInfo.automodConfig) {
			await queryInterface.removeColumn('server_settings', 'automodConfig');
		}
	},
};
