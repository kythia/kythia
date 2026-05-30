/**
 * @namespace: addons/checklist/database/migrations/20251122_000019_create_checklists_table.js
 * @type: Database Migration
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = {
	async up(queryInterface, DataTypes) {
		await queryInterface.createTable('checklists', {
			id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
			guildId: { type: DataTypes.STRING, allowNull: true },
			userId: { type: DataTypes.STRING, allowNull: true },
			items: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
		});
	},

	async down(queryInterface) {
		await queryInterface.dropTable('checklists');
	},
};
