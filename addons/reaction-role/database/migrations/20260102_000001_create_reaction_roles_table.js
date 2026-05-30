/**
 * @namespace: addons/reaction-role/database/migrations/20260102_000001_create_reaction_roles_table.js
 * @type: Database Migration
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = {
	async up(queryInterface, DataTypes) {
		await queryInterface.createTable('reaction_roles', {
			id: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				autoIncrement: true,
				allowNull: false,
			},
			guildId: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			channelId: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			messageId: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			emoji: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			roleId: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			// Add timestamps just in case
			createdAt: {
				type: DataTypes.DATE,
				allowNull: false,
				defaultValue: DataTypes.NOW,
			},
			updatedAt: {
				type: DataTypes.DATE,
				allowNull: false,
				defaultValue: DataTypes.NOW,
			},
		});

		// Add index for faster lookups
		await queryInterface.addIndex(
			'reaction_roles',
			['guildId', 'messageId', 'emoji'],
			{
				unique: true,
				name: 'reaction_roles_unique_constraint',
			},
		);
	},

	async down(queryInterface) {
		await queryInterface.dropTable('reaction_roles');
	},
};
