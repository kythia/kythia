/**
 * @namespace: addons/pet/database/migrations/20251124_000027_create_user_pets_table.js
 * @type: Database Migration
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = {
	async up(queryInterface, DataTypes) {
		await queryInterface.createTable('user_pets', {
			id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
			userId: { type: DataTypes.STRING, allowNull: false },
			petId: { type: DataTypes.INTEGER, allowNull: false },
			level: { type: DataTypes.INTEGER, defaultValue: 1 },
			petName: { type: DataTypes.STRING, allowNull: false },
			hunger: { type: DataTypes.INTEGER, defaultValue: 100 },
			happiness: { type: DataTypes.INTEGER, defaultValue: 100 },
			lastUse: { type: DataTypes.DATE, defaultValue: null },
			lastGacha: { type: DataTypes.DATE, defaultValue: null },
			isDead: { type: DataTypes.BOOLEAN, defaultValue: false },
		});
	},
	async down(queryInterface) {
		await queryInterface.dropTable('user_pets');
	},
};
