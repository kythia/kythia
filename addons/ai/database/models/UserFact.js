/**
 * @namespace: addons/ai/database/models/UserFact.js
 * @type: Database Model
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta
 */

const { DataTypes } = require('sequelize');
const KythiaModel = require('@src/database/KythiaModel');
const sequelize = require('@src/database/KythiaSequelize');

class UserFact extends KythiaModel {
    static CACHE_KEYS = [['userId']];

    static init(sequelize) {
        super.init(
            {
                // ID unik untuk setiap fakta
                id: {
                    type: DataTypes.INTEGER,
                    primaryKey: true,
                    autoIncrement: true,
                },
                userId: {
                    type: DataTypes.STRING,
                    allowNull: false,
                    comment: 'Discord User ID',
                },
                fact: {
                    type: DataTypes.TEXT,
                    allowNull: false,
                    comment: 'The fact about the user',
                },
                type: {
                    type: DataTypes.STRING,
                    allowNull: false,
                    defaultValue: 'other',
                    comment: 'The classified type of the fact (hobby, name, etc.)',
                },
                // Timestamp otomatis dibuat oleh Sequelize
            },
            {
                sequelize,
                modelName: 'UserFact',
                tableName: 'user_facts',
                timestamps: true,
            }
        );

        return this;
    }
}

UserFact.init(sequelize);
module.exports = UserFact;
