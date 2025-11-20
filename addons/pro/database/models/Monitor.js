/**
 * @namespace: addons/pro/database/models/Monitor.js
 * @type: Database Model
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { DataTypes } = require('sequelize');

const { KythiaModel } = require('kythia-core');

class Monitor extends KythiaModel {
    static init(sequelize) {
        super.init(
            {
                userId: {
                    type: DataTypes.STRING,
                    primaryKey: true,
                    allowNull: false,
                    references: {
                        model: 'kythia_users',
                        key: 'userId',
                    },
                },
                urlToPing: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                lastStatus: {
                    type: DataTypes.ENUM('UP', 'DOWN', 'PENDING'),
                    defaultValue: 'PENDING',
                },
            },
            {
                sequelize,
                modelName: 'Monitor',
                tableName: 'monitors',
                timestamps: false,
            }
        );

        return this;
    }
}

module.exports = Monitor;
