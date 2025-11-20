/**
 * @namespace: addons/invite/database/models/Invite.js
 * @type: Database Model
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { DataTypes } = require('sequelize');

const { KythiaModel } = require('kythia-core');

class Invite extends KythiaModel {
    static CACHE_KEYS = [['userId', 'guildId']];
    static init(sequelizeInstance) {
        super.init(
            {
                guildId: { type: DataTypes.STRING, allowNull: false },
                userId: { type: DataTypes.STRING, allowNull: false },
                invites: { type: DataTypes.INTEGER, defaultValue: 0 },
                fake: { type: DataTypes.INTEGER, defaultValue: 0 },
                leaves: { type: DataTypes.INTEGER, defaultValue: 0 },
            },
            {
                sequelize: sequelizeInstance,
                modelName: 'Invite',
                tableName: 'invites',
                timestamps: false,
                indexes: [{ unique: true, fields: ['guildId', 'userId'] }],
            }
        );
        return this;
    }
}

// Invite.init(sequelize);

module.exports = Invite;
