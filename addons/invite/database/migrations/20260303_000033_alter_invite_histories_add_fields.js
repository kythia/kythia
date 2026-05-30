/**
 * @namespace: addons/invite/database/migrations/20260303_000033_alter_invite_histories_add_fields.js
 * @type: Database Migration
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = {
	async up(queryInterface, DataTypes) {
		await queryInterface.addColumn('invite_histories', 'inviteCode', {
			type: DataTypes.STRING,
			allowNull: true,
		});
		await queryInterface.addColumn('invite_histories', 'joinType', {
			type: DataTypes.ENUM(
				'new',
				'rejoin',
				'fake',
				'vanity',
				'oauth',
				'unknown',
			),
			defaultValue: 'unknown',
			allowNull: false,
		});
	},
	async down(queryInterface) {
		await queryInterface.removeColumn('invite_histories', 'inviteCode');
		await queryInterface.removeColumn('invite_histories', 'joinType');
	},
};
