/**
 * @namespace: addons/core/database/models/Inventory.js
 * @type: Database Model
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta
 */

const { DataTypes } = require('sequelize');
const sequelize = require('@src/database/KythiaSequelize');
const KythiaModel = require('@src/database/KythiaModel');

class Inventory extends KythiaModel {
    static CACHE_KEYS = [['userId', 'guildId']];
    static init(sequelize) {
        super.init(
            {
                guildId: { type: DataTypes.STRING, allowNull: false },
                userId: { type: DataTypes.STRING, allowNull: false },
                itemName: { type: DataTypes.STRING, allowNull: false },
            },
            {
                sequelize,
                modelName: 'Inventory',
                tableName: 'inventories',
                timestamps: false,
            }
        );

        return this;
    }
}

Inventory.init(sequelize);

module.exports = Inventory;
