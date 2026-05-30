/**
 * @namespace: addons/modmail/database/migrations/20260312_000051_create_modmails_table.js
 * @type: Database Migration
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = {
	async up(queryInterface, DataTypes) {
		await queryInterface.createTable('modmails', {
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			guildId: { type: DataTypes.STRING, allowNull: false },
			userId: { type: DataTypes.STRING, allowNull: false },
			// The private thread channel in the inbox channel
			threadChannelId: { type: DataTypes.STRING, allowNull: false },
			status: {
				type: DataTypes.ENUM('open', 'closed'),
				defaultValue: 'open',
			},
			openedAt: { type: DataTypes.DATE, allowNull: true },
			closedAt: { type: DataTypes.DATE, allowNull: true },
			closedByUserId: { type: DataTypes.STRING, allowNull: true },
			closedReason: { type: DataTypes.TEXT, allowNull: true },
			createdAt: { type: DataTypes.DATE, allowNull: false },
			updatedAt: { type: DataTypes.DATE, allowNull: false },
		});

		await queryInterface.addIndex('modmails', ['userId', 'guildId']);
		await queryInterface.addIndex('modmails', ['threadChannelId']);
	},
	async down(queryInterface) {
		await queryInterface.dropTable('modmails');
	},
};
