/**
 * @namespace: addons/music/database/models/Music247.js
 * @type: Database Model
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { DataTypes } = require('sequelize');

const { KythiaModel } = require('kythia-core');

class Music247 extends KythiaModel {
    static CACHE_KEYS = [['guildId']];
    static init(sequelize) {
        super.init(
            {
                guildId: { type: DataTypes.STRING, primaryKey: true, allowNull: false, unique: true },
                textChannelId: { type: DataTypes.STRING, allowNull: false },
                voiceChannelId: { type: DataTypes.STRING, allowNull: false },
            },
            {
                sequelize,
                modelName: 'Music247',
                tableName: 'music_247_status',
                timestamps: true,
            }
        );
        return this;
    }
}

module.exports = Music247;
