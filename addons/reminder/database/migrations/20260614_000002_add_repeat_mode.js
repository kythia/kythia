/**
 * @namespace: addons/reminder/database/migrations/20260614_000002_add_repeat_mode.js
 * @type: Database Migration
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = {
	async up(queryInterface, DataTypes) {
		await queryInterface.addColumn('kythia_reminders', 'repeatMode', {
			type: DataTypes.STRING,
			allowNull: true,
			defaultValue: null,
		});
	},
	async down(queryInterface) {
		await queryInterface.removeColumn('kythia_reminders', 'repeatMode');
	},
};
