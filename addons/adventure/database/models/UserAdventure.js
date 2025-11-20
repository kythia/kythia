/**
 * @namespace: addons/adventure/database/models/UserAdventure.js
 * @type: Database Model
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { DataTypes } = require('sequelize');
const { KythiaModel } = require('kythia-core');

class UserAdventure extends KythiaModel {
    static init(sequelize) {
        super.init(
            {
                userId: { type: DataTypes.STRING, allowNull: false },
                level: { type: DataTypes.INTEGER, defaultValue: 1 },
                xp: { type: DataTypes.INTEGER, defaultValue: 0 },
                hp: { type: DataTypes.INTEGER, defaultValue: 100 },
                maxHp: { type: DataTypes.INTEGER, defaultValue: 100 },
                gold: { type: DataTypes.INTEGER, defaultValue: 50 },
                strength: { type: DataTypes.INTEGER, defaultValue: 10 },
                defense: { type: DataTypes.INTEGER, defaultValue: 5 },
                characterId: { type: DataTypes.STRING, allowNull: true },
                monsterName: { type: DataTypes.STRING, defaultValue: null },
                monsterHp: { type: DataTypes.INTEGER, defaultValue: 0 },
                monsterStrength: { type: DataTypes.INTEGER, defaultValue: 0 },
                monsterGoldDrop: { type: DataTypes.INTEGER, defaultValue: 0 },
                monsterXpDrop: { type: DataTypes.INTEGER, defaultValue: 0 },
            },
            {
                sequelize,
                modelName: 'UserAdventure',
                tableName: 'user_adventures',
                timestamps: false,
            }
        );

        return this;
    }
}

module.exports = UserAdventure;
