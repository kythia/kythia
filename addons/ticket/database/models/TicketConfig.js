/**
 * @namespace: addons/ticket/database/models/TicketConfig.js
 * @type: Database Model
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { DataTypes } = require('sequelize');
const { KythiaModel } = require('kythia-core');

class TicketConfig extends KythiaModel {
    static init(sequelize) {
        super.init(
            {
                guildId: { type: DataTypes.STRING, allowNull: false },
                panelMessageId: { type: DataTypes.STRING, allowNull: false },
                typeName: { type: DataTypes.STRING, allowNull: false },
                typeEmoji: { type: DataTypes.STRING, allowNull: true },
                staffRoleId: { type: DataTypes.STRING, allowNull: false },
                logsChannelId: { type: DataTypes.STRING, allowNull: false },
                transcriptChannelId: { type: DataTypes.STRING, allowNull: false },
                ticketCategoryId: { type: DataTypes.STRING, allowNull: true },
                ticketOpenMessage: { type: DataTypes.TEXT, allowNull: true },
                ticketOpenImage: { type: DataTypes.STRING, allowNull: true },
                askReason: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
            },
            {
                sequelize,
                modelName: 'TicketConfig',
                tableName: 'ticket_configs',
                timestamps: false,
            }
        );

        return this;
    }
}

module.exports = TicketConfig;
