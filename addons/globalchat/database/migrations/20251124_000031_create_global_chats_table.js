/**
 * @namespace: addons/globalchat/database/migrations/20251124_000031_create_global_chats_table.js
 * @type: Database Migration
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = {
	async up(queryInterface, DataTypes) {
		await queryInterface.createTable('global_chats', {
			guildId: {
				type: DataTypes.STRING,
				allowNull: false,
				primaryKey: true,
			},
			globalChannelId: { type: DataTypes.STRING, allowNull: true },
			webhookId: { type: DataTypes.STRING, allowNull: true },
			webhookToken: { type: DataTypes.STRING, allowNull: true },
			createdAt: { type: DataTypes.DATE, allowNull: false },
			updatedAt: { type: DataTypes.DATE, allowNull: false },
		});
	},
	async down(queryInterface) {
		await queryInterface.dropTable('global_chats');
	},
};
