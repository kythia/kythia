/**
 * @namespace: addons/reaction-role/database/migrations/20260302_000001_create_reaction_role_panels_table.js
 * @type: Database Migration
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = {
	async up(queryInterface, DataTypes) {
		await queryInterface.createTable('reaction_role_panels', {
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
				allowNull: true, // null until the panel message is posted
			},
			// 'post_embed' | 'use_message'
			mode: {
				type: DataTypes.STRING,
				allowNull: false,
				defaultValue: 'post_embed',
			},
			title: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			description: {
				type: DataTypes.TEXT,
				allowNull: true,
			},
			// JSON array of role IDs — only members with ≥1 of these may pick up roles
			whitelistRoles: {
				type: DataTypes.JSON,
				allowNull: false,
				defaultValue: [],
			},
			// JSON array of role IDs — members with any of these are blocked
			blacklistRoles: {
				type: DataTypes.JSON,
				allowNull: false,
				defaultValue: [],
			},
			// 'normal' | 'unique' | 'verify'
			messageType: {
				type: DataTypes.STRING,
				allowNull: false,
				defaultValue: 'normal',
			},
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

		await queryInterface.addIndex(
			'reaction_role_panels',
			['guildId', 'messageId'],
			{
				name: 'rr_panels_guild_message_idx',
			},
		);
	},

	async down(queryInterface) {
		await queryInterface.dropTable('reaction_role_panels');
	},
};
