/**
 * @namespace: addons/core/database/migrations/20251122_000010_create_snipes_table.js
 * @type: Database Migration
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = {
	async up(queryInterface, DataTypes) {
		await queryInterface.createTable('snipes', {
			id: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				autoIncrement: true,
				allowNull: false,
			},
			guildId: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			channelId: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			messageId: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			authorId: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			authorTag: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			content: {
				type: DataTypes.TEXT,
				allowNull: true,
			},
			deletedAt: {
				type: DataTypes.DATE,
				allowNull: false,
				defaultValue: DataTypes.NOW,
			},
			attachments: {
				type: DataTypes.JSON,
				defaultValue: '[]',
			},
		});

		await queryInterface.addIndex('snipes', ['guildId', 'channelId'], {
			name: 'snipes_guildId_channelId',
		});
	},

	async down(queryInterface) {
		await queryInterface.dropTable('snipes');
	},
};
