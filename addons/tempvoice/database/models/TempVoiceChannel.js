/**
 * @namespace: addons/tempvoice/database/models/TempVoiceChannel.js
 * @type: Database Model
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { DataTypes } = require('sequelize');

const { KythiaModel } = require('kythia-core');

class TempVoiceChannel extends KythiaModel {
    static init(sequelize) {
        super.init(
            {
                channelId: {
                    type: DataTypes.STRING,
                    primaryKey: true,
                    allowNull: false,
                },
                guildId: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                ownerId: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                waitingRoomChannelId: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                pendingJoinRequests: {
                    type: DataTypes.JSON,
                    allowNull: true,
                    defaultValue: {},
                },
            },
            {
                sequelize,
                modelName: 'TempVoiceChannel',
                tableName: 'temp_voice_channels',
                timestamps: true,
            }
        );

        return this;
    }
}

module.exports = TempVoiceChannel;
