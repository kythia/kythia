/**
 * @namespace: addons/reminder/database/migrations/20260614_000001_create_kythia_reminders_table.js
 * @type: Database Migration
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = {
	async up(queryInterface, DataTypes) {
		await queryInterface.createTable('kythia_reminders', {
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			userId: { type: DataTypes.STRING, allowNull: false },
			channelId: { type: DataTypes.STRING, allowNull: true },
			reason: { type: DataTypes.TEXT, allowNull: false },
			timezone: {
				type: DataTypes.STRING,
				defaultValue: 'UTC',
				allowNull: false,
			},
			expiresAt: { type: DataTypes.DATE, allowNull: false },
			createdAt: { type: DataTypes.DATE, allowNull: false },
			updatedAt: { type: DataTypes.DATE, allowNull: false },
		});

		await queryInterface.addIndex('kythia_reminders', ['userId']);
		await queryInterface.addIndex('kythia_reminders', ['expiresAt']);
	},
	async down(queryInterface) {
		await queryInterface.dropTable('kythia_reminders');
	},
};
