/**
 * @namespace: addons/verification/database/migrations/20260318_000001_add_panel_fields_to_verification_configs.js
 * @type: Database Migration
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = {
	async up(queryInterface, DataTypes) {
		await queryInterface.addColumn('verification_configs', 'panelMessageId', {
			type: DataTypes.STRING(30),
			allowNull: true,
			defaultValue: null,
		});
		await queryInterface.addColumn('verification_configs', 'panelConfig', {
			type: DataTypes.TEXT,
			allowNull: true,
			defaultValue: null,
		});
	},

	async down(queryInterface) {
		await queryInterface
			.removeColumn('verification_configs', 'panelMessageId')
			.catch(() => null);
		await queryInterface
			.removeColumn('verification_configs', 'panelConfig')
			.catch(() => null);
	},
};
