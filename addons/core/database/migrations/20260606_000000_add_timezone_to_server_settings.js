/**
 * @namespace: addons/core/database/migrations/20260606_000000_add_timezone_to_server_settings.js
 * @type: Database Migration
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = {
	async up(queryInterface, DataTypes) {
		await queryInterface.addColumn('server_settings', 'timezone', {
			type: DataTypes.STRING,
			allowNull: true,
			defaultValue: 'UTC',
		});
		await queryInterface.addColumn('server_settings', 'clockType', {
			type: DataTypes.STRING,
			allowNull: true,
			defaultValue: '24h',
		});
		await queryInterface.addColumn('server_settings', 'dateFormat', {
			type: DataTypes.STRING,
			allowNull: true,
			defaultValue: 'DD/MM/YYYY',
		});
		await queryInterface.addColumn('server_settings', 'embedColor', {
			type: DataTypes.STRING,
			allowNull: true,
			defaultValue: '#6C63FF', // Kythia's default branding color
		});
		await queryInterface.addColumn('server_settings', 'deleteCommandMessages', {
			type: DataTypes.BOOLEAN,
			allowNull: true,
			defaultValue: false,
		});
		await queryInterface.addColumn('server_settings', 'ephemeralReplies', {
			type: DataTypes.BOOLEAN,
			allowNull: true,
			defaultValue: false,
		});
	},

	async down(queryInterface) {
		await queryInterface.removeColumn('server_settings', 'ephemeralReplies');
		await queryInterface.removeColumn(
			'server_settings',
			'deleteCommandMessages',
		);
		await queryInterface.removeColumn('server_settings', 'embedColor');
		await queryInterface.removeColumn('server_settings', 'dateFormat');
		await queryInterface.removeColumn('server_settings', 'clockType');
		await queryInterface.removeColumn('server_settings', 'timezone');
	},
};
