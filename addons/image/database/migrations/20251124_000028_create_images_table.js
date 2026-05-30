/**
 * @namespace: addons/image/database/migrations/20251124_000028_create_images_table.js
 * @type: Database Migration
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = {
	async up(queryInterface, DataTypes) {
		await queryInterface.createTable('images', {
			id: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				autoIncrement: true,
			},
			userId: { type: DataTypes.STRING, allowNull: false },
			filename: { type: DataTypes.STRING, allowNull: false, unique: true },
			originalName: { type: DataTypes.STRING, allowNull: false },
			fileId: { type: DataTypes.STRING, allowNull: false, unique: true },
			storageUrl: { type: DataTypes.TEXT, allowNull: false },
			mimetype: { type: DataTypes.STRING, allowNull: false },
			fileSize: { type: DataTypes.INTEGER, allowNull: false },
			createdAt: { type: DataTypes.DATE, allowNull: false },
			updatedAt: { type: DataTypes.DATE, allowNull: false },
		});

		await queryInterface.addIndex('images', ['userId']);
		await queryInterface.addIndex('images', ['filename']);
		await queryInterface.addIndex('images', ['fileId']);
	},
	async down(queryInterface) {
		await queryInterface.dropTable('images');
	},
};
