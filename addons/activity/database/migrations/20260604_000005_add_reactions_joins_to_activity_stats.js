/**
 * @namespace: addons/activity/database/migrations/20260604_000005_add_reactions_joins_to_activity_stats.js
 * @type: Database Migration
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = {
	async up(queryInterface, DataTypes) {
		await queryInterface.addColumn('activity_stats', 'totalReactions', {
			type: DataTypes.BIGINT,
			defaultValue: 0,
			allowNull: false,
		});

		await queryInterface.addColumn('activity_stats', 'totalVoiceJoins', {
			type: DataTypes.BIGINT,
			defaultValue: 0,
			allowNull: false,
		});

		await queryInterface.addIndex(
			'activity_stats',
			['guildId', 'totalReactions'],
			{ name: 'activity_stats_guild_reactions_idx' },
		);
	},

	async down(queryInterface) {
		await queryInterface.removeIndex(
			'activity_stats',
			'activity_stats_guild_reactions_idx',
		);
		await queryInterface.removeColumn('activity_stats', 'totalVoiceJoins');
		await queryInterface.removeColumn('activity_stats', 'totalReactions');
	},
};
