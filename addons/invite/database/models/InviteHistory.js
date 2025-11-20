/**
 * @namespace: addons/invite/database/models/InviteHistory.js
 * @type: Database Model
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

// file: src/database/models/InviteHistory.js
const { DataTypes } = require('sequelize');

const { KythiaModel } = require('kythia-core');

class InviteHistory extends KythiaModel {
    static CACHE_KEYS = [['guildId']];
    static init(sequelizeInstance) {
        super.init(
            {
                guildId: { type: DataTypes.STRING, allowNull: false },
                memberId: { type: DataTypes.STRING, allowNull: false },
                inviterId: { type: DataTypes.STRING, allowNull: true },
                inviteCode: { type: DataTypes.STRING, allowNull: true },
                status: { type: DataTypes.ENUM('active', 'left'), defaultValue: 'active' },
            },
            {
                sequelize: sequelizeInstance,
                modelName: 'InviteHistory',
                tableName: 'invite_history',
                timestamps: true,
                indexes: [{ fields: ['guildId', 'memberId'] }, { fields: ['guildId', 'inviterId'] }],
            }
        );
        return this;
    }
}

// InviteHistory.init(sequelize);
module.exports = InviteHistory;
