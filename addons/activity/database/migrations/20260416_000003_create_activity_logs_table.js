/**
 * @namespace: addons/activity/database/migrations/20260416_000003_create_activity_logs_table.js
 * @type: Database Migration
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = {
	async up(queryInterface, DataTypes) {
		await queryInterface.createTable('activity_logs', {
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			guildId: { type: DataTypes.STRING, allowNull: false },
			userId: { type: DataTypes.STRING, allowNull: false },
			date: { type: DataTypes.DATEONLY, allowNull: false },
			messages: { type: DataTypes.BIGINT, defaultValue: 0, allowNull: false },
			voiceTime: { type: DataTypes.BIGINT, defaultValue: 0, allowNull: false },
		});

		await queryInterface.addIndex(
			'activity_logs',
			['guildId', 'userId', 'date'],
			{
				unique: true,
				name: 'activity_logs_guild_user_date_unique',
			},
		);

		await queryInterface.addIndex('activity_logs', ['guildId', 'date'], {
			name: 'activity_logs_guild_date_idx',
		});
	},

	async down(queryInterface) {
		await queryInterface.dropTable('activity_logs');
	},
};
