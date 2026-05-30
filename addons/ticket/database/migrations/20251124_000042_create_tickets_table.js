/**
 * @namespace: addons/ticket/database/migrations/20251124_000042_create_tickets_table.js
 * @type: Database Migration
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = {
	async up(queryInterface, DataTypes) {
		await queryInterface.createTable('tickets', {
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			guildId: { type: DataTypes.STRING, allowNull: false },
			userId: { type: DataTypes.STRING, allowNull: false },
			channelId: { type: DataTypes.STRING, allowNull: false },
			ticketConfigId: { type: DataTypes.STRING, allowNull: false },
			conversation: { type: DataTypes.JSON, defaultValue: [] }, // Default value array kosong
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

		await queryInterface.addIndex('tickets', ['channelId']);
		await queryInterface.addIndex('tickets', ['userId']);
	},
	async down(queryInterface) {
		await queryInterface.dropTable('tickets');
	},
};
