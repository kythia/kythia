/**
 * @namespace: addons/activity/database/migrations/20260604_000006_add_reactions_to_activity_logs.js
 * @type: Database Migration
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = {
	async up(queryInterface, DataTypes) {
		await queryInterface.addColumn('activity_logs', 'reactions', {
			type: DataTypes.BIGINT,
			defaultValue: 0,
			allowNull: false,
		});
	},

	async down(queryInterface) {
		await queryInterface.removeColumn('activity_logs', 'reactions');
	},
};
