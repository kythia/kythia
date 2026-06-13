/**
 * @namespace: addons/core/database/migrations/20260613_000001_add_premium_tier_to_kythia_users.js
 * @type: Database Migration
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = {
	async up(queryInterface, DataTypes) {
		await queryInterface.addColumn('kythia_users', 'premiumTier', {
			type: DataTypes.STRING,
			defaultValue: 'none',
		});
	},

	async down(queryInterface) {
		await queryInterface.removeColumn('kythia_users', 'premiumTier');
	},
};
