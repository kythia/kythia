/**
 * @namespace: addons/fun/database/migrations/20260308_000017_create_math_scores_table.js
 * @type: Database Migration
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = {
	async up(queryInterface, DataTypes) {
		await queryInterface.createTable('math_scores', {
			id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
			userId: { type: DataTypes.STRING, allowNull: false },
			username: { type: DataTypes.STRING, allowNull: true },
			bestScore: { type: DataTypes.INTEGER, defaultValue: 0 },
			totalGames: { type: DataTypes.INTEGER, defaultValue: 0 },
		});

		await queryInterface.addIndex('math_scores', ['userId'], {
			unique: true,
			name: 'math_scores_user_unique',
		});
	},

	async down(queryInterface) {
		await queryInterface.dropTable('math_scores');
	},
};
