/**
 * @namespace: addons/pet/database/models/UserPet.js
 * @type: Database Model
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc1
 */

const { DataTypes } = require('sequelize');
const sequelize = require('@src/database/KythiaSequelize');
const KythiaModel = require('@src/database/KythiaModel');

class UserPet extends KythiaModel {
    static init(sequelizeInstance) {
        super.init(
            {
                userId: { type: DataTypes.STRING, allowNull: false },
                petId: { type: DataTypes.INTEGER, allowNull: false },
                level: { type: DataTypes.INTEGER, defaultValue: 1 },
                petName: { type: DataTypes.STRING, allowNull: false },
                hunger: { type: DataTypes.INTEGER, defaultValue: 100 },
                happiness: { type: DataTypes.INTEGER, defaultValue: 100 },
                lastUse: { type: DataTypes.DATE, defaultValue: null },
                lastGacha: { type: DataTypes.DATE, defaultValue: null },
                isDead: { type: DataTypes.BOOLEAN, defaultValue: false },
            },
            {
                sequelize: sequelizeInstance,
                modelName: 'UserPet',
                tableName: 'user_pets',
                timestamps: false,
            }
        );

        return this;
    }

    static associate(models) {
        this.belongsTo(models.Pet, { foreignKey: 'petId', as: 'pet' });
    }
}

UserPet.init(sequelize);

module.exports = UserPet;
