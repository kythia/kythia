/**
 * @namespace: addons/reaction-role/database/migrations/20260323_000004_add_panel_type_to_reaction_role_panels.js
 * @type: Database Migration
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = {
	async up(queryInterface, DataTypes) {
		await queryInterface.addColumn('reaction_role_panels', 'panelType', {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: 'reaction',
			comment: '"reaction" (emoji react) | "dropdown" (select menu)',
		});
	},

	async down(queryInterface) {
		await queryInterface.removeColumn('reaction_role_panels', 'panelType');
	},
};
