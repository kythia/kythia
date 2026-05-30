/**
 * @namespace: addons/reaction-role/database/migrations/20260323_000005_add_label_to_reaction_roles.js
 * @type: Database Migration
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = {
	async up(queryInterface, DataTypes) {
		await queryInterface.addColumn('reaction_roles', 'label', {
			type: DataTypes.STRING,
			allowNull: true,
			defaultValue: null,
			comment:
				'Human-readable label used as the dropdown option text (dropdown panels only)',
		});
	},

	async down(queryInterface) {
		await queryInterface.removeColumn('reaction_roles', 'label');
	},
};
