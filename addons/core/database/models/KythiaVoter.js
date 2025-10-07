/**
 * @namespace: addons/core/database/models/KythiaVoter.js
 * @type: Database Model
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc1
 */

const { DataTypes } = require('sequelize');
const sequelize = require('@src/database/KythiaSequelize');
const KythiaModel = require('@src/database/KythiaModel');

class KythiaVoter extends KythiaModel {
    static init(sequelize) {
        super.init(
            {
                userId: { type: DataTypes.STRING, allowNull: false, primaryKey: true },
                votedAt: { type: DataTypes.DATE, allowNull: false },
            },
            {
                sequelize,
                modelName: 'KythiaVoter',
                tableName: 'kythia_voters',
                timestamps: false,
            }
        );

        return this;
    }
}

KythiaVoter.init(sequelize);

module.exports = KythiaVoter;
