/**
 * @namespace: addons/core/database/models/Password.js
 * @type: Database Model
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc1
 */

const { DataTypes } = require('sequelize');
const sequelize = require('@src/database/KythiaSequelize');
const KythiaModel = require('@src/database/KythiaModel');

class Password extends KythiaModel {
    static init(sequelize) {
        super.init(
            {
                guildId: { type: DataTypes.STRING, allowNull: false },
                channelId: { type: DataTypes.STRING, allowNull: false, unique: true },
                roleId: { type: DataTypes.STRING, allowNull: false, unique: true },
                password: { type: DataTypes.STRING, allowNull: false },
            },
            {
                sequelize,
                modelName: 'Password',
                tableName: 'passwords',
                timestamps: false,
            }
        );

        return this;
    }
}

Password.init(sequelize);

module.exports = Password;
