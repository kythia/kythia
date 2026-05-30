/**
 * @namespace: addons/economy/database/migrations/20251122_000015_create_market_portfolios_table.js
 * @type: Database Migration
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = {
	async up(queryInterface, DataTypes) {
		await queryInterface.createTable('market_portfolios', {
			portfolioId: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			userId: { type: DataTypes.STRING, allowNull: false },
			assetId: { type: DataTypes.STRING, allowNull: false },
			quantity: { type: DataTypes.DOUBLE, allowNull: false },
			avgBuyPrice: { type: DataTypes.DOUBLE, allowNull: false },
		});

		await queryInterface.addIndex('market_portfolios', ['userId']);
		// Unique index userId + assetId
		await queryInterface.addIndex('market_portfolios', ['userId', 'assetId'], {
			unique: true,
			name: 'unique_user_asset',
		});
	},

	async down(queryInterface) {
		await queryInterface.dropTable('market_portfolios');
	},
};
