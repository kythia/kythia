/**
 * @namespace: addons/adventure/database/migrations/20251120_000002_create_user_adventures_table.js
 * @type: Database Migration
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = {
	async up(queryInterface, DataTypes) {
		await queryInterface.createTable('user_adventures', {
			id: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				autoIncrement: true,
				allowNull: false,
			},
			userId: {
				type: DataTypes.STRING,
				allowNull: false,
				unique: true,
			},
			level: { type: DataTypes.INTEGER, defaultValue: 1 },
			xp: { type: DataTypes.INTEGER, defaultValue: 0 },
			hp: { type: DataTypes.INTEGER, defaultValue: 100 },
			maxHp: { type: DataTypes.INTEGER, defaultValue: 100 },
			gold: { type: DataTypes.INTEGER, defaultValue: 50 },
			strength: { type: DataTypes.INTEGER, defaultValue: 10 },
			defense: { type: DataTypes.INTEGER, defaultValue: 5 },
			characterId: { type: DataTypes.STRING, allowNull: true },

			monsterName: { type: DataTypes.STRING, allowNull: true },
			monsterHp: { type: DataTypes.INTEGER, defaultValue: 0 },
			monsterStrength: { type: DataTypes.INTEGER, defaultValue: 0 },
			monsterGoldDrop: { type: DataTypes.INTEGER, defaultValue: 0 },
			monsterXpDrop: { type: DataTypes.INTEGER, defaultValue: 0 },
		});
	},

	async down(queryInterface) {
		await queryInterface.dropTable('user_adventures');
	},
};
