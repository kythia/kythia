/**
 * @namespace: addons/activity/database/migrations/20260604_000007_create_user_achievements_table.js
 * @type: Database Migration
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = {
	async up(queryInterface, DataTypes) {
		await queryInterface.createTable('user_achievements', {
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			guildId: { type: DataTypes.STRING, allowNull: false },
			userId: { type: DataTypes.STRING, allowNull: false },
			achievementId: { type: DataTypes.STRING, allowNull: false },
			unlockedAt: { type: DataTypes.DATE, allowNull: false },
		});

		await queryInterface.addIndex(
			'user_achievements',
			['guildId', 'userId', 'achievementId'],
			{
				unique: true,
				name: 'user_achievements_guild_user_achievement_unique',
			},
		);

		await queryInterface.addIndex('user_achievements', ['guildId', 'userId'], {
			name: 'user_achievements_guild_user_idx',
		});
	},

	async down(queryInterface) {
		await queryInterface.dropTable('user_achievements');
	},
};
