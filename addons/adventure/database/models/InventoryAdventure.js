/**
 * @namespace: addons/adventure/database/models/InventoryAdventure.js
 * @type: Database Model
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc1
 */

const { DataTypes } = require('sequelize');
const sequelize = require('@src/database/KythiaSequelize');
const KythiaModel = require('@src/database/KythiaModel');

class InventoryAdventure extends KythiaModel {
    static init(sequelize) {
        super.init(
            {
                id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
                guildId: { type: DataTypes.STRING, allowNull: false },
                userId: { type: DataTypes.STRING, allowNull: false },
                itemName: { type: DataTypes.STRING, allowNull: false },
                quantity: { type: DataTypes.INTEGER, defaultValue: 1, allowNull: false },
            },
            {
                sequelize,
                modelName: 'InventoryAdventure',
                tableName: 'inventory_adventures',
                timestamps: false,
            }
        );

        return this;
    }
}

InventoryAdventure.init(sequelize);

module.exports = InventoryAdventure;
