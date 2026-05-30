/**
 * @namespace: addons/social-alerts/database/migrations/20260311_000003_add_platform_to_social_alert_subscriptions.js
 * @type: Database Migration
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = {
	async up(queryInterface, DataTypes) {
		// Add platform column — defaults to 'youtube' so all existing rows get the correct value
		await queryInterface.addColumn('social_alert_subscriptions', 'platform', {
			type: DataTypes.STRING(20),
			allowNull: false,
			defaultValue: 'youtube',
		});
	},

	async down(queryInterface) {
		await queryInterface.removeColumn('social_alert_subscriptions', 'platform');
	},
};
