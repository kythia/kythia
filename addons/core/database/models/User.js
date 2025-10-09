/**
 * @namespace: addons/core/database/models/User.js
 * @type: Database Model
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc.1
 */

const { DataTypes } = require('sequelize');
const sequelize = require('@src/database/KythiaSequelize');
const KythiaModel = require('@src/database/KythiaModel');

class User extends KythiaModel {
    static CACHE_KEYS = [['userId', 'guildId']];
    static init(sequelize) {
        super.init(
            {
                guildId: { type: DataTypes.STRING, allowNull: false },
                userId: { type: DataTypes.STRING, allowNull: false },

                level: { type: DataTypes.INTEGER, defaultValue: 1 },
                xp: { type: DataTypes.INTEGER, defaultValue: 1 },
                cash: { type: DataTypes.INTEGER, defaultValue: 0 },
                bank: { type: DataTypes.INTEGER, defaultValue: 0 },
                bankType: { type: DataTypes.STRING, defaultValue: 'bca' },
                hackMastered: { type: DataTypes.INTEGER, defaultValue: 10, max: 100 },
                careerMastered: { type: DataTypes.INTEGER, defaultValue: 1, max: 10 },
                lastDaily: { type: DataTypes.DATE, defaultValue: null },
                lastBeg: { type: DataTypes.DATE, defaultValue: null },
                lastLootbox: { type: DataTypes.DATE, defaultValue: null },
                lastWork: { type: DataTypes.DATE, defaultValue: null },
                lastRob: { type: DataTypes.DATE, defaultValue: null },
                lastHack: { type: DataTypes.DATE, defaultValue: null },
                lastMessage: { type: DataTypes.DATE, defaultValue: null },
                warnings: { type: DataTypes.JSON, defaultValue: '[]' },
            },
            {
                sequelize,
                modelName: 'User',
                tableName: 'users',
                timestamps: false,
            }
        );

        return this;
    }
}

User.init(sequelize);

module.exports = User;
