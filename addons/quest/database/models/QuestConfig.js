/**
 * @namespace: addons/quest/database/models/QuestConfig.js
 * @type: Database Model
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */
const { DataTypes } = require('sequelize');

const { KythiaModel } = require('kythia-core');

class QuestConfig extends KythiaModel {
    static init(sequelize) {
        super.init(
            {
                guildId: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
                channelId: { type: DataTypes.STRING, allowNull: false },
                roleId: { type: DataTypes.STRING, allowNull: true },
            },
            {
                sequelize,
                modelName: 'QuestConfig',
                tableName: 'quest_configs',
                timestamps: true,
            }
        );
        return this;
    }
}

module.exports = QuestConfig;
