/**
 * @namespace: addons/invite/database/migrations/20260303_000032_alter_invites_add_bonus_rejoins.js
 * @type: Database Migration
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = {
	async up(queryInterface, DataTypes) {
		await queryInterface.addColumn('invites', 'bonus', {
			type: DataTypes.INTEGER,
			defaultValue: 0,
			allowNull: false,
		});
		await queryInterface.addColumn('invites', 'rejoins', {
			type: DataTypes.INTEGER,
			defaultValue: 0,
			allowNull: false,
		});
	},
	async down(queryInterface) {
		await queryInterface.removeColumn('invites', 'bonus');
		await queryInterface.removeColumn('invites', 'rejoins');
	},
};
