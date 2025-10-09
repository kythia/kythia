/**
 * @namespace: addons/core/database/models/KythiaUser.js
 * @type: Database Model
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc.1
 */

const { DataTypes } = require('sequelize');
const sequelize = require('@src/database/KythiaSequelize');
const KythiaModel = require('@src/database/KythiaModel');

class KythiaUser extends KythiaModel {
    static CACHE_KEYS = [['userId']];
    static init(sequelize) {
        super.init(
            {
                userId: { type: DataTypes.STRING, allowNull: false, primaryKey: true },

                isPremium: { type: DataTypes.BOOLEAN, defaultValue: false },
                premiumType: { type: DataTypes.ENUM('personal', 'server'), defaultValue: 'personal' },
                premiumServerIds: { type: DataTypes.JSON, allowNull: true },
                premiumExpiresAt: { type: DataTypes.DATE, defaultValue: null },

                kythiaCoin: { type: DataTypes.INTEGER, defaultValue: 0 },
                kythiaRuby: { type: DataTypes.INTEGER, defaultValue: 0 },

                nsfwCount: { type: DataTypes.INTEGER, defaultValue: 0 },
                nsfwFav: { type: DataTypes.JSON, defaultValue: [] },
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

KythiaUser.init(sequelize);

module.exports = KythiaUser;
