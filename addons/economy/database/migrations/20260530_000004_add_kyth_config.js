/**
 * @namespace: addons/economy/database/migrations/20260530_000004_add_kyth_config.js
 * @type: Database Migration
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = {
	async up(queryInterface, DataTypes) {
		// ── Trading Controls ──────────────────────────────────────────────────
		await queryInterface.addColumn('kythia_liquidity_pool', 'tradingHalted', {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false,
			comment: 'Emergency kill switch: halts all /eco market buy/sell kyth',
		});

		// ── Fee Config ────────────────────────────────────────────────────────
		await queryInterface.addColumn('kythia_liquidity_pool', 'feeRatePct', {
			type: DataTypes.FLOAT,
			allowNull: false,
			defaultValue: 2.0,
			comment: 'Protocol fee % taken on each KYTH swap (default 2%)',
		});

		// ── Trade Limits ──────────────────────────────────────────────────────
		await queryInterface.addColumn('kythia_liquidity_pool', 'minTradeAmount', {
			type: DataTypes.DOUBLE,
			allowNull: false,
			defaultValue: 1,
			comment: 'Min Coin amount allowed per buy trade',
		});
		await queryInterface.addColumn('kythia_liquidity_pool', 'maxTradeAmount', {
			type: DataTypes.DOUBLE,
			allowNull: false,
			defaultValue: 0,
			comment: 'Max Coin per buy trade (0 = unlimited)',
		});

		// ── Burn Config ────────────────────────────────────────────────────────
		await queryInterface.addColumn('kythia_liquidity_pool', 'burnActive', {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: true,
			comment: 'Whether the monthly auto token burn cron is active',
		});
		await queryInterface.addColumn('kythia_liquidity_pool', 'burnRatePct', {
			type: DataTypes.FLOAT,
			allowNull: false,
			defaultValue: 5.0,
			comment: '% of kythReserve to burn each cycle (default 5%)',
		});

		// ── Dividend Config ────────────────────────────────────────────────────
		await queryInterface.addColumn('kythia_liquidity_pool', 'dividendActive', {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: true,
			comment: 'Whether daily dividend distribution to stakers is active',
		});
		await queryInterface.addColumn(
			'kythia_liquidity_pool',
			'dividendSplitPct',
			{
				type: DataTypes.FLOAT,
				allowNull: false,
				defaultValue: 50.0,
				comment: '% of totalTaxCollected distributed to stakers (default 50%)',
			},
		);

		// ── Black Market ───────────────────────────────────────────────────────
		await queryInterface.addColumn(
			'kythia_liquidity_pool',
			'blackmarketActive',
			{
				type: DataTypes.BOOLEAN,
				allowNull: false,
				defaultValue: true,
				comment: 'Whether /eco blackmarket is open for business',
			},
		);

		// ── Staking ────────────────────────────────────────────────────────────
		await queryInterface.addColumn('kythia_liquidity_pool', 'stakingActive', {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: true,
			comment: 'Whether /eco kyth_stake is active',
		});
		await queryInterface.addColumn('kythia_liquidity_pool', 'stakingMinKyth', {
			type: DataTypes.FLOAT,
			allowNull: false,
			defaultValue: 1.0,
			comment: 'Minimum KYTH required to stake',
		});
	},

	async down(queryInterface) {
		const cols = [
			'tradingHalted',
			'feeRatePct',
			'minTradeAmount',
			'maxTradeAmount',
			'burnActive',
			'burnRatePct',
			'dividendActive',
			'dividendSplitPct',
			'blackmarketActive',
			'stakingActive',
			'stakingMinKyth',
		];
		for (const col of cols) {
			await queryInterface.removeColumn('kythia_liquidity_pool', col);
		}
	},
};
