/**
 * @namespace: addons/reaction-role/database/migrations/20260302_000002_add_panel_id_to_reaction_roles.js
 * @type: Database Migration
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = {
	async up(queryInterface, DataTypes) {
		await queryInterface.addColumn('reaction_roles', 'panelId', {
			type: DataTypes.INTEGER,
			allowNull: true,
			defaultValue: null,
			references: {
				model: 'reaction_role_panels',
				key: 'id',
			},
			onDelete: 'CASCADE',
		});
	},

	async down(queryInterface) {
		await queryInterface.removeColumn('reaction_roles', 'panelId');
	},
};
