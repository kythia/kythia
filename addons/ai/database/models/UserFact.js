/**
 * @namespace: addons/ai/database/models/UserFact.js
 * @type: Database Model
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { DataTypes } = require('sequelize');
const { KythiaModel } = require('kythia-core');

class UserFact extends KythiaModel {
    static CACHE_KEYS = [['userId']];

    static init(sequelize) {
        super.init(
            {
                id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
                userId: { type: DataTypes.STRING, allowNull: false, comment: 'Discord User ID' },
                fact: { type: DataTypes.TEXT, allowNull: false, comment: 'The fact about the user' },
                type: {
                    type: DataTypes.STRING,
                    allowNull: false,
                    defaultValue: 'other',
                    comment: 'The classified type of the fact (hobby, name, etc.)',
                },
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

module.exports = UserFact;
