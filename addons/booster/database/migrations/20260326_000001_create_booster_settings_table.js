/**
 * @namespace: addons/booster/database/migrations/20260326_000001_create_booster_settings_table.js
 * @type: Database Migration
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = {
	async up(queryInterface, DataTypes) {
		await queryInterface.createTable('booster_settings', {
			guildId: {
				type: DataTypes.STRING,
				allowNull: false,
				primaryKey: true,
			},

			// ── Feature toggles ──────────────────────────────────────
			boosterOn: { type: DataTypes.BOOLEAN, defaultValue: false },

			// ── Shared ───────────────────────────────────────────────
			boosterChannelId: { type: DataTypes.STRING, allowNull: true },

			// ── Booster text ───────────────────────────────────────
			boosterEmbedText: { type: DataTypes.TEXT, allowNull: true },
			boosterEmbedColor: { type: DataTypes.STRING, allowNull: true },

			// ── Booster banner ────────────────────────────────────
			boosterBannerWidth: { type: DataTypes.INTEGER, allowNull: true },
			boosterBannerHeight: { type: DataTypes.INTEGER, allowNull: true },
			boosterBackgroundUrl: { type: DataTypes.STRING, allowNull: true },
			boosterForegroundUrl: { type: DataTypes.STRING, allowNull: true },
			boosterOverlayColor: { type: DataTypes.STRING, allowNull: true },

			boosterAvatarEnabled: { type: DataTypes.BOOLEAN, defaultValue: true },
			boosterAvatarSize: { type: DataTypes.INTEGER, allowNull: true },
			boosterAvatarShape: {
				type: DataTypes.ENUM('circle', 'square'),
				allowNull: true,
			},
			boosterAvatarYOffset: { type: DataTypes.INTEGER, allowNull: true },
			boosterAvatarBorderWidth: { type: DataTypes.INTEGER, allowNull: true },
			boosterAvatarBorderColor: { type: DataTypes.STRING, allowNull: true },

			boosterMainTextContent: { type: DataTypes.TEXT, allowNull: true },
			boosterMainTextFontFamily: { type: DataTypes.STRING, allowNull: true },
			boosterMainTextFontWeight: { type: DataTypes.STRING, allowNull: true },
			boosterMainTextColor: { type: DataTypes.STRING, allowNull: true },
			boosterMainTextYOffset: { type: DataTypes.INTEGER, allowNull: true },

			boosterSubTextContent: { type: DataTypes.TEXT, allowNull: true },
			boosterSubTextColor: { type: DataTypes.STRING, allowNull: true },
			boosterSubTextYOffset: { type: DataTypes.INTEGER, allowNull: true },

			boosterBorderColor: { type: DataTypes.STRING, allowNull: true },
			boosterBorderWidth: { type: DataTypes.INTEGER, allowNull: true },
			boosterShadowColor: { type: DataTypes.STRING, allowNull: true },

			/**
			 * Components V2 layout config for the booster message.
			 * When null → use Components V2 card (default).
			 * When set to `{ style: 'plain-text' }` → send plain text only.
			 */
			boosterLayout: {
				type: DataTypes.JSON,
				allowNull: true,
				defaultValue: null,
				comment:
					'Components V2 layout config for booster (null = CV2 card default)',
			},

			// ── Timestamps ───────────────────────────────────────────
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
		await queryInterface.dropTable('booster_settings');
	},
};
