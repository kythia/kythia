/**
 * @namespace: addons/economy/database/migrations/20260530_000003_create_kyth_liquidity_pool.js
 * @type: Database Migration
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 1.0.0-rc
 */

module.exports = {
	async up(queryInterface, DataTypes) {
		// Liquidity Pool — single-row "Bank Sentral Kythia"
		await queryInterface.createTable('kythia_liquidity_pool', {
			id: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				autoIncrement: true,
			},
			coinReserve: {
				type: DataTypes.DOUBLE,
				allowNull: false,
				defaultValue: 1_000_000,
				comment: 'Total Kythia Coin in pool (X) — DOUBLE for AMM precision',
			},
			kythReserve: {
				type: DataTypes.DOUBLE,
				allowNull: false,
				defaultValue: 10_000, // ICO: 10,000 KYTH
				comment: 'Total KYTH Token in pool (Y)',
			},
			kConstant: {
				type: DataTypes.DOUBLE,
				allowNull: false,
				defaultValue: 10_000_000_000, // K = X * Y = 10B
				comment: 'Constant K (must never change during trades)',
			},
			totalTaxCollected: {
				type: DataTypes.BIGINT,
				allowNull: false,
				defaultValue: 0,
				comment: 'Accumulated 2% tx fees for staking dividends',
			},
			lastBurnAt: {
				type: DataTypes.DATE,
				allowNull: true,
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

		// Seed the initial ICO pool row
		await queryInterface.bulkInsert('kythia_liquidity_pool', [
			{
				coinReserve: 1_000_000,
				kythReserve: 10_000,
				kConstant: 10_000_000_000,
				totalTaxCollected: 0,
				lastBurnAt: null,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
		]);

		// Add KYTH holdings to KythiaUser
		await queryInterface.addColumn('kythia_users', 'kythHolding', {
			type: DataTypes.DOUBLE,
			allowNull: false,
			defaultValue: 0,
			comment: 'Total KYTH tokens held by user',
		});
		await queryInterface.addColumn('kythia_users', 'kythStaked', {
			type: DataTypes.DOUBLE,
			allowNull: false,
			defaultValue: 0,
			comment: 'KYTH staked in Solara Mutual for dividends',
		});
	},

	async down(queryInterface) {
		await queryInterface.dropTable('kythia_liquidity_pool');
		await queryInterface.removeColumn('kythia_users', 'kythHolding');
		await queryInterface.removeColumn('kythia_users', 'kythStaked');
	},
};
