/**
 * @namespace: addons/birthday/database/migrations/20260103_000003_create_user_birthdays_table.js
 * @type: Database Migration
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = {
	async up(queryInterface, DataTypes) {
		await queryInterface.createTable('user_birthdays', {
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			guildId: {
				type: DataTypes.STRING(25),
				allowNull: false,
			},
			userId: {
				type: DataTypes.STRING(25),
				allowNull: false,
			},
			day: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			month: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			year: {
				type: DataTypes.INTEGER,
				allowNull: true,
			},
			lastCelebratedYear: {
				type: DataTypes.INTEGER,
				allowNull: true,
			},
			createdAt: {
				type: DataTypes.DATE,
				allowNull: false,
				defaultValue: new Date(),
			},
			updatedAt: {
				type: DataTypes.DATE,
				allowNull: false,
				defaultValue: new Date(),
			},
		});

		// Ensure one birthday per user per guild
		await queryInterface.addIndex('user_birthdays', ['guildId', 'userId'], {
			unique: true,
		});

		// Index for the announcer to quickly find today's birthdays in a guild
		await queryInterface.addIndex('user_birthdays', [
			'guildId',
			'month',
			'day',
		]);
	},

	async down(queryInterface) {
		await queryInterface.dropTable('user_birthdays');
	},
};
