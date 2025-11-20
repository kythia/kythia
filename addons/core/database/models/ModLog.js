/**
 * @namespace: addons/core/database/models/ModLog.js
 * @type: Database Model
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { DataTypes } = require('sequelize');

const { KythiaModel } = require('kythia-core');

class ModLog extends KythiaModel {
    static CACHE_KEYS = [['guildId']];
    static init(sequelize) {
        super.init(
            {
                guildId: { type: DataTypes.STRING, allowNull: false },
                moderatorId: { type: DataTypes.STRING, allowNull: false },
                moderatorTag: { type: DataTypes.STRING, allowNull: false },
                targetId: { type: DataTypes.STRING, allowNull: false },
                targetTag: { type: DataTypes.STRING, allowNull: false },
                action: { type: DataTypes.STRING, allowNull: false },
                reason: { type: DataTypes.TEXT, allowNull: true },
                channelId: { type: DataTypes.STRING, allowNull: true },
            },
            {
                sequelize,
                modelName: 'ModLog',
                tableName: 'modlogs',
                timestamps: true,
            }
        );

        return this;
    }
}

// ModLog.init(sequelize);

module.exports = ModLog;
