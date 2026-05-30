/**
 * @namespace: addons/reaction-role/database/migrations/20260302_000003_add_layout_to_reaction_role_panels.js
 * @type: Database Migration
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = {
	async up(queryInterface, DataTypes) {
		await queryInterface.addColumn('reaction_role_panels', 'layout', {
			type: DataTypes.JSON,
			allowNull: true,
			defaultValue: null,
			comment: 'Optional Components V2 layout config (embed-builder-like JSON)',
		});
	},

	async down(queryInterface) {
		await queryInterface.removeColumn('reaction_role_panels', 'layout');
	},
};
