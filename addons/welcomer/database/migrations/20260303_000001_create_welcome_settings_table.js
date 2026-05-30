/**
 * @namespace: addons/welcomer/database/migrations/20260303_000001_create_welcome_settings_table.js
 * @type: Database Migration
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = {
	async up(queryInterface, DataTypes) {
		await queryInterface.createTable('welcome_settings', {
			guildId: {
				type: DataTypes.STRING,
				allowNull: false,
				primaryKey: true,
			},

			// ── Feature toggles ──────────────────────────────────────
			welcomeInOn: { type: DataTypes.BOOLEAN, defaultValue: false },
			welcomeOutOn: { type: DataTypes.BOOLEAN, defaultValue: false },
			welcomeDmOn: { type: DataTypes.BOOLEAN, defaultValue: false },

			// ── Shared ───────────────────────────────────────────────
			welcomeRoleId: { type: DataTypes.STRING, allowNull: true },
			welcomeInChannelId: { type: DataTypes.STRING, allowNull: true },
			welcomeOutChannelId: { type: DataTypes.STRING, allowNull: true },

			// ── Welcome-in text ───────────────────────────────────────
			welcomeInEmbedText: { type: DataTypes.TEXT, allowNull: true },
			welcomeInEmbedColor: { type: DataTypes.STRING, allowNull: true },

			// ── Welcome-in banner ────────────────────────────────────
			welcomeInBannerWidth: { type: DataTypes.INTEGER, allowNull: true },
			welcomeInBannerHeight: { type: DataTypes.INTEGER, allowNull: true },
			welcomeInBackgroundUrl: { type: DataTypes.STRING, allowNull: true },
			welcomeInForegroundUrl: { type: DataTypes.STRING, allowNull: true },
			welcomeInOverlayColor: { type: DataTypes.STRING, allowNull: true },

			welcomeInAvatarEnabled: { type: DataTypes.BOOLEAN, defaultValue: true },
			welcomeInAvatarSize: { type: DataTypes.INTEGER, allowNull: true },
			welcomeInAvatarShape: {
				type: DataTypes.ENUM('circle', 'square'),
				allowNull: true,
			},
			welcomeInAvatarYOffset: { type: DataTypes.INTEGER, allowNull: true },
			welcomeInAvatarBorderWidth: { type: DataTypes.INTEGER, allowNull: true },
			welcomeInAvatarBorderColor: { type: DataTypes.STRING, allowNull: true },

			welcomeInMainTextContent: { type: DataTypes.TEXT, allowNull: true },
			welcomeInMainTextFontFamily: { type: DataTypes.STRING, allowNull: true },
			welcomeInMainTextFontWeight: { type: DataTypes.STRING, allowNull: true },
			welcomeInMainTextColor: { type: DataTypes.STRING, allowNull: true },
			welcomeInMainTextYOffset: { type: DataTypes.INTEGER, allowNull: true },

			welcomeInSubTextContent: { type: DataTypes.TEXT, allowNull: true },
			welcomeInSubTextColor: { type: DataTypes.STRING, allowNull: true },
			welcomeInSubTextYOffset: { type: DataTypes.INTEGER, allowNull: true },

			welcomeInBorderColor: { type: DataTypes.STRING, allowNull: true },
			welcomeInBorderWidth: { type: DataTypes.INTEGER, allowNull: true },
			welcomeInShadowColor: { type: DataTypes.STRING, allowNull: true },

			/**
			 * Components V2 layout config for the welcome-in message.
			 * When null → use Components V2 card (default).
			 * When set to `{ style: 'plain-text' }` → send plain text only.
			 * Future: full Components V2 embed-builder payload.
			 *
			 * Same pattern as reaction_role_panels.layout.
			 */
			welcomeInLayout: {
				type: DataTypes.JSON,
				allowNull: true,
				defaultValue: null,
				comment:
					'Components V2 layout config for welcome-in (null = CV2 card default)',
			},

			// ── Welcome-out text ──────────────────────────────────────
			welcomeOutEmbedText: { type: DataTypes.TEXT, allowNull: true },
			welcomeOutEmbedColor: { type: DataTypes.STRING, allowNull: true },

			// ── Welcome-out banner ───────────────────────────────────
			welcomeOutBannerWidth: { type: DataTypes.INTEGER, allowNull: true },
			welcomeOutBannerHeight: { type: DataTypes.INTEGER, allowNull: true },
			welcomeOutBackgroundUrl: { type: DataTypes.STRING, allowNull: true },
			welcomeOutForegroundUrl: { type: DataTypes.STRING, allowNull: true },
			welcomeOutOverlayColor: { type: DataTypes.STRING, allowNull: true },

			welcomeOutAvatarEnabled: { type: DataTypes.BOOLEAN, defaultValue: true },
			welcomeOutAvatarSize: { type: DataTypes.INTEGER, allowNull: true },
			welcomeOutAvatarShape: {
				type: DataTypes.ENUM('circle', 'square'),
				allowNull: true,
			},
			welcomeOutAvatarYOffset: { type: DataTypes.INTEGER, allowNull: true },
			welcomeOutAvatarBorderWidth: { type: DataTypes.INTEGER, allowNull: true },
			welcomeOutAvatarBorderColor: { type: DataTypes.STRING, allowNull: true },

			welcomeOutMainTextContent: { type: DataTypes.TEXT, allowNull: true },
			welcomeOutMainTextFontFamily: { type: DataTypes.STRING, allowNull: true },
			welcomeOutMainTextFontWeight: { type: DataTypes.STRING, allowNull: true },
			welcomeOutMainTextColor: { type: DataTypes.STRING, allowNull: true },
			welcomeOutMainTextYOffset: { type: DataTypes.INTEGER, allowNull: true },

			welcomeOutSubTextContent: { type: DataTypes.TEXT, allowNull: true },
			welcomeOutSubTextColor: { type: DataTypes.STRING, allowNull: true },
			welcomeOutSubTextYOffset: { type: DataTypes.INTEGER, allowNull: true },

			welcomeOutBorderColor: { type: DataTypes.STRING, allowNull: true },
			welcomeOutBorderWidth: { type: DataTypes.INTEGER, allowNull: true },

			/**
			 * Components V2 layout config for the welcome-out message.
			 * Same pattern as welcomeInLayout above.
			 */
			welcomeOutLayout: {
				type: DataTypes.JSON,
				allowNull: true,
				defaultValue: null,
				comment:
					'Components V2 layout config for welcome-out (null = CV2 card default)',
			},

			// ── Welcome DM ───────────────────────────────────────────
			welcomeDmText: { type: DataTypes.TEXT, allowNull: true },

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
		await queryInterface.dropTable('welcome_settings');
	},
};
