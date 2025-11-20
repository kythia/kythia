/**
 * @namespace: addons/ticket/database/models/TicketPanel.js
 * @type: Database Model
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { DataTypes } = require('sequelize');
const { KythiaModel } = require('kythia-core');

class TicketPanel extends KythiaModel {
    static init(sequelize) {
        super.init(
            {
                guildId: { type: DataTypes.STRING, allowNull: false },
                channelId: { type: DataTypes.STRING, allowNull: false },
                messageId: { type: DataTypes.STRING, allowNull: false, unique: true },
                title: { type: DataTypes.STRING, allowNull: false },
                description: { type: DataTypes.TEXT, allowNull: true },
                image: { type: DataTypes.STRING, allowNull: true },
            },
            {
                sequelize,
                modelName: 'TicketPanel',
                tableName: 'ticket_panels',
                timestamps: true,
            }
        );

        return this;
    }
}

module.exports = TicketPanel;
