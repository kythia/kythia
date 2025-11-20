/**
 * @namespace: addons/core/database/models/KythiaTeam.js
 * @type: Database Model
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { DataTypes } = require('sequelize');

const { KythiaModel } = require('kythia-core');

class KythiaTeam extends KythiaModel {
    static init(sequelize) {
        super.init(
            {
                userId: { type: DataTypes.STRING, allowNull: false },
                name: { type: DataTypes.STRING, allowNull: true },
            },
            {
                sequelize,
                modelName: 'KythiaTeam',
                tableName: 'kythia_teams',
                timestamps: false,
            }
        );

        return this;
    }
}

// KythiaTeam.init(sequelize);

module.exports = KythiaTeam;
