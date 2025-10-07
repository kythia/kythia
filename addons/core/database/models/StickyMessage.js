/**
 * @namespace: addons/core/database/models/StickyMessage.js
 * @type: Database Model
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc1
 */

const { DataTypes } = require('sequelize');
const sequelize = require('@src/database/KythiaSequelize');
const KythiaModel = require('@src/database/KythiaModel');

class StickyMessage extends KythiaModel {
    static CACHE_KEYS = [['channelId']];
    static init(sequelize) {
        super.init(
            {
                channelId: { type: DataTypes.STRING, allowNull: false },
                message: { type: DataTypes.STRING, allowNull: false },
                messageId: { type: DataTypes.STRING, allowNull: true },
            },
            {
                sequelize,
                modelName: 'StickyMessage',
                tableName: 'sticky_messages',
                timestamps: false,
            }
        );

        return this;
    }
}

StickyMessage.init(sequelize);

module.exports = StickyMessage;
