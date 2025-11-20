/**
 * @namespace: addons/core/database/models/Snipe.js
 * @type: Database Model
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { DataTypes } = require('sequelize');

const { KythiaModel } = require('kythia-core');

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

// Snipe.init(sequelize);

module.exports = Snipe;
