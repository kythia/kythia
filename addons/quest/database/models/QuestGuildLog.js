/**
 * @namespace: addons/quest/database/models/QuestGuildLog.js
 * @type: Database Model
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */
const { DataTypes } = require('sequelize');

const { KythiaModel } = require('kythia-core');

class QuestGuildLog extends KythiaModel {
    static init(sequelize) {
        super.init(
            {
                id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
                guildId: { type: DataTypes.STRING, allowNull: false },
                questId: { type: DataTypes.STRING, allowNull: false },
                sentAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
            },
            {
                sequelize,
                modelName: 'QuestGuildLog',
                tableName: 'quest_guild_logs',
                timestamps: false,
                indexes: [
                    {
                        unique: true,
                        fields: ['guildId', 'questId'],
                    },
                ],
            }
        );
        return this;
    }
}

module.exports = QuestGuildLog;
