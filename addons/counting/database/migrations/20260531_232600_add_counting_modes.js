/**
 * @namespace: addons/_counting/database/migrations/20260531_232600_add_counting_modes.js
 * @type: Database Migration
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 1.0.0-rc
 */

module.exports = {
	async up(queryInterface, DataTypes) {
		await queryInterface.addColumn('countings', 'mode', {
			type: DataTypes.STRING,
			defaultValue: 'decimal',
		});
		await queryInterface.addColumn('countings', 'successReaction', {
			type: DataTypes.STRING,
			defaultValue: '✅',
		});
		await queryInterface.addColumn('countings', 'failReaction', {
			type: DataTypes.STRING,
			defaultValue: '❌',
		});
	},

	async down(queryInterface) {
		await queryInterface.removeColumn('countings', 'mode');
		await queryInterface.removeColumn('countings', 'successReaction');
		await queryInterface.removeColumn('countings', 'failReaction');
	},
};
