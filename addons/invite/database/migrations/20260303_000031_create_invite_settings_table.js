/**
 * @namespace: addons/invite/database/migrations/20260303_000031_create_invite_settings_table.js
 * @type: Database Migration
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = {
	async up(queryInterface, DataTypes) {
		await queryInterface.createTable('invite_settings', {
			guildId: { type: DataTypes.STRING, allowNull: false, primaryKey: true },
			fakeThreshold: { type: DataTypes.INTEGER, defaultValue: 7 },
			joinMessage: { type: DataTypes.TEXT, allowNull: true },
			leaveMessage: { type: DataTypes.TEXT, allowNull: true },
			milestoneRoles: { type: DataTypes.JSON, defaultValue: [] },
			roleStack: { type: DataTypes.BOOLEAN, defaultValue: false },
			createdAt: { type: DataTypes.DATE, allowNull: false },
			updatedAt: { type: DataTypes.DATE, allowNull: false },
		});
	},
	async down(queryInterface) {
		await queryInterface.dropTable('invite_settings');
	},
};
