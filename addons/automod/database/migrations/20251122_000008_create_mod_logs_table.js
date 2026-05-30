/**
 * @namespace: addons/automod/database/migrations/20251122_000008_create_mod_logs_table.js
 * @type: Database Migration
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = {
	async up(queryInterface, DataTypes) {
		await queryInterface.createTable('mod_logs', {
			id: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				autoIncrement: true,
				allowNull: false,
			},
			guildId: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			moderatorId: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			moderatorTag: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			targetId: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			targetTag: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			action: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			reason: {
				type: DataTypes.TEXT,
				allowNull: true,
			},
			channelId: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			createdAt: {
				type: DataTypes.DATE,
				allowNull: false,
			},
			updatedAt: {
				type: DataTypes.DATE,
				allowNull: false,
			},
		});

		await queryInterface.addIndex('mod_logs', ['guildId'], {
			name: 'mod_logs_guildId',
		});
	},

	async down(queryInterface) {
		await queryInterface.dropTable('mod_logs');
	},
};
