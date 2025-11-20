/**
 * @namespace: addons/core/database/models/Inventory.js
 * @type: Database Model
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { DataTypes } = require('sequelize');

const { KythiaModel } = require('kythia-core');

class Inventory extends KythiaModel {
    static CACHE_KEYS = [['userId']];
    static init(sequelize) {
        super.init(
            {
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

// Inventory.init(sequelize);

module.exports = Inventory;
