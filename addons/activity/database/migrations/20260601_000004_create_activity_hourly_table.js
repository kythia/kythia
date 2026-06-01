/**
 * @namespace: addons/activity/database/migrations/20260601_000004_create_activity_hourly_table.js
 * @type: Database Migration
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = {
	async up(queryInterface, DataTypes) {
		await queryInterface.createTable('activity_hourly', {
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			guildId: { type: DataTypes.STRING, allowNull: false },
			dayOfWeek: { type: DataTypes.INTEGER, allowNull: false }, // 0=Sunday, 6=Saturday
			hour: { type: DataTypes.INTEGER, allowNull: false }, // 0-23
			messages: { type: DataTypes.BIGINT, defaultValue: 0, allowNull: false },
			voiceTime: { type: DataTypes.BIGINT, defaultValue: 0, allowNull: false },
		});

		await queryInterface.addIndex(
			'activity_hourly',
			['guildId', 'dayOfWeek', 'hour'],
			{
				unique: true,
				name: 'activity_hourly_guild_day_hour_unique',
			},
		);
	},

	async down(queryInterface) {
		await queryInterface.dropTable('activity_hourly');
	},
};
