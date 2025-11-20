/**
 * @namespace: addons/music/database/models/PlaylistTrack.js
 * @type: Database Model
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { DataTypes } = require('sequelize');

const { KythiaModel } = require('kythia-core');
const Playlist = require('./Playlist');

class PlaylistTrack extends KythiaModel {
    static init(sequelize) {
        super.init(
            {
                id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
                playlistId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'playlists', key: 'id' } },
                title: { type: DataTypes.STRING, allowNull: false },
                identifier: { type: DataTypes.STRING, allowNull: false },
                author: { type: DataTypes.STRING, allowNull: false },
                length: { type: DataTypes.BIGINT, allowNull: false },
                uri: { type: DataTypes.STRING, allowNull: false },
            },
            {
                sequelize,
                modelName: 'PlaylistTrack',
                tableName: 'playlist_tracks',
                timestamps: false,
            }
        );

        this.setupParentTouch('playlistId', Playlist, 'updatedAt');

        return this;
    }
}

module.exports = PlaylistTrack;
