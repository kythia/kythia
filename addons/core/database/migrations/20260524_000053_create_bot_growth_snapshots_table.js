/**
 * @namespace: addons/core/database/migrations/20260524_000053_create_bot_growth_snapshots_table.js
 * @type: Database Migration
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = {
	async up(queryInterface, DataTypes) {
		await queryInterface.createTable('bot_growth_snapshots', {
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
			guildName: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			memberCount: {
				type: DataTypes.INTEGER,
				defaultValue: 0,
			},
			event: {
				type: DataTypes.ENUM('join', 'leave'),
				allowNull: false,
			},
			totalGuilds: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			createdAt: {
				type: DataTypes.DATE,
				allowNull: false,
			},
			updatedAt: {
				type: DataTypes.DATE,
				allowNull: false,
			},
		});

		// Index for fast time-range queries used by the dashboard chart
		await queryInterface.addIndex('bot_growth_snapshots', ['createdAt']);
		await queryInterface.addIndex('bot_growth_snapshots', ['event']);
	},

	async down(queryInterface) {
		await queryInterface.dropTable('bot_growth_snapshots');
	},
};
