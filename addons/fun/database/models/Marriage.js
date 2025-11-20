/**
 * @namespace: addons/fun/database/models/Marriage.js
 * @type: Database Model
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { DataTypes } = require('sequelize');
// Adjust connection string
const { KythiaModel } = require('kythia-core'); // Import KythiaModel

// Extend Marriage dengan KythiaModel
class Marriage extends KythiaModel {
    static init(sequelize) {
        super.init(
            {
                id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
                user1Id: { type: DataTypes.STRING, allowNull: false },
                user2Id: { type: DataTypes.STRING, allowNull: false },
                marriedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
                status: { type: DataTypes.ENUM('pending', 'married', 'divorced', 'rejected'), defaultValue: 'pending' },
                lastKiss: { type: DataTypes.DATE, allowNull: true },
                loveScore: { type: DataTypes.INTEGER, defaultValue: 0 },
            },
            {
                sequelize,
                modelName: 'Marriage',
                tableName: 'marriages',
                timestamps: false,
            }
        );

        return this;
    }
}

// Marriage.init(sequelize);

module.exports = Marriage;
