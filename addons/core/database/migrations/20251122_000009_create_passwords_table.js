/**
 * @namespace: addons/core/database/migrations/20251122_000009_create_passwords_table.js
 * @type: Database Migration
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = {
	async up(queryInterface, DataTypes) {
		await queryInterface.createTable('passwords', {
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
			channelId: {
				type: DataTypes.STRING,
				allowNull: false,
				unique: true,
			},
			roleId: {
				type: DataTypes.STRING,
				allowNull: false,
				unique: true,
			},
			password: {
				type: DataTypes.STRING,
				allowNull: false,
			},
		});

		await queryInterface.addIndex('passwords', ['guildId'], {
			name: 'passwords_guildId',
		});
	},

	async down(queryInterface) {
		await queryInterface.dropTable('passwords');
	},
};
