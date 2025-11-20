/**
 * @namespace: addons/core/database/models/Embed.js
 * @type: Database Model
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { DataTypes } = require('sequelize');

const { KythiaModel } = require('kythia-core');

class Embed extends KythiaModel {
    static init(sequelize) {
        super.init(
            {
                guildId: { type: DataTypes.STRING, allowNull: false },
                channelId: { type: DataTypes.STRING, allowNull: false },
                messageId: { type: DataTypes.STRING, allowNull: true },

                title: { type: DataTypes.STRING, allowNull: true },
                description: { type: DataTypes.TEXT, allowNull: false },
                buttons: { type: DataTypes.JSON, defaultValue: '[]' },
                fields: { type: DataTypes.JSON, defaultValue: '[]' },
            },
            {
                sequelize,
                modelName: 'Embed',
                tableName: 'embeds',
                timestamps: false,
            }
        );

        return this;
    }
}

// Embed.init(sequelize);

module.exports = Embed;
