/**
 * @namespace: addons/core/database/models/KythiaSetting.js
 * @type: Database Model
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta
 */

const { DataTypes } = require('sequelize');
const sequelize = require('@src/database/KythiaSequelize');
const KythiaModel = require('@src/database/KythiaModel');

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

KythiaSetting.init(sequelize);

module.exports = KythiaSetting;
