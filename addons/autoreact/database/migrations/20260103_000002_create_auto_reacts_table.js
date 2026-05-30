/**
 * @namespace: addons/autoreact/database/migrations/20260103_000002_create_auto_reacts_table.js
 * @type: Database Migration
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = {
	async up(queryInterface, DataTypes) {
		await queryInterface.createTable('auto_reacts', {
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
			trigger: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			emoji: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			type: {
				type: DataTypes.ENUM('text', 'channel'),
				defaultValue: 'text',
				allowNull: false,
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

		await queryInterface.addIndex(
			'auto_reacts',
			['guildId', 'trigger', 'type'],
			{
				unique: true,
			},
		);
	},

	async down(queryInterface) {
		await queryInterface.dropTable('auto_reacts');
	},
};
