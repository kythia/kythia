/**
 * @namespace: addons/pet/database/models/Pet.js
 * @type: Database Model
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc.1
 */

const { DataTypes } = require('sequelize');
const sequelize = require('@src/database/KythiaSequelize');
const KythiaModel = require('@src/database/KythiaModel');

class Pet extends KythiaModel {
    static init(sequelizeInstance) {
        super.init(
            {
                name: { type: DataTypes.STRING, allowNull: false },
                icon: { type: DataTypes.STRING, allowNull: false },
                rarity: {
                    type: DataTypes.ENUM('common', 'rare', 'epic', 'legendary'),
                    defaultValue: 'common',
                },
                bonusType: { type: DataTypes.ENUM('xp', 'money'), defaultValue: 'xp' },
                bonusValue: { type: DataTypes.INTEGER, defaultValue: 10 },
            },
            {
                sequelize: sequelizeInstance,
                modelName: 'Pet',
                tableName: 'pets',
                timestamps: false,
            }
        );

        return this;
    }

    static associate(models) {
        this.hasMany(models.UserPet, { foreignKey: 'petId', as: 'userPets' });
    }
}

// Properly initialize the model with the imported sequelize instance
Pet.init(sequelize);

module.exports = Pet;
