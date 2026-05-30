/**
 * @namespace: addons/core/database/migrations/20251122_000011_create_sticky_messages_table.js
 * @type: Database Migration
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = {
	async up(queryInterface, DataTypes) {
		await queryInterface.createTable('sticky_messages', {
			id: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				autoIncrement: true,
				allowNull: false,
			},
			channelId: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			message: {
				type: DataTypes.LONGTEXT,
				allowNull: false,
			},
			messageId: {
				type: DataTypes.STRING,
				allowNull: true,
			},
		});

		await queryInterface.addIndex('sticky_messages', ['channelId'], {
			name: 'sticky_messages_channelId',
		});
	},

	async down(queryInterface) {
		await queryInterface.dropTable('sticky_messages');
	},
};
