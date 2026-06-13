/**
 * @namespace: addons/core/database/migrations/20260613_000000_create_premium_server_binds_table.js
 * @type: Database Migration
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = {
	async up(queryInterface, DataTypes) {
		await queryInterface.createTable('premium_server_binds', {
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
			userId: {
				type: DataTypes.STRING,
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

		// Indexes for fast lookups
		await queryInterface.addIndex('premium_server_binds', ['guildId']);
		await queryInterface.addIndex('premium_server_binds', ['userId']);
	},

	async down(queryInterface) {
		await queryInterface.dropTable('premium_server_binds');
	},
};
