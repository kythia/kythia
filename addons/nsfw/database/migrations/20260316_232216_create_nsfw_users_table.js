/**
 * @namespace: addons/nsfw/database/migrations/20260316_232216_create_nsfw_users_table.js
 * @type: Database Migration
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = {
	async up(queryInterface, DataTypes) {
		await queryInterface.createTable('nsfw_users', {
			userId: {
				type: DataTypes.STRING,
				allowNull: false,
				primaryKey: true,
			},
			nsfwFav: {
				type: DataTypes.JSON,
				allowNull: true,
				defaultValue: [],
			},
			nsfwCount: {
				type: DataTypes.INTEGER,
				allowNull: false,
				defaultValue: 0,
			},
		});
	},

	async down(queryInterface) {
		await queryInterface.dropTable('nsfw_users');
	},
};
