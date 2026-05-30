/**
 * @namespace: addons/automod/database/migrations/20260307_000001_add_automod_on_to_server_settings.js
 * @type: Database Migration
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = {
	async up(queryInterface, DataTypes) {
		await queryInterface.addColumn('server_settings', 'automodOn', {
			type: DataTypes.BOOLEAN,
			defaultValue: true, // default true = backward compat, existing guilds keep automod active
			allowNull: false,
		});
	},

	async down(queryInterface) {
		await queryInterface.removeColumn('server_settings', 'automodOn');
	},
};
