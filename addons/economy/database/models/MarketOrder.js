/**
 * @namespace: addons/economy/database/models/MarketOrder.js
 * @type: Database Model
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { DataTypes } = require('sequelize');

const { KythiaModel } = require('kythia-core');

class MarketOrder extends KythiaModel {
    static init(sequelize) {
        super.init(
            {
                orderId: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
                userId: { type: DataTypes.STRING, allowNull: false },
                assetId: { type: DataTypes.STRING, allowNull: false },
                type: { type: DataTypes.STRING, allowNull: false }, // 'limit' or 'stoploss'
                side: { type: DataTypes.STRING, allowNull: false }, // 'buy' or 'sell'
                quantity: { type: DataTypes.DOUBLE, allowNull: false },
                price: { type: DataTypes.DOUBLE, allowNull: false },
                status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'open' }, // 'open', 'filled', 'cancelled'
            },
            {
                sequelize,
                modelName: 'MarketOrder',
                tableName: 'market_orders',
                timestamps: true,
                indexes: [{ fields: ['userId'] }, { fields: ['userId', 'assetId'] }],
            }
        );
        return this;
    }
}

// MarketOrder.init(sequelize);
module.exports = MarketOrder;
