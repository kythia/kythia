/**
 * @namespace: addons/economy/database/models/MarketTransaction.js
 * @type: Database Model
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { DataTypes } = require('sequelize');

const { KythiaModel } = require('kythia-core');

class MarketTransaction extends KythiaModel {
    static init(sequelize) {
        super.init(
            {
                transactionId: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
                userId: { type: DataTypes.STRING, allowNull: false },
                assetId: { type: DataTypes.STRING, allowNull: false },
                type: { type: DataTypes.STRING, allowNull: false }, // 'buy' or 'sell'
                quantity: { type: DataTypes.DOUBLE, allowNull: false },
                price: { type: DataTypes.DOUBLE, allowNull: false },
            },
            {
                sequelize,
                modelName: 'MarketTransaction',
                tableName: 'market_transactions',
                timestamps: true,
                indexes: [{ fields: ['userId'] }, { fields: ['userId', 'assetId'] }],
            }
        );
        return this;
    }
}

// MarketTransaction.init(sequelize);
module.exports = MarketTransaction;
