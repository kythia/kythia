/**
 * @namespace: addons/_counting/database/migrations/20260531_232601_create_counting_users_table.js
 * @type: Database Migration
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 1.0.0-rc
 */

module.exports = {
	async up(queryInterface, DataTypes) {
		await queryInterface.createTable('counting_users', {
			guildId: {
				type: DataTypes.STRING,
				primaryKey: true,
				allowNull: false,
			},
			userId: {
				type: DataTypes.STRING,
				primaryKey: true,
				allowNull: false,
			},
			correctCounts: {
				type: DataTypes.INTEGER,
				defaultValue: 0,
			},
			ruinedCounts: {
				type: DataTypes.INTEGER,
				defaultValue: 0,
			},
			createdAt: {
				allowNull: false,
				type: DataTypes.DATE,
			},
			updatedAt: {
				allowNull: false,
				type: DataTypes.DATE,
			},
		});
	},

	async down(queryInterface) {
		await queryInterface.dropTable('counting_users');
	},
};
