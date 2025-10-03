/**
 * @namespace: addons/checklist/database/models/Checklist.js
 * @type: Database Model
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta
 */

const { DataTypes } = require('sequelize');
const sequelize = require('@src/database/KythiaSequelize');
const KythiaModel = require('@src/database/KythiaModel');

class Checklist extends KythiaModel {
    static CACHE_KEYS = [['guildId', 'userId']];
    static init(sequelize) {
        super.init(
            {
                guildId: { type: DataTypes.STRING, allowNull: true },
                userId: { type: DataTypes.STRING, allowNull: true },
                items: { type: DataTypes.JSON, allowNull: false, defaultValue: '[]' }, // JSON string of checklist items
            },
            {
                sequelize,
                modelName: 'Checklist',
                tableName: 'checklists',
                timestamps: false,
            }
        );

        return this;
    }
}

Checklist.init(sequelize);

module.exports = Checklist;
