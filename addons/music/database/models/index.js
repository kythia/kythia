/**
 * @namespace: addons/music/database/models/index.js
 * @type: Database Model
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc1
 */

const Playlist = require('./Playlist');
const PlaylistTrack = require('./PlaylistTrack');

const models = {
    Playlist,
    PlaylistTrack,
};

Object.values(models).forEach((model) => {
    if (typeof model.associate === 'function') {
        model.associate(models);
    }
});

module.exports = models;
