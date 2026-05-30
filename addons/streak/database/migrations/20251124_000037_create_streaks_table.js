/**
 * @namespace: addons/streak/database/migrations/20251124_000037_create_streaks_table.js
 * @type: Database Migration
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = {
	async up(queryInterface, DataTypes) {
		await queryInterface.createTable('streaks', {
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			guildId: { type: DataTypes.STRING, allowNull: false },
			userId: { type: DataTypes.STRING, allowNull: false },
			currentStreak: { type: DataTypes.INTEGER, defaultValue: 0 },
			lastClaimTimestamp: { type: DataTypes.DATE, defaultValue: null },
			highestStreak: { type: DataTypes.INTEGER, defaultValue: 0 },
			streakFreezes: {
				type: DataTypes.INTEGER,
				defaultValue: 0,
				allowNull: false,
			},
			createdAt: { type: DataTypes.DATE, allowNull: false },
			updatedAt: { type: DataTypes.DATE, allowNull: false },
		});

		await queryInterface.addIndex('streaks', ['guildId', 'userId'], {
			unique: true,
		});
	},
	async down(queryInterface) {
		await queryInterface.dropTable('streaks');
	},
};
