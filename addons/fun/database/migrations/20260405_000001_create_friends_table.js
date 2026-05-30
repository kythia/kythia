/**
 * @namespace: addons/fun/database/migrations/20260405_000001_create_friends_table.js
 * @type: Database Migration
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = {
	async up(queryInterface, DataTypes) {
		await queryInterface.createTable('friends', {
			id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
			user1Id: { type: DataTypes.STRING, allowNull: false },
			user2Id: { type: DataTypes.STRING, allowNull: false },
			status: {
				type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
				defaultValue: 'pending',
			},
			createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
			updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
		});
	},

	async down(queryInterface) {
		await queryInterface.dropTable('friends');
	},
};
