/**
 * @namespace: addons/ticket/database/migrations/20260311_000043_add_ticket_style_to_ticket_configs.js
 * @type: Database Migration
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = {
	async up(queryInterface, DataTypes) {
		await queryInterface.addColumn('ticket_configs', 'ticketStyle', {
			type: DataTypes.ENUM('channel', 'thread'),
			allowNull: false,
			defaultValue: 'channel',
		});

		await queryInterface.addColumn('ticket_configs', 'ticketThreadChannelId', {
			type: DataTypes.STRING,
			allowNull: true,
			defaultValue: null,
		});
	},
	async down(queryInterface) {
		await queryInterface.removeColumn('ticket_configs', 'ticketStyle');
		await queryInterface.removeColumn(
			'ticket_configs',
			'ticketThreadChannelId',
		);
	},
};
