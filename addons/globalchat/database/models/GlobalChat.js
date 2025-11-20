/**
 * @namespace: addons/globalchat/database/models/GlobalChat.js
 * @type: Database Model
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { DataTypes } = require('sequelize');

const { KythiaModel } = require('kythia-core');

class GlobalChat extends KythiaModel {
    static init(sequelize) {
        super.init(
            {
                guildId: { type: DataTypes.STRING, allowNull: false, primaryKey: true },
                globalChannelId: { type: DataTypes.STRING, allowNull: true },
                webhookId: { type: DataTypes.STRING, allowNull: true },
                webhookToken: { type: DataTypes.STRING, allowNull: true },
            },
            {
                sequelize,
                modelName: 'GlobalChat',
                tableName: 'global_chats',
                timestamps: true,
            }
        );

        return this;
    }
}

// GlobalChat.init(sequelize);

module.exports = GlobalChat;
