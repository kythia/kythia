/**
 * @namespace: addons/pro/database/migrations/20251124_000034_create_monitors_table.js
 * @type: Database Migration
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = {
	async up(queryInterface, DataTypes) {
		await queryInterface.createTable('monitors', {
			userId: {
				type: DataTypes.STRING,
				primaryKey: true,
				allowNull: false,
			},
			urlToPing: { type: DataTypes.STRING, allowNull: false },
			lastStatus: {
				type: DataTypes.ENUM('UP', 'DOWN', 'PENDING'),
				defaultValue: 'PENDING',
			},
		});
	},
	async down(queryInterface) {
		await queryInterface.dropTable('monitors');
	},
};
