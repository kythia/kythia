/**
 * @namespace: addons/quest/database/migrations/20251124_000039_create_quest_guild_logs_table.js
 * @type: Database Migration
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = {
	async up(queryInterface, DataTypes) {
		await queryInterface.createTable('quest_guild_logs', {
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			guildId: { type: DataTypes.STRING, allowNull: false },
			questId: { type: DataTypes.STRING, allowNull: false },
			sentAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
		});

		await queryInterface.addIndex('quest_guild_logs', ['guildId', 'questId'], {
			unique: true,
		});
	},
	async down(queryInterface) {
		await queryInterface.dropTable('quest_guild_logs');
	},
};
