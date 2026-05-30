/**
 * @namespace: addons/leveling/database/migrations/20260319_000001_create_leveling_settings_table.js
 * @type: Database Migration
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = {
	async up(queryInterface, DataTypes) {
		await queryInterface.createTable('leveling_settings', {
			guildId: {
				type: DataTypes.STRING,
				allowNull: false,
				primaryKey: true,
			},

			// ---------------------------------------------------------------------------
			// XP Gain Settings
			// ---------------------------------------------------------------------------
			messageXpEnabled: { type: DataTypes.BOOLEAN, defaultValue: true },
			messageXpMode: {
				type: DataTypes.ENUM('random', 'per_word', 'fixed'),
				defaultValue: 'random',
			},
			messageXpMin: { type: DataTypes.INTEGER, defaultValue: 15 },
			messageXpMax: { type: DataTypes.INTEGER, defaultValue: 25 },
			messageXpCooldown: { type: DataTypes.INTEGER, defaultValue: 60 },

			voiceXpEnabled: { type: DataTypes.BOOLEAN, defaultValue: true },
			voiceXpMin: { type: DataTypes.INTEGER, defaultValue: 15 },
			voiceXpMax: { type: DataTypes.INTEGER, defaultValue: 40 },
			voiceXpCooldown: { type: DataTypes.INTEGER, defaultValue: 180 },
			voiceMinMembers: { type: DataTypes.INTEGER, defaultValue: 2 },
			voiceAntiAfk: { type: DataTypes.BOOLEAN, defaultValue: true },

			reactionXpEnabled: { type: DataTypes.BOOLEAN, defaultValue: false },
			reactionXpAward: {
				type: DataTypes.ENUM('none', 'both', 'author', 'reactor'),
				defaultValue: 'both',
			},
			reactionXpMin: { type: DataTypes.INTEGER, defaultValue: 1 },
			reactionXpMax: { type: DataTypes.INTEGER, defaultValue: 5 },
			reactionXpCooldown: { type: DataTypes.INTEGER, defaultValue: 10 },

			threadXpEnabled: { type: DataTypes.BOOLEAN, defaultValue: true },
			forumXpEnabled: { type: DataTypes.BOOLEAN, defaultValue: true },
			textInVoiceXpEnabled: { type: DataTypes.BOOLEAN, defaultValue: true },
			slashCommandXpEnabled: { type: DataTypes.BOOLEAN, defaultValue: true },

			// ---------------------------------------------------------------------------
			// Curve & Level Cap
			// ---------------------------------------------------------------------------
			levelingCurve: {
				type: DataTypes.ENUM('linear', 'exponential', 'constant'),
				defaultValue: 'linear',
			},
			levelingMultiplier: { type: DataTypes.FLOAT, defaultValue: 1.0 },
			levelingMaxLevel: { type: DataTypes.INTEGER, allowNull: true },

			// ---------------------------------------------------------------------------
			// Boosters & Restrictions
			// ---------------------------------------------------------------------------
			xpBoosters: { type: DataTypes.JSON, defaultValue: [] },
			channelBoosters: { type: DataTypes.JSON, defaultValue: [] },
			stackBoosters: { type: DataTypes.BOOLEAN, defaultValue: true },
			noXpChannels: { type: DataTypes.JSON, defaultValue: [] },
			noXpRoles: { type: DataTypes.JSON, defaultValue: [] },
			autoResetXp: { type: DataTypes.BOOLEAN, defaultValue: false },

			// ---------------------------------------------------------------------------
			// Role Rewards
			// ---------------------------------------------------------------------------
			roleRewards: { type: DataTypes.JSON, defaultValue: [] },
			roleRewardStack: { type: DataTypes.BOOLEAN, defaultValue: false },

			// ---------------------------------------------------------------------------
			// Level-Up Notification
			// ---------------------------------------------------------------------------
			levelingChannelId: { type: DataTypes.STRING, allowNull: true },
			levelingMessage: {
				type: DataTypes.TEXT,
				defaultValue: 'GG {user.mention}, you reached level **{user.level}**!',
			},
			levelingImageEnabled: { type: DataTypes.BOOLEAN, defaultValue: true },

			// ---------------------------------------------------------------------------
			// Profile Card & Notification Visual Customization
			// ---------------------------------------------------------------------------
			levelingBackgroundUrl: { type: DataTypes.TEXT, allowNull: true },
			levelingBorderColor: { type: DataTypes.STRING, allowNull: true },
			levelingBarColor: { type: DataTypes.STRING, allowNull: true },
			levelingUsernameColor: { type: DataTypes.STRING, allowNull: true },
			levelingTagColor: { type: DataTypes.STRING, allowNull: true },
			levelingAccentColor: { type: DataTypes.STRING, allowNull: true },

			// ---------------------------------------------------------------------------
			// Timestamps
			// ---------------------------------------------------------------------------
			createdAt: { type: DataTypes.DATE, allowNull: false },
			updatedAt: { type: DataTypes.DATE, allowNull: false },
		});
	},

	async down(queryInterface) {
		await queryInterface.dropTable('leveling_settings');
	},
};
