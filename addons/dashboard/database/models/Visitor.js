/**
 * @namespace: addons/dashboard/database/models/Visitor.js
 * @type: Database Model
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta
 */

const { DataTypes } = require('sequelize');
const sequelize = require('@src/database/KythiaSequelize');
const KythiaModel = require('@src/database/KythiaModel');

class Visitor extends KythiaModel {
    static init(sequelize) {
        super.init(
            {
                id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
                ipHash: { type: DataTypes.STRING, allowNull: false },
                visitDate: { type: DataTypes.DATEONLY },
            },
            {
                sequelize,
                modelName: 'Visitor',
                tableName: 'visitors',
                timestamps: false,
                indexes: [
                    {
                        unique: true,
                        fields: ['ipHash', 'visitDate'],
                    },
                ],
            }
        );

        return this;
    }
}

Visitor.init(sequelize);

module.exports = Visitor;
