/**
 * @namespace: addons/core/database/models/UserAFK.js
 * @type: Database Model
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta
 */

const { DataTypes } = require('sequelize');
const sequelize = require('@src/database/KythiaSequelize');
const KythiaModel = require('@src/database/KythiaModel');

class UserAFK extends KythiaModel {
    static CACHE_KEYS = [['userId', 'guildId']];
    static init(sequelize) {
        super.init(
            {
                userId: { type: DataTypes.STRING, allowNull: false },
                guildId: { type: DataTypes.STRING, allowNull: false },
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

UserAFK.init(sequelize);

module.exports = UserAFK;
