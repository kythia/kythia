/**
 * @namespace: addons/economy/database/migrations/20260530_000002_create_flea_market_table.js
 * @type: Database Migration
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = {
	async up(queryInterface, DataTypes) {
		await queryInterface.createTable('kythia_flea_market', {
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			sellerId: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			itemName: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			price: {
				type: DataTypes.BIGINT,
				allowNull: false,
			},
			type: {
				type: DataTypes.STRING,
				allowNull: false,
				defaultValue: 'bin', // 'bin' or 'auction'
			},
			expiresAt: {
				type: DataTypes.DATE,
				allowNull: false,
			},
			highestBidderId: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			currentBid: {
				type: DataTypes.BIGINT,
				allowNull: false,
				defaultValue: 0,
			},
			createdAt: {
				type: DataTypes.DATE,
				allowNull: false,
				defaultValue: DataTypes.NOW,
			},
			updatedAt: {
				type: DataTypes.DATE,
				allowNull: false,
				defaultValue: DataTypes.NOW,
			},
		});
	},

	async down(queryInterface) {
		await queryInterface.dropTable('kythia_flea_market');
	},
};
