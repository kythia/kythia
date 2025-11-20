/**
 * @namespace: addons/core/database/models/KythiaUser.js
 * @type: Database Model
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { DataTypes } = require('sequelize');

const { KythiaModel } = require('kythia-core');

class KythiaUser extends KythiaModel {
    static CACHE_KEYS = [['userId']];
    static customInvalidationTags = ['KythiaUser:leaderboard'];
    static init(sequelize) {
        super.init(
            {
                userId: { type: DataTypes.STRING, allowNull: false, primaryKey: true },

                isPremium: { type: DataTypes.BOOLEAN, defaultValue: false },
                premiumType: { type: DataTypes.ENUM('personal', 'server'), defaultValue: 'personal' },
                premiumServerIds: { type: DataTypes.JSON, allowNull: true },
                premiumExpiresAt: { type: DataTypes.DATE, defaultValue: null },

                kythiaCoin: { type: DataTypes.BIGINT, defaultValue: 0 },
                kythiaRuby: { type: DataTypes.BIGINT, defaultValue: 0 },

                kythiaBank: { type: DataTypes.BIGINT, defaultValue: 0 },
                bankType: { type: DataTypes.STRING, defaultValue: 'solara_mutual' },
                hackMastered: { type: DataTypes.INTEGER, defaultValue: 10, max: 100 },
                careerMastered: { type: DataTypes.INTEGER, defaultValue: 1, max: 10 },
                lastDaily: { type: DataTypes.DATE, defaultValue: null },
                lastBeg: { type: DataTypes.DATE, defaultValue: null },
                lastLootbox: { type: DataTypes.DATE, defaultValue: null },
                lastWork: { type: DataTypes.DATE, defaultValue: null },
                lastRob: { type: DataTypes.DATE, defaultValue: null },
                lastHack: { type: DataTypes.DATE, defaultValue: null },

                votePoints: { type: DataTypes.BIGINT, defaultValue: 0 },
                isVoted: { type: DataTypes.BOOLEAN, defaultValue: false },
                voteExpiresAt: { type: DataTypes.DATE, defaultValue: null },
            },
            {
                sequelize,
                modelName: 'KythiaUser',
                tableName: 'kythia_users',
                timestamps: false,
            }
        );

        return this;
    }
}

// KythiaUser.init(sequelize);

module.exports = KythiaUser;
