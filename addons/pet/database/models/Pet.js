/**
 * @namespace: addons/pet/database/models/Pet.js
 * @type: Database Model
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { DataTypes } = require('sequelize');

const { KythiaModel } = require('kythia-core');

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
                bonusType: { type: DataTypes.ENUM('coin', 'ruby'), defaultValue: 'coin' },
                bonusValue: { type: DataTypes.INTEGER, defaultValue: 0 },
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

    // static associate(models) {
    //     this.hasMany(models.UserPet, { foreignKey: 'petId', as: 'userPets' });
    // }
}

// Properly initialize the model with the imported sequelize instance
// Pet.init(sequelize);

module.exports = Pet;
