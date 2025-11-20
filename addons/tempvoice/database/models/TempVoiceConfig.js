/**
 * @namespace: addons/tempvoice/database/models/TempVoiceConfig.js
 * @type: Database Model
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { DataTypes } = require('sequelize');

const { KythiaModel } = require('kythia-core');

class TempVoiceConfig extends KythiaModel {
    static init(sequelize) {
        super.init(
            {
                guildId: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
                triggerChannelId: { type: DataTypes.STRING, allowNull: false },
                controlPanelChannelId: { type: DataTypes.STRING, allowNull: true },
                interfaceMessageId: { type: DataTypes.STRING, allowNull: true },
                categoryId: { type: DataTypes.STRING, allowNull: false },
            },
            {
                sequelize,
                modelName: 'TempVoiceConfig',
                tableName: 'temp_voice_configs',
                timestamps: true,
            }
        );

        return this;
    }
}

module.exports = TempVoiceConfig;
