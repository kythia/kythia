/**
 * @namespace: addons/core/database/migrations/20260312_000013_create_kythia_blacklists_table.js
 * @type: Database Migration
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = {
	async up(queryInterface, DataTypes) {
		await queryInterface.createTable('kythia_blacklists', {
			id: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				autoIncrement: true,
				allowNull: false,
			},
			type: {
				type: DataTypes.STRING,
				allowNull: false,
				comment: "'guild' or 'user'",
			},
			targetId: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			reason: {
				type: DataTypes.STRING,
				allowNull: true,
			},
		});
	},

	async down(queryInterface) {
		await queryInterface.dropTable('kythia_blacklists');
	},
};
