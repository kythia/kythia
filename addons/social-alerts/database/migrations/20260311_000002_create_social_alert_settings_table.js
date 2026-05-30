/**
 * @namespace: addons/social-alerts/database/migrations/20260311_000002_create_social_alert_settings_table.js
 * @type: Database Migration
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = {
	async up(queryInterface, DataTypes) {
		await queryInterface.createTable('social_alert_settings', {
			guildId: {
				type: DataTypes.STRING(25),
				allowNull: false,
				primaryKey: true,
			},
			mentionRoleId: {
				type: DataTypes.STRING(25),
				allowNull: true,
			},
			createdAt: {
				type: DataTypes.DATE,
				allowNull: false,
				defaultValue: new Date(),
			},
			updatedAt: {
				type: DataTypes.DATE,
				allowNull: false,
				defaultValue: new Date(),
			},
		});
	},

	async down(queryInterface) {
		await queryInterface.dropTable('social_alert_settings');
	},
};
