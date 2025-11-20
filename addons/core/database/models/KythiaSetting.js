/**
 * @namespace: addons/core/database/models/KythiaSetting.js
 * @type: Database Model
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { DataTypes } = require('sequelize');

const { KythiaModel } = require('kythia-core');

class KythiaSetting extends KythiaModel {
    static CACHE_KEYS = [['guildId']];
    static init(sequelize) {
        super.init(
            {},
            {
                sequelize,
                modelName: 'KythiaSetting',
                tableName: 'kythia_settings',
                timestamps: false,
            }
        );

        return this;
    }
}

// KythiaSetting.init(sequelize);

module.exports = KythiaSetting;
