/**
 * @namespace: addons/autoreply/database/migrations/20260103_000001_create_auto_replies_table.js
 * @type: Database Migration
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = {
	async up(queryInterface, DataTypes) {
		await queryInterface.createTable('auto_replies', {
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
			userId: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			trigger: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			response: {
				type: DataTypes.TEXT,
				allowNull: true,
			},
			media: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			useContainer: {
				type: DataTypes.BOOLEAN,
				defaultValue: false,
			},
			createdAt: {
				type: DataTypes.DATE,
				allowNull: false,
				defaultValue: DataTypes.NOW,
			},
			updatedAt: {
				type: DataTypes.DATE,
				allowNull: false,
				defaultValue: DataTypes.NOW,
			},
		});

		// Index for faster lookups by guild and trigger
		await queryInterface.addIndex('auto_replies', ['guildId', 'trigger'], {
			unique: true,
			name: 'auto_replies_guildId_trigger',
		});
	},

	async down(queryInterface) {
		await queryInterface.dropTable('auto_replies');
	},
};
