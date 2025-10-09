/**
 * @namespace: addons/core/database/models/Snipe.js
 * @type: Database Model
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc.1
 */

const { DataTypes } = require('sequelize');
const sequelize = require('@src/database/KythiaSequelize');
const KythiaModel = require('@src/database/KythiaModel');

class Snipe extends KythiaModel {
    static init(sequelize) {
        super.init(
            {
                guildId: { type: DataTypes.STRING, allowNull: false },
                channelId: { type: DataTypes.STRING, allowNull: false },
                messageId: { type: DataTypes.STRING, allowNull: false },

                authorId: { type: DataTypes.STRING, allowNull: false },
                authorTag: { type: DataTypes.STRING, allowNull: true },
                content: { type: DataTypes.TEXT, allowNull: true },
                deletedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
                attachments: { type: DataTypes.JSON, defaultValue: '[]' },
            },
            {
                sequelize,
                modelName: 'Snipe',
                tableName: 'snipes',
                timestamps: false,
            }
        );

        return this;
    }
}

Snipe.init(sequelize);

module.exports = Snipe;
