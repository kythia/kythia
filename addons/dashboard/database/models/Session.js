/**
 * @namespace: addons/dashboard/database/models/Session.js
 * @type: Database Model
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc1
 */

const { DataTypes } = require('sequelize');
const sequelize = require('@src/database/KythiaSequelize');
const KythiaModel = require('@src/database/KythiaModel');

class Session extends KythiaModel {
    static init(sequelize) {
        super.init(
            {
                sid: {
                    type: DataTypes.STRING,
                    primaryKey: true,
                },
                expires: DataTypes.DATE,
                data: DataTypes.TEXT,
            },
            {
                sequelize,
                modelName: 'Session',
                tableName: 'sessions',
                timestamps: true,
            }
        );

        return this;
    }
}

Session.init(sequelize);
// Session.initializeCacheHooks();

module.exports = Session;
