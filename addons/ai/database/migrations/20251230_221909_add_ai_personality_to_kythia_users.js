/**
 * @namespace: addons/ai/database/migrations/20251230_221909_add_ai_personality_to_kythia_users.js
 * @type: Database Migration
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = {
	async up(queryInterface, DataTypes) {
		await queryInterface.addColumn('kythia_users', 'aiPersonality', {
			type: DataTypes.STRING,
			allowNull: true,
			defaultValue: null,
		});
	},

	async down(queryInterface) {
		await queryInterface.removeColumn('kythia_users', 'aiPersonality');
	},
};
