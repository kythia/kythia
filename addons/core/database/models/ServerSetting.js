/**
 * @namespace: addons/core/database/models/ServerSetting.js
 * @type: Database Model
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { DataTypes } = require('sequelize');
// koneksi sequelize
const { KythiaModel } = require('kythia-core');

class ServerSetting extends KythiaModel {
    static CACHE_KEYS = [['guildId']];
    static init(sequelize) {
        super.init(
            {
                // GENERAL SETTING
                guildId: { type: DataTypes.STRING, allowNull: false, primaryKey: true },
                guildName: { type: DataTypes.STRING, allowNull: false },
                lang: { type: DataTypes.STRING, defaultValue: 'en' },

                // AUTOMOD
                whitelist: { type: DataTypes.JSON, defaultValue: [] },
                badwords: { type: DataTypes.JSON, defaultValue: [] },
                badwordWhitelist: { type: DataTypes.JSON, defaultValue: [] },
                admins: { type: DataTypes.JSON, defaultValue: [] },
                ignoredChannels: { type: DataTypes.JSON, defaultValue: [] },
                modLogChannelId: { type: DataTypes.STRING },
                auditLogChannelId: { type: DataTypes.STRING },

                // SERVER STATS
                serverStats: { type: DataTypes.JSON, defaultValue: [] },
                serverStatsCategoryId: { type: DataTypes.STRING, allowNull: true },

                // FEATURE ON/OFF
                antiInviteOn: { type: DataTypes.BOOLEAN, defaultValue: false },
                antiLinkOn: { type: DataTypes.BOOLEAN, defaultValue: false },
                antiSpamOn: { type: DataTypes.BOOLEAN, defaultValue: false },
                antiBadwordOn: { type: DataTypes.BOOLEAN, defaultValue: false },
                antiMentionOn: { type: DataTypes.BOOLEAN, defaultValue: false },
                antiAllCapsOn: { type: DataTypes.BOOLEAN, defaultValue: false },
                antiEmojiSpamOn: { type: DataTypes.BOOLEAN, defaultValue: false },
                antiZalgoOn: { type: DataTypes.BOOLEAN, defaultValue: false },
                serverStatsOn: { type: DataTypes.BOOLEAN, defaultValue: false },

                adventureOn: { type: DataTypes.BOOLEAN, defaultValue: false },
                levelingOn: { type: DataTypes.BOOLEAN, defaultValue: false },

                welcomeInOn: { type: DataTypes.BOOLEAN, defaultValue: false },
                welcomeOutOn: { type: DataTypes.BOOLEAN, defaultValue: false },

                minecraftStatsOn: { type: DataTypes.BOOLEAN, defaultValue: false },
                streakOn: { type: DataTypes.BOOLEAN, defaultValue: false },

                invitesOn: { type: DataTypes.BOOLEAN, defaultValue: false },

                rolePrefixOn: { type: DataTypes.BOOLEAN, defaultValue: false },

                boostLogOn: { type: DataTypes.BOOLEAN, defaultValue: false },

                // LEVELING
                levelingChannelId: { type: DataTypes.STRING },
                levelingCooldown: { type: DataTypes.INTEGER, defaultValue: 300 },
                levelingXp: { type: DataTypes.INTEGER, defaultValue: 60 },
                roleRewards: { type: DataTypes.JSON, defaultValue: [] },

                // WELCOMER GLOBAL
                welcomeInChannelId: { type: DataTypes.STRING, allowNull: true },
                welcomeOutChannelId: { type: DataTypes.STRING, allowNull: true },
                welcomeRoleId: { type: DataTypes.STRING, allowNull: true },

                // WELCOME IN
                welcomeInEmbedText: { type: DataTypes.TEXT, allowNull: true },
                welcomeInBannerWidth: { type: DataTypes.INTEGER, defaultValue: 800 },
                welcomeInBannerHeight: { type: DataTypes.INTEGER, defaultValue: 300 },
                welcomeInBackgroundUrl: { type: DataTypes.STRING, allowNull: true },
                welcomeInForegroundUrl: { type: DataTypes.STRING, allowNull: true },
                welcomeInOverlayColor: { type: DataTypes.STRING, defaultValue: 'rgba(0,0,0,0.4)' }, // Contoh: 'rgba(0,0,0,0.4)' atau '#000000'

                welcomeInAvatarEnabled: { type: DataTypes.BOOLEAN, defaultValue: true },
                welcomeInAvatarSize: { type: DataTypes.INTEGER, defaultValue: 128 },
                welcomeInAvatarShape: { type: DataTypes.ENUM('circle', 'square'), defaultValue: 'circle' },
                welcomeInAvatarYOffset: { type: DataTypes.INTEGER, defaultValue: -20 },
                welcomeInAvatarBorderWidth: { type: DataTypes.INTEGER, defaultValue: 4 },
                welcomeInAvatarBorderColor: { type: DataTypes.STRING, defaultValue: '#FFFFFF' },

                welcomeInMainTextContent: { type: DataTypes.TEXT, defaultValue: 'WELCOMEIn, {username}!' },
                welcomeInMainTextFont: { type: DataTypes.STRING, defaultValue: 'bold 42px Poppins-Bold' },
                welcomeInMainTextFontFamily: { type: DataTypes.STRING, defaultValue: 'Poppins-Bold' },
                welcomeInMainTextColor: { type: DataTypes.STRING, defaultValue: '#FFFFFF' },
                welcomeInMainTextYOffset: { type: DataTypes.INTEGER, defaultValue: -80 },

                welcomeInSubTextContent: { type: DataTypes.TEXT, defaultValue: 'You are the #{memberCount} member' },
                welcomeInSubTextFont: { type: DataTypes.STRING, defaultValue: '32px Poppins-Bold' },
                welcomeInSubTextFontFamily: { type: DataTypes.STRING, defaultValue: 'Poppins-Bold' },
                welcomeInSubTextColor: { type: DataTypes.STRING, defaultValue: '#FFFFFF' },
                welcomeInSubTextYOffset: { type: DataTypes.INTEGER, defaultValue: 100 },

                welcomeInShadowColor: { type: DataTypes.STRING, defaultValue: 'rgba(0,0,0,0.5)' },
                welcomeInShadowBlur: { type: DataTypes.INTEGER, defaultValue: 5 },

                welcomeInBorderColor: { type: DataTypes.STRING, defaultValue: '#FFFFFF' },
                welcomeInBorderWidth: { type: DataTypes.INTEGER, defaultValue: 4 },

                welcomeInExtraDraw: { type: DataTypes.STRING, defaultValue: 'classicCentered' },

                // WELCOME OUT (mirror of WELCOME IN)
                welcomeOutEmbedText: { type: DataTypes.TEXT, allowNull: true },
                welcomeOutBannerWidth: { type: DataTypes.INTEGER, defaultValue: 800 },
                welcomeOutBannerHeight: { type: DataTypes.INTEGER, defaultValue: 300 },
                welcomeOutBackgroundUrl: { type: DataTypes.STRING, allowNull: true },
                welcomeOutForegroundUrl: { type: DataTypes.STRING, allowNull: true },
                welcomeOutOverlayColor: { type: DataTypes.STRING, defaultValue: 'rgba(0,0,0,0.4)' },

                welcomeOutAvatarEnabled: { type: DataTypes.BOOLEAN, defaultValue: true },
                welcomeOutAvatarSize: { type: DataTypes.INTEGER, defaultValue: 128 },
                welcomeOutAvatarShape: { type: DataTypes.ENUM('circle', 'square'), defaultValue: 'circle' },
                welcomeOutAvatarYOffset: { type: DataTypes.INTEGER, defaultValue: -20 },
                welcomeOutAvatarBorderWidth: { type: DataTypes.INTEGER, defaultValue: 4 },
                welcomeOutAvatarBorderColor: { type: DataTypes.STRING, defaultValue: '#FFFFFF' },

                welcomeOutMainTextContent: { type: DataTypes.TEXT, defaultValue: 'Goodbye, {username}!' },
                welcomeOutMainTextFont: { type: DataTypes.STRING, defaultValue: 'bold 42px Poppins-Bold' },
                welcomeOutMainTextFontFamily: { type: DataTypes.STRING, defaultValue: 'Poppins-Bold' },
                welcomeOutMainTextColor: { type: DataTypes.STRING, defaultValue: '#FFFFFF' },
                welcomeOutMainTextYOffset: { type: DataTypes.INTEGER, defaultValue: -80 },

                welcomeOutSubTextContent: { type: DataTypes.TEXT, defaultValue: 'We hope to see you again' },
                welcomeOutSubTextFont: { type: DataTypes.STRING, defaultValue: '32px Poppins-Bold' },
                welcomeOutSubTextFontFamily: { type: DataTypes.STRING, defaultValue: 'Poppins-Bold' },
                welcomeOutSubTextColor: { type: DataTypes.STRING, defaultValue: '#FFFFFF' },
                welcomeOutSubTextYOffset: { type: DataTypes.INTEGER, defaultValue: 100 },

                welcomeOutShadowColor: { type: DataTypes.STRING, defaultValue: 'rgba(0,0,0,0.5)' },
                welcomeOutShadowBlur: { type: DataTypes.INTEGER, defaultValue: 5 },

                welcomeOutBorderColor: { type: DataTypes.STRING, defaultValue: '#FFFFFF' },
                welcomeOutBorderWidth: { type: DataTypes.INTEGER, defaultValue: 4 },

                welcomeOutExtraDraw: { type: DataTypes.STRING, defaultValue: 'classicCentered' },

                // MINECRAFT
                minecraftIp: { type: DataTypes.STRING, allowNull: true },
                minecraftPort: { type: DataTypes.INTEGER, allowNull: true },

                minecraftIpChannelId: { type: DataTypes.STRING, allowNull: true },
                minecraftPortChannelId: { type: DataTypes.STRING, allowNull: true },
                minecraftStatusChannelId: { type: DataTypes.STRING, allowNull: true },
                minecraftPlayersChannelId: { type: DataTypes.STRING, allowNull: true },

                // AI
                aiChannelIds: { type: DataTypes.JSON, defaultValue: [] },

                // Testimony
                testimonyChannelId: { type: DataTypes.STRING, allowNull: true },
                feedbackChannelId: { type: DataTypes.STRING, allowNull: true },
                testimonyCount: { type: DataTypes.BIGINT, defaultValue: 0 },
                testimonyCountFormat: { type: DataTypes.STRING, allowNull: true }, // testimony-{count} || {count}-testi
                testimonyCountChannelId: { type: DataTypes.STRING, allowNull: true },

                // STORE
                openCloseType: {
                    type: DataTypes.ENUM('channelname', 'channelmessage', 'channelnameandmessage'),
                    allowNull: true,
                },
                openCloseChannelId: { type: DataTypes.STRING, allowNull: true },
                openChannelNameFormat: { type: DataTypes.STRING, allowNull: true },
                closeChannelNameFormat: { type: DataTypes.STRING, allowNull: true },
                openChannelMessageFormat: { type: DataTypes.JSON, defaultValue: [] },
                closeChannelMessageFormat: { type: DataTypes.JSON, defaultValue: [] },

                // STREAK
                streakRoleRewards: { type: DataTypes.JSON, defaultValue: [] },
                streakEmoji: { type: DataTypes.STRING, defaultValue: '🔥' },
                streakMinimum: { type: DataTypes.INTEGER, defaultValue: 3 },

                announcementChannelId: { type: DataTypes.STRING, allowNull: true },
                inviteChannelId: { type: DataTypes.STRING, allowNull: true },

                boostLogChannelId: { type: DataTypes.STRING, allowNull: true },
                boostLogMessage: { type: DataTypes.TEXT, allowNull: true },
            },
            {
                sequelize,
                modelName: 'ServerSetting',
                tableName: 'server_settings',
                timestamps: false,
            }
        );

        return this;
    }
}

// ServerSetting.init(sequelize);

module.exports = ServerSetting;
