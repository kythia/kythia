/**
 * @namespace: addons/verification/database/migrations/20260307_000003_create_verification_configs.js
 * @type: Database Migration
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = {
	async up(queryInterface, DataTypes) {
		await queryInterface.createTable('verification_configs', {
			guildId: {
				type: DataTypes.STRING(30),
				primaryKey: true,
				allowNull: false,
			},
			verifiedRoleId: {
				type: DataTypes.STRING(30),
				allowNull: true,
				defaultValue: null,
			},
			unverifiedRoleId: {
				type: DataTypes.STRING(30),
				allowNull: true,
				defaultValue: null,
			},
			channelId: {
				type: DataTypes.STRING(30),
				allowNull: true,
				defaultValue: null,
				comment: 'null = DM only',
			},
			captchaType: {
				type: DataTypes.ENUM('math', 'emoji', 'image'),
				allowNull: false,
				defaultValue: 'math',
			},
			maxAttempts: {
				type: DataTypes.INTEGER,
				allowNull: false,
				defaultValue: 3,
			},
			timeoutSeconds: {
				type: DataTypes.INTEGER,
				allowNull: false,
				defaultValue: 180,
			},
			kickOnFail: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
				defaultValue: false,
			},
			kickOnTimeout: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
				defaultValue: false,
			},
			dmFallback: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
				defaultValue: true,
			},
			welcomeMessage: {
				type: DataTypes.TEXT,
				allowNull: true,
				defaultValue: null,
			},
			logChannelId: {
				type: DataTypes.STRING(30),
				allowNull: true,
				defaultValue: null,
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
		await queryInterface.dropTable('verification_configs').catch(() => null);
	},
};
