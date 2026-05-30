/**
 * @namespace: addons/modmail/database/migrations/20260312_000052_add_card_customization_to_modmail_configs.js
 * @type: Database Migration
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = {
	async up(queryInterface, DataTypes) {
		await queryInterface.addColumn('modmail_configs', 'greetingColor', {
			type: DataTypes.STRING(20),
			allowNull: true,
			defaultValue: null,
		});
		await queryInterface.addColumn('modmail_configs', 'greetingImage', {
			type: DataTypes.STRING(512),
			allowNull: true,
			defaultValue: null,
		});
		await queryInterface.addColumn('modmail_configs', 'closingColor', {
			type: DataTypes.STRING(20),
			allowNull: true,
			defaultValue: null,
		});
		await queryInterface.addColumn('modmail_configs', 'closingImage', {
			type: DataTypes.STRING(512),
			allowNull: true,
			defaultValue: null,
		});
	},

	async down(queryInterface) {
		await queryInterface.removeColumn('modmail_configs', 'greetingColor');
		await queryInterface.removeColumn('modmail_configs', 'greetingImage');
		await queryInterface.removeColumn('modmail_configs', 'closingColor');
		await queryInterface.removeColumn('modmail_configs', 'closingImage');
	},
};
