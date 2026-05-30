/**
 * @namespace: addons/embed-builder/database/migrations/20260305_000001_create_embeds_table.js
 * @type: Database Migration
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = {
	async up(queryInterface, DataTypes) {
		await queryInterface.createTable('embed_builders', {
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			guildId: { type: DataTypes.STRING, allowNull: false },
			createdBy: { type: DataTypes.STRING, allowNull: false },
			name: { type: DataTypes.STRING, allowNull: false },
			// 'embed' = classic Discord embed, 'components_v2' = Components V2 container
			mode: {
				type: DataTypes.ENUM('embed', 'components_v2'),
				allowNull: false,
				defaultValue: 'embed',
			},
			// Full JSON payload — embed object for "embed" mode, components array for "components_v2" mode
			data: { type: DataTypes.JSON, allowNull: false, defaultValue: {} },
			// Set after sending to Discord
			messageId: { type: DataTypes.STRING, allowNull: true },
			channelId: { type: DataTypes.STRING, allowNull: true },
			createdAt: { type: DataTypes.DATE, allowNull: false },
			updatedAt: { type: DataTypes.DATE, allowNull: false },
		});

		await queryInterface.addIndex('embed_builders', ['guildId']);
		await queryInterface.addIndex('embed_builders', ['guildId', 'name']);
	},

	async down(queryInterface) {
		await queryInterface.dropTable('embed_builders');
	},
};
