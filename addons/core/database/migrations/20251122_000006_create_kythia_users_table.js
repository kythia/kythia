/**
 * @namespace: addons/core/database/migrations/20251122_000006_create_kythia_users_table.js
 * @type: Database Migration
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = {
	async up(queryInterface, DataTypes) {
		await queryInterface.createTable('kythia_users', {
			userId: {
				type: DataTypes.STRING,
				allowNull: false,
				primaryKey: true,
			},
			isPremium: {
				type: DataTypes.BOOLEAN,
				defaultValue: false,
			},
			premiumType: {
				type: DataTypes.ENUM('personal', 'server'),
				defaultValue: 'personal',
			},
			premiumServerIds: {
				type: DataTypes.JSON,
				allowNull: true,
			},
			premiumExpiresAt: {
				type: DataTypes.DATE,
				defaultValue: null,
			},
			kythiaCoin: {
				type: DataTypes.BIGINT,
				defaultValue: 0,
			},
			kythiaRuby: {
				type: DataTypes.BIGINT,
				defaultValue: 0,
			},
			kythiaBank: {
				type: DataTypes.BIGINT,
				defaultValue: 0,
			},
			bankType: {
				type: DataTypes.STRING,
				defaultValue: 'solara_mutual',
			},
			hackMastered: {
				type: DataTypes.INTEGER,
				defaultValue: 10,
			},
			careerMastered: {
				type: DataTypes.INTEGER,
				defaultValue: 1,
			},
			lastDaily: {
				type: DataTypes.DATE,
				defaultValue: null,
			},
			lastBeg: {
				type: DataTypes.DATE,
				defaultValue: null,
			},
			lastLootbox: {
				type: DataTypes.DATE,
				defaultValue: null,
			},
			lastWork: {
				type: DataTypes.DATE,
				defaultValue: null,
			},
			lastRob: {
				type: DataTypes.DATE,
				defaultValue: null,
			},
			lastHack: {
				type: DataTypes.DATE,
				defaultValue: null,
			},
			votePoints: {
				type: DataTypes.BIGINT,
				defaultValue: 0,
			},
			isVoted: {
				type: DataTypes.BOOLEAN,
				defaultValue: false,
			},
			voteExpiresAt: {
				type: DataTypes.DATE,
				defaultValue: null,
			},
		});
	},

	async down(queryInterface) {
		await queryInterface.dropTable('kythia_users');
	},
};
