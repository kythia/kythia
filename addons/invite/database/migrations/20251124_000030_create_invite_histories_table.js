/**
 * @namespace: addons/invite/database/migrations/20251124_000030_create_invite_histories_table.js
 * @type: Database Migration
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = {
	async up(queryInterface, DataTypes) {
		await queryInterface.createTable('invite_histories', {
			id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
			guildId: { type: DataTypes.STRING, allowNull: false },
			inviterId: { type: DataTypes.STRING, allowNull: false },
			memberId: { type: DataTypes.STRING, allowNull: false },
			status: { type: DataTypes.STRING, defaultValue: 'active' },
			isFake: { type: DataTypes.BOOLEAN, defaultValue: false },
			createdAt: { type: DataTypes.DATE, allowNull: false },
			updatedAt: { type: DataTypes.DATE, allowNull: false },
		});

		await queryInterface.addIndex('invite_histories', ['guildId', 'memberId']);
		await queryInterface.addIndex('invite_histories', ['guildId', 'inviterId']);
	},
	async down(queryInterface) {
		await queryInterface.dropTable('invite_histories');
	},
};
