/**
 * @namespace: addons/streak/database/migrations/20260519_000039_add_restore_columns_to_streaks.js
 * @type: Database Migration
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 1.0.0-rc
 */

module.exports = {
	async up(queryInterface, DataTypes) {
		// The streak count right before the last reset/loss — used by /streak restore
		await queryInterface.addColumn('streaks', 'lastStreak', {
			type: DataTypes.INTEGER,
			defaultValue: 0,
			allowNull: false,
		});

		// When the user last used /streak restore — prevents restoring more than once per loss
		await queryInterface.addColumn('streaks', 'lastRestoreTimestamp', {
			type: DataTypes.DATE,
			allowNull: true,
			defaultValue: null,
		});
	},

	async down(queryInterface) {
		await queryInterface.removeColumn('streaks', 'lastStreak');
		await queryInterface.removeColumn('streaks', 'lastRestoreTimestamp');
	},
};
