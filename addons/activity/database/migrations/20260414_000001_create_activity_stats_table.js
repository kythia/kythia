/**
 * @namespace: addons/activity/database/migrations/20260414_000001_create_activity_stats_table.js
 * @type: Database Migration
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = {
	async up(queryInterface, DataTypes) {
		await queryInterface.createTable('activity_stats', {
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			guildId: { type: DataTypes.STRING, allowNull: false },
			userId: { type: DataTypes.STRING, allowNull: false },

			// ---------------------------------------------------------------------------
			// Message Stats
			// ---------------------------------------------------------------------------
			totalMessages: {
				type: DataTypes.BIGINT,
				defaultValue: 0,
				allowNull: false,
			},

			// ---------------------------------------------------------------------------
			// Voice Stats
			// Voice time is stored in seconds for precision.
			// ---------------------------------------------------------------------------
			totalVoiceTime: {
				type: DataTypes.BIGINT,
				defaultValue: 0,
				allowNull: false,
			},

			// ---------------------------------------------------------------------------
			// Timestamps
			// ---------------------------------------------------------------------------
			createdAt: { type: DataTypes.DATE, allowNull: false },
			updatedAt: { type: DataTypes.DATE, allowNull: false },
		});

		await queryInterface.addIndex('activity_stats', ['guildId', 'userId'], {
			unique: true,
			name: 'activity_stats_guild_user_unique',
		});

		await queryInterface.addIndex(
			'activity_stats',
			['guildId', 'totalMessages'],
			{
				name: 'activity_stats_guild_messages_idx',
			},
		);

		await queryInterface.addIndex(
			'activity_stats',
			['guildId', 'totalVoiceTime'],
			{
				name: 'activity_stats_guild_voice_idx',
			},
		);
	},

	async down(queryInterface) {
		await queryInterface.dropTable('activity_stats');
	},
};
