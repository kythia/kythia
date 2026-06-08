/**
 * @namespace: addons/economy/database/migrations/20260608_000001_create_guild_tokens.js
 * @type: Database Migration
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = {
	async up(queryInterface, DataTypes) {
		// 1. Guild Liquidity Pools (AMM for Guild Tokens)
		await queryInterface.createTable('guild_liquidity_pools', {
			guildId: {
				type: DataTypes.STRING(20),
				primaryKey: true,
				allowNull: false,
			},
			ticker: {
				type: DataTypes.STRING(4),
				allowNull: false,
				unique: true,
				comment: 'Max 4 letters (e.g. MEME, AAPL)',
			},
			kythReserve: {
				type: DataTypes.DOUBLE,
				allowNull: false,
				defaultValue: 0,
				comment: 'Total KYTH base asset in the pool (X)',
			},
			tokenReserve: {
				type: DataTypes.DOUBLE,
				allowNull: false,
				defaultValue: 0,
				comment: 'Total Guild Tokens in the pool (Y)',
			},
			kConstant: {
				type: DataTypes.DOUBLE,
				allowNull: false,
				defaultValue: 0,
				comment: 'Constant K = X * Y',
			},
			feeRatePct: {
				type: DataTypes.FLOAT,
				allowNull: false,
				defaultValue: 2.0,
				comment: 'Protocol fee % taken on each swap',
			},
			tradingHalted: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
				defaultValue: false,
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

		// 2. Guild Token Holdings (User's balance of specific Guild Tokens)
		await queryInterface.createTable('guild_token_holdings', {
			id: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				autoIncrement: true,
			},
			userId: {
				type: DataTypes.STRING(20),
				allowNull: false,
			},
			guildId: {
				type: DataTypes.STRING(20),
				allowNull: false,
			},
			balance: {
				type: DataTypes.DOUBLE,
				allowNull: false,
				defaultValue: 0,
				comment: 'Amount of Guild Tokens held by the user',
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

		// Add an index to speed up lookups
		await queryInterface.addIndex(
			'guild_token_holdings',
			['userId', 'guildId'],
			{
				unique: true,
				name: 'idx_guild_token_holdings_user_guild',
			},
		);
	},

	async down(queryInterface) {
		await queryInterface.dropTable('guild_token_holdings');
		await queryInterface.dropTable('guild_liquidity_pools');
	},
};
