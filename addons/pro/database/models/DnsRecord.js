/**
 * @namespace: addons/pro/database/models/DnsRecord.js
 * @type: Database Model
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { DataTypes } = require('sequelize');

const { KythiaModel } = require('kythia-core');

class DnsRecord extends KythiaModel {
    static init(sequelize) {
        super.init(
            {
                id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
                subdomainId: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    references: {
                        model: 'subdomains',
                        key: 'id',
                    },
                },
                type: { type: DataTypes.ENUM('A', 'CNAME', 'TXT', 'MX'), allowNull: false },
                name: { type: DataTypes.STRING, allowNull: false },
                value: { type: DataTypes.TEXT, allowNull: false },
                cloudflareId: { type: DataTypes.STRING, allowNull: true },
            },
            {
                sequelize,
                modelName: 'DnsRecord',
                tableName: 'dns_records',
                timestamps: false,
            }
        );

        return this;
    }
}

module.exports = DnsRecord;
