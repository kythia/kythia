/**
 * @namespace: addons/core/database/models/UserAFK.js
 * @type: Database Model
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { DataTypes } = require('sequelize');

const { KythiaModel } = require('kythia-core');

class UserAFK extends KythiaModel {
    static CACHE_KEYS = [['userId', 'guildId']];
    static init(sequelize) {
        super.init(
            {
                userId: { type: DataTypes.STRING, allowNull: false },
                reason: { type: DataTypes.STRING, allowNull: false, defaultValue: 'No reason provided.' },
                timestamp: { type: DataTypes.DATE, allowNull: false },
            },
            {
                sequelize,
                modelName: 'UserAFK',
                tableName: 'user_afks',
                timestamps: false,
            }
        );

        return this;
    }
}

// UserAFK.init(sequelize);

module.exports = UserAFK;
