/**
 * @namespace: addons/economy/database/models/MarketPortfolio.js
 * @type: Database Model
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { DataTypes } = require('sequelize');

const { KythiaModel } = require('kythia-core');

class MarketPortfolio extends KythiaModel {
    static init(sequelize) {
        super.init(
            {
                portfolioId: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
                userId: { type: DataTypes.STRING, allowNull: false },
                assetId: { type: DataTypes.STRING, allowNull: false },
                quantity: { type: DataTypes.DOUBLE, allowNull: false },
                avgBuyPrice: { type: DataTypes.DOUBLE, allowNull: false },
            },
            {
                sequelize,
                modelName: 'MarketPortfolio',
                tableName: 'market_portfolios',
                timestamps: false,

                indexes: [{ fields: ['userId'] }, { fields: ['userId', 'assetId'], unique: true }],
            }
        );
        return this;
    }
}

// MarketPortfolio.init(sequelize);
module.exports = MarketPortfolio;
