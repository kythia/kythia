/**
 * @namespace: addons/core/database/models/User.js
 * @type: Database Model
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { DataTypes } = require('sequelize');

const { KythiaModel } = require('kythia-core');

class User extends KythiaModel {
    static CACHE_KEYS = [['userId', 'guildId']];
    static customInvalidationTags = ['User:leaderboard'];
    static init(sequelize) {
        super.init(
            {
                guildId: { type: DataTypes.STRING, allowNull: false },
                userId: { type: DataTypes.STRING, allowNull: false },

                level: { type: DataTypes.INTEGER, defaultValue: 1 },
                xp: { type: DataTypes.INTEGER, defaultValue: 1 },
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

// User.init(sequelize);

module.exports = User;
