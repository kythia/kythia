/**
 * @namespace: addons/economy/database/migrations/20260530_000001_add_economy_fields_to_users.js
 * @type: Database Migration
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = {
	async up(queryInterface, DataTypes) {
		await queryInterface.addColumn('kythia_users', 'extraBankCapacity', {
			type: DataTypes.BIGINT,
			defaultValue: 0,
		});
		await queryInterface.addColumn('kythia_users', 'bountyAmount', {
			type: DataTypes.BIGINT,
			defaultValue: 0,
		});
		await queryInterface.addColumn('kythia_users', 'profession', {
			type: DataTypes.STRING,
			allowNull: true,
			defaultValue: null,
		});
		await queryInterface.addColumn('kythia_users', 'careerLevel', {
			type: DataTypes.INTEGER,
			defaultValue: 0,
		});
		await queryInterface.addColumn('kythia_users', 'jobExp', {
			type: DataTypes.BIGINT,
			defaultValue: 0,
		});
		await queryInterface.addColumn('kythia_users', 'creditScore', {
			type: DataTypes.INTEGER,
			defaultValue: 300,
		});
		await queryInterface.addColumn('kythia_users', 'activeLoan', {
			type: DataTypes.BIGINT,
			defaultValue: 0,
		});
		await queryInterface.addColumn('kythia_users', 'loanInterest', {
			type: DataTypes.FLOAT,
			defaultValue: 0,
		});
		await queryInterface.addColumn('kythia_users', 'loanDueDate', {
			type: DataTypes.DATE,
			allowNull: true,
		});
	},

	async down(queryInterface) {
		await queryInterface.removeColumn('kythia_users', 'extraBankCapacity');
		await queryInterface.removeColumn('kythia_users', 'bountyAmount');
		await queryInterface.removeColumn('kythia_users', 'profession');
		await queryInterface.removeColumn('kythia_users', 'careerLevel');
		await queryInterface.removeColumn('kythia_users', 'jobExp');
		await queryInterface.removeColumn('kythia_users', 'creditScore');
		await queryInterface.removeColumn('kythia_users', 'activeLoan');
		await queryInterface.removeColumn('kythia_users', 'loanInterest');
		await queryInterface.removeColumn('kythia_users', 'loanDueDate');
	},
};
