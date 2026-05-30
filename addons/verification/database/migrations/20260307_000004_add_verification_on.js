/**
 * @namespace: addons/verification/database/migrations/20260307_000004_add_verification_on.js
 * @type: Database Migration
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = {
	async up(queryInterface, DataTypes) {
		await queryInterface.addColumn('server_settings', 'verificationOn', {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		});
	},

	async down(queryInterface) {
		await queryInterface.removeColumn('server_settings', 'verificationOn');
	},
};
