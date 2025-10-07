/**
 * @namespace: addons/streak/database/models/Streak.js
 * @type: Database Model
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc1
 */

const { DataTypes } = require('sequelize');
const sequelize = require('@src/database/KythiaSequelize');
const KythiaModel = require('@src/database/KythiaModel');

class Streak extends KythiaModel {
    static init(sequelize) {
        super.init(
            {
                guildId: { type: DataTypes.STRING, allowNull: false }, // salah satu, bisa per guild, bisa per orang
                userId: { type: DataTypes.STRING, allowNull: false },
                currentStreak: { type: DataTypes.INTEGER, default: 0 }, // Waktu terakhir kali user claim streak
                lastClaimTimestamp: { type: DataTypes.DATE, default: null }, // (Opsional) untuk menyimpan rekor streak tertinggi
                highestStreak: { type: DataTypes.INTEGER, default: 0 },
                streakFreezes: { type: DataTypes.INTEGER, defaultValue: 0, allowNull: false },
            },
            {
                sequelize,
                modelName: 'Streak',
                tableName: 'streaks',
                timestamps: true,
            }
        );

        return this;
    }
}

Streak.init(sequelize);

module.exports = Streak;
