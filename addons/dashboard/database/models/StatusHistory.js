/**
 * @namespace: addons/dashboard/database/models/StatusHistory.js
 * @type: Database Model
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta
 */

const { DataTypes } = require('sequelize');
const sequelize = require('@src/database/KythiaSequelize');
const KythiaModel = require('@src/database/KythiaModel');

class StatusHistory extends KythiaModel {
    static init(sequelize) {
        super.init(
            {
                component: { type: DataTypes.STRING, allowNull: false },
                status: { type: DataTypes.STRING, allowNull: false },
                timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
            },
            {
                sequelize,
                modelName: 'StatusHistory ',
                tableName: 'status_histories',
                timestamps: false,
            }
        );

        return this;
    }
}

StatusHistory.init(sequelize);

module.exports = StatusHistory;
