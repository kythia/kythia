/**
 * @namespace: addons/pet/database/migrations/20251124_000026_create_pets_table.js
 * @type: Database Migration
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = {
	async up(queryInterface, DataTypes) {
		await queryInterface.createTable('pets', {
			id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true }, // Biasanya butuh ID meski gak di-define eksplisit
			name: { type: DataTypes.STRING, allowNull: false },
			icon: { type: DataTypes.STRING, allowNull: false },
			rarity: {
				type: DataTypes.ENUM('common', 'rare', 'epic', 'legendary'),
				defaultValue: 'common',
			},
			bonusType: {
				type: DataTypes.ENUM('coin', 'ruby'),
				defaultValue: 'coin',
			},
			bonusValue: { type: DataTypes.INTEGER, defaultValue: 0 },
		});
	},
	async down(queryInterface) {
		await queryInterface.dropTable('pets');
	},
};
