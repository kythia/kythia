/**
 * @namespace: addons/streak/database/migrations/20260519_000040_add_restore_quota_to_streaks_and_settings.js
 * @type: Database Migration
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 1.0.0-rc
 */

module.exports = {
	async up(queryInterface, DataTypes) {
		// Per-user: how many restores used this calendar month
		await queryInterface.addColumn('streaks', 'restoreCount', {
			type: DataTypes.INTEGER,
			defaultValue: 0,
			allowNull: false,
		});

		// Per-user: which month the restoreCount applies to (e.g. "2026-05")
		// When the month changes this resets automatically in code
		await queryInterface.addColumn('streaks', 'restoreMonthKey', {
			type: DataTypes.STRING,
			allowNull: true,
			defaultValue: null,
		});

		// Per-guild: max restores allowed per calendar month (default 5)
		await queryInterface.addColumn('server_settings', 'streakRestoreQuota', {
			type: DataTypes.INTEGER,
			defaultValue: 5,
			allowNull: false,
		});
	},

	async down(queryInterface) {
		await queryInterface.removeColumn('streaks', 'restoreCount');
		await queryInterface.removeColumn('streaks', 'restoreMonthKey');
		await queryInterface.removeColumn('server_settings', 'streakRestoreQuota');
	},
};
