/**
 * @namespace: addons/modmail/database/migrations/20260312_000050_create_modmail_configs_table.js
 * @type: Database Migration
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = {
	async up(queryInterface, DataTypes) {
		await queryInterface.createTable('modmail_configs', {
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			guildId: { type: DataTypes.STRING, allowNull: false, unique: true },
			inboxChannelId: { type: DataTypes.STRING, allowNull: false },
			logsChannelId: { type: DataTypes.STRING, allowNull: true },
			transcriptChannelId: { type: DataTypes.STRING, allowNull: true },
			staffRoleId: { type: DataTypes.STRING, allowNull: true },
			pingStaff: { type: DataTypes.BOOLEAN, defaultValue: true },
			greetingMessage: { type: DataTypes.TEXT, allowNull: true },
			closingMessage: { type: DataTypes.TEXT, allowNull: true },
			// JSON array of user IDs who are blocked from using modmail
			blockedUserIds: { type: DataTypes.JSON, defaultValue: [] },
			// JSON object: { name: content } quick-reply snippets
			snippets: { type: DataTypes.JSON, defaultValue: {} },
		});

		await queryInterface.addIndex('modmail_configs', ['guildId']);
	},
	async down(queryInterface) {
		await queryInterface.dropTable('modmail_configs');
	},
};
