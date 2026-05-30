/**
 * @namespace: addons/ticket/database/migrations/20251124_000040_create_ticket_configs_table.js
 * @type: Database Migration
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = {
	async up(queryInterface, DataTypes) {
		await queryInterface.createTable('ticket_configs', {
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			guildId: { type: DataTypes.STRING, allowNull: false },
			panelMessageId: { type: DataTypes.STRING, allowNull: false },
			typeName: { type: DataTypes.STRING, allowNull: false },
			typeEmoji: { type: DataTypes.STRING, allowNull: true },
			staffRoleId: { type: DataTypes.STRING, allowNull: false },
			logsChannelId: { type: DataTypes.STRING, allowNull: false },
			transcriptChannelId: { type: DataTypes.STRING, allowNull: false },
			ticketCategoryId: { type: DataTypes.STRING, allowNull: true },
			ticketOpenMessage: { type: DataTypes.TEXT, allowNull: true },
			ticketOpenImage: { type: DataTypes.STRING, allowNull: true },
			askReason: {
				type: DataTypes.STRING,
				allowNull: true,
				defaultValue: null,
			},
		});

		// Indexing panelMessageId biar lookup config pas klik tombol cepet
		await queryInterface.addIndex('ticket_configs', ['panelMessageId']);
	},
	async down(queryInterface) {
		await queryInterface.dropTable('ticket_configs');
	},
};
