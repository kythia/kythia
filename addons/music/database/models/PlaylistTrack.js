/**
 * @namespace: addons/music/database/models/PlaylistTrack.js
 * @type: Database Model
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc1
 */

const { DataTypes } = require('sequelize');
const sequelize = require('@src/database/KythiaSequelize');
const KythiaModel = require('@src/database/KythiaModel');
const logger = require('@utils/logger');
const Playlist = require('./Playlist');

class PlaylistTrack extends KythiaModel {
    static init(sequelize) {
        super.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    primaryKey: true,
                    autoIncrement: true,
                },
                playlistId: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    references: {
                        model: 'playlists',
                        key: 'id',
                    },
                },
                title: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                identifier: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                author: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                length: {
                    type: DataTypes.BIGINT,
                    allowNull: false,
                },
                uri: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
            },
            {
                sequelize,
                modelName: 'PlaylistTrack',
                tableName: 'playlist_tracks',
                timestamps: false,
                hooks: {
                    afterSave: (track, options) => {
                        this.touchParentPlaylist(track);
                    },
                    afterDestroy: (track, options) => {
                        this.touchParentPlaylist(track);
                    },
                    afterBulkCreate: (tracks, options) => {
                        if (tracks.length > 0) {
                            this.touchParentPlaylist(tracks[0]);
                        }
                    },
                },
            }
        );

        return this;
    }

    static associate(models) {
        this.belongsTo(models.Playlist, {
            foreignKey: 'playlistId',
            as: 'playlist',
            onDelete: 'CASCADE',
        });
    }

    static async touchParentPlaylist(trackInstance) {
        if (!trackInstance || !trackInstance.playlistId) return;

        try {
            const playlist = await Playlist.findByPk(trackInstance.playlistId);
            if (playlist) {
                playlist.changed('updatedAt', true);

                await playlist.save({ fields: ['updatedAt'] });
                logger.info(`🗑️ Touched parent Playlist #${playlist.id} due to change in PlaylistTrack.`);
            }
        } catch (e) {
            logger.error('🗑️ Failed to touch parent playlist', e);
        }
    }
}

PlaylistTrack.init(sequelize);

module.exports = PlaylistTrack;
