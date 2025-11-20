/**
 * @namespace: addons/pro/database/models/Subdomain.js
 * @type: Database Model
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */
const { DataTypes } = require('sequelize');
const { KythiaModel } = require('kythia-core');

class Subdomain extends KythiaModel {
    static init(sequelize) {
        super.init(
            {
                id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
                userId: {
                    type: DataTypes.STRING,
                    allowNull: false,
                    references: {
                        model: 'kythia_users',
                        key: 'userId',
                    },
                },
                name: {
                    type: DataTypes.STRING,
                    allowNull: false,
                    unique: true,
                }
            },
            {
                sequelize,
                modelName: 'Subdomain',
                tableName: 'subdomains',
                timestamps: true,
            }
        );
        return this;
    }
}

module.exports = Subdomain;
