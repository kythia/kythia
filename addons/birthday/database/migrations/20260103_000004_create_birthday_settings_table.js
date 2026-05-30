/**
 * @namespace: addons/birthday/database/migrations/20260103_000004_create_birthday_settings_table.js
 * @type: Database Migration
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = {
	async up(queryInterface, DataTypes) {
		await queryInterface.createTable('birthday_settings', {
			guildId: {
				type: DataTypes.STRING(25),
				allowNull: false,
				primaryKey: true,
			},
			channelId: {
				type: DataTypes.STRING(25),
				allowNull: true,
			},
			message: {
				type: DataTypes.TEXT,
				allowNull: true,
			},
			roleId: {
				type: DataTypes.STRING(25),
				allowNull: true,
			},
			pingRoleId: {
				type: DataTypes.STRING(25),
				allowNull: true,
			},
			showAge: {
				type: DataTypes.BOOLEAN,
				defaultValue: true,
			},
			embedColor: {
				type: DataTypes.STRING(10),
				allowNull: true,
			},
			bgUrl: {
				type: DataTypes.TEXT,
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
	},

	async down(queryInterface) {
		await queryInterface.dropTable('birthday_settings');
	},
};
