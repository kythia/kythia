/**
 * @namespace: addons/music/database/models/Playlist.js
 * @type: Database Model
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc1
 */

const { DataTypes } = require('sequelize');
const sequelize = require('@src/database/KythiaSequelize');
const KythiaModel = require('@src/database/KythiaModel');

class Playlist extends KythiaModel {
    static init(sequelize) {
        super.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    primaryKey: true,
                    autoIncrement: true,
                },
                userId: {
                    type: DataTypes.STRING,
                    allowNull: false,
                    comment: 'Discord User ID of the playlist owner.',
                },
                name: {
                    type: DataTypes.STRING,
                    allowNull: false,
                    comment: 'Name of the playlist.',
                },
                shareCode: {
                    type: DataTypes.STRING,
                    allowNull: true,
                    unique: true,
                    comment: 'Unique code for sharing this playlist.',
                },
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

    static associate(models) {
        this.hasMany(models.PlaylistTrack, {
            foreignKey: 'playlistId',
            as: 'tracks',
            onDelete: 'CASCADE',
        });
    }
}

Playlist.init(sequelize);

module.exports = Playlist;
