/**
 * @namespace: addons/giveaway/database/models/Giveaway.js
 * @type: Database Model
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc1
 */

const { DataTypes } = require('sequelize');
const sequelize = require('@src/database/KythiaSequelize'); // Adjust connection string
const KythiaModel = require('@src/database/KythiaModel'); // Import KythiaModel

// Extend Giveaway dengan KythiaModel
class Giveaway extends KythiaModel {
    static init(sequelize) {
        super.init(
            {
                guildId: { type: DataTypes.STRING, allowNull: false },
                channelId: { type: DataTypes.STRING, allowNull: false },
                messageId: { type: DataTypes.STRING, allowNull: false },
                hostId: { type: DataTypes.STRING, allowNull: false },
                type: { type: DataTypes.STRING, allowNull: false },
                duration: { type: DataTypes.INTEGER, allowNull: false },
                winners: { type: DataTypes.INTEGER, allowNull: false },
                prize: { type: DataTypes.STRING, allowNull: false },
                participants: { type: DataTypes.JSON, defaultValue: [] },
                ended: { type: DataTypes.BOOLEAN, defaultValue: false },
                roleId: { type: DataTypes.STRING, allowNull: true },
                color: { type: DataTypes.STRING, allowNull: true },
                endTime: { type: DataTypes.DATE, allowNull: true },
            },
            {
                sequelize,
                modelName: 'Giveaway',
                tableName: 'giveaways',
                timestamps: false,
            }
        );

        return this;
    }
}

Giveaway.init(sequelize);

module.exports = Giveaway;
