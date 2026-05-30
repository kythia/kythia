/**
 * @namespace: addons/tempvoice/database/migrations/20251124_000035_create_temp_voice_configs_table.js
 * @type: Database Migration
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = {
	async up(queryInterface, DataTypes) {
		await queryInterface.createTable('temp_voice_configs', {
			guildId: {
				type: DataTypes.STRING,
				primaryKey: true,
				allowNull: false,
			},
			triggerChannelId: { type: DataTypes.STRING, allowNull: false },
			controlPanelChannelId: { type: DataTypes.STRING, allowNull: true },
			interfaceMessageId: { type: DataTypes.STRING, allowNull: true },
			categoryId: { type: DataTypes.STRING, allowNull: false },
			createdAt: { type: DataTypes.DATE, allowNull: false },
			updatedAt: { type: DataTypes.DATE, allowNull: false },
		});
	},
	async down(queryInterface) {
		await queryInterface.dropTable('temp_voice_configs');
	},
};
