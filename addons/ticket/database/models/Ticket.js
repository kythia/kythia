/**
 * @namespace: addons/ticket/database/models/Ticket.js
 * @type: Database Model
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { DataTypes } = require('sequelize');
const { KythiaModel } = require('kythia-core');

class Ticket extends KythiaModel {
    static init(sequelize) {
        super.init(
            {
                guildId: { type: DataTypes.STRING, allowNull: false },
                userId: { type: DataTypes.STRING, allowNull: false },
                channelId: { type: DataTypes.STRING, allowNull: false },
                ticketConfigId: { type: DataTypes.STRING, allowNull: false },
                conversation: { type: DataTypes.JSON, defaultValue: '[]' },
                status: { type: DataTypes.ENUM('open', 'closed'), defaultValue: 'open' },
                openedAt: { type: DataTypes.DATE, allowNull: true },
                closedAt: { type: DataTypes.DATE, allowNull: true },
                closedByUserId: { type: DataTypes.STRING, allowNull: true },
                closedReason: { type: DataTypes.TEXT, allowNull: true },
            },
            {
                sequelize,
                modelName: 'Ticket',
                tableName: 'tickets',
                timestamps: true,
            }
        );
        return this;
    }
}

module.exports = Ticket;
