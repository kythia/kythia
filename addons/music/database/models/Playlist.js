/**
 * @namespace: addons/music/database/models/Playlist.js
 * @type: Database Model
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { DataTypes } = require('sequelize');

const { KythiaModel } = require('kythia-core');

class Playlist extends KythiaModel {
    static init(sequelize) {
        super.init(
            {
                id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
                userId: { type: DataTypes.STRING, allowNull: false, comment: 'Discord User ID of the playlist owner.' },
                name: { type: DataTypes.STRING, allowNull: false, comment: 'Name of the playlist.' },
                shareCode: { type: DataTypes.STRING, allowNull: true, unique: true, comment: 'Unique code for sharing this playlist.' },
            },
            {
                sequelize,
                modelName: 'Playlist',
                tableName: 'playlists',
                timestamps: true,
            }
        );

        return this;
    }
}

module.exports = Playlist;
