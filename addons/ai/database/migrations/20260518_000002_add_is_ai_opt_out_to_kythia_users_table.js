/**
 * @namespace: addons/ai/database/migrations/20260518_000002_add_is_ai_opt_out_to_kythia_users_table.js
 * @type: Database Migration
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = {
	async up(queryInterface, DataTypes) {
		await queryInterface.addColumn('kythia_users', 'isAiOptOut', {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
		});
	},

	async down(queryInterface) {
		await queryInterface.removeColumn('kythia_users', 'isAiOptOut');
	},
};
