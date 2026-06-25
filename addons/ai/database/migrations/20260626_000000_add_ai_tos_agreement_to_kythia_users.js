/**
 * @namespace: addons/ai/database/migrations/20260626_000000_add_ai_tos_agreement_to_kythia_users.js
 * @type: Database Migration
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = {
	async up(queryInterface, DataTypes) {
		await queryInterface.addColumn('kythia_users', 'hasAgreedToAiTos', {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
		});
	},

	async down(queryInterface) {
		await queryInterface.removeColumn('kythia_users', 'hasAgreedToAiTos');
	},
};
