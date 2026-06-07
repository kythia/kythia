/**
 * @namespace: addons/counting/database/migrations/20260104_000000_create_counting_table.js
 * @type: Database Migration
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = {
	async up(queryInterface, DataTypes) {
		await queryInterface.createTable('countings', {
			guildId: {
				type: DataTypes.STRING,
				primaryKey: true,
				allowNull: false,
			},
			channelId: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			currentCount: {
				type: DataTypes.INTEGER,
				defaultValue: 0,
			},
			lastUserId: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			mathEnabled: {
				type: DataTypes.BOOLEAN,
				defaultValue: true,
			},
			strictEnabled: {
				type: DataTypes.BOOLEAN,
				defaultValue: false,
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
		await queryInterface.dropTable('countings');
	},
};
