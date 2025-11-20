/**
 * @namespace: addons/image/database/models/Image.js
 * @type: Database Model
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { DataTypes } = require('sequelize');

const { KythiaModel } = require('kythia-core');

class Image extends KythiaModel {
    // static CACHE_KEYS = [['userId']];
    static init(sequelize) {
        super.init(
            {
                id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
                userId: { type: DataTypes.STRING, allowNull: false },
                filename: { type: DataTypes.STRING, allowNull: false, unique: true },
                originalUrl: { type: DataTypes.TEXT, allowNull: false },
                storagePath: { type: DataTypes.STRING, allowNull: false },
                mimetype: { type: DataTypes.STRING, allowNull: false },
            },
            {
                sequelize,
                modelName: 'Image',
                tableName: 'images',
                timestamps: true,
                indexes: [
                    {
                        fields: ['userId'],
                    },
                    {
                        fields: ['filename'],
                    },
                ],
            }
        );

        return this;
    }
}

// Image.init(sequelize);

module.exports = Image;
