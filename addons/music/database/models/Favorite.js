/**
 * @namespace: addons/music/database/models/Favorite.js
 * @type: Database Model
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta
 */

// addons/music/database/models/Favorite.js

const { DataTypes } = require('sequelize');
const sequelize = require('@src/database/KythiaSequelize');
const KythiaModel = require('@src/database/KythiaModel');

class Favorite extends KythiaModel {
    static CACHE_KEYS = [['userId']];
    static init(sequelize) {
        super.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    primaryKey: true,
                    autoIncrement: true,
                },
                userId: {
                    type: DataTypes.STRING,
                    allowNull: false,
                    comment: 'Discord User ID of the owner.',
                },
                // Kita simpan semua info yang dibutuhkan untuk memutar ulang lagu
                identifier: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                title: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                author: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                length: {
                    type: DataTypes.BIGINT,
                    allowNull: false,
                },
                uri: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
            },
            {
                sequelize,
                modelName: 'Favorite',
                tableName: 'favorites',
                timestamps: true,
                // Tambahkan unique index untuk mencegah user me-like lagu yang sama berkali-kali
                indexes: [
                    {
                        unique: true,
                        fields: ['userId', 'identifier'],
                    },
                ],
            }
        );
        return this;
    }
}

Favorite.init(sequelize);

module.exports = Favorite;
