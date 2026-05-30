/**
 * @namespace: addons/pro/database/migrations/20251124_000032_create_subdomains_table.js
 * @type: Database Migration
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = {
	async up(queryInterface, DataTypes) {
		await queryInterface.createTable('subdomains', {
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			userId: { type: DataTypes.STRING, allowNull: false }, // References kythia_users handled by logic, no strict FK constraint in migration usually to avoid lock issues
			name: { type: DataTypes.STRING, allowNull: false, unique: true },
			createdAt: { type: DataTypes.DATE, allowNull: false },
			updatedAt: { type: DataTypes.DATE, allowNull: false },
		});

		await queryInterface.addIndex('subdomains', ['userId']);
	},
	async down(queryInterface) {
		await queryInterface.dropTable('subdomains');
	},
};
