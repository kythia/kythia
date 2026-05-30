/**
 * @namespace: addons/economy/tasks/loan-processor.js
 * @type: Scheduled Task
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 1.0.0-rc
 */

const { Op } = require('sequelize');
const { toBigIntSafe } = require('../helpers/bigint');

module.exports = {
	taskName: 'economy-loan-processor',
	schedule: '0 0 * * *', // Run once a day at midnight
	active: true,

	execute: async (container) => {
		const { client, models, logger } = container;
		const { KythiaUser } = models;

		if (client.shard && !client.shard.ids.includes(0)) {
			return;
		}

		logger.info(`Processing daily loan interests and defaults...`, {
			label: 'economy',
		});

		try {
			const usersWithLoans = await KythiaUser.findAll({
				where: {
					activeLoan: {
						[Op.gt]: 0,
					},
				},
			});

			for (const user of usersWithLoans) {
				const now = new Date();

				if (user.loanDueDate && new Date(user.loanDueDate) < now) {
					user.kythiaCoin = 0;
					user.kythiaBank = 0;
					user.activeLoan = 0;
					user.loanDueDate = null;
					user.loanInterest = 0;
					user.creditScore = Math.max(300, user.creditScore - 150);

					user.changed('kythiaCoin', true);
					user.changed('kythiaBank', true);
					user.changed('activeLoan', true);
					user.changed('loanDueDate', true);
					user.changed('loanInterest', true);
					user.changed('creditScore', true);

					await user.save();

					try {
						const discordUser = await client.users.fetch(user.userId);
						await discordUser.send(
							`## 🚨 LOAN DEFAULTED!\nYou failed to repay your loan in time. The bank has **seized all your cash and bank balance**, and your credit score has tanked!`,
						);
					} catch (e) {}
				} else {
					const currentLoan = Number(user.activeLoan);
					const interest = Math.floor(currentLoan * user.loanInterest);

					user.activeLoan = toBigIntSafe(currentLoan + interest);
					user.changed('activeLoan', true);
					await user.save();
				}
			}
		} catch (error) {
			logger.error(`Error processing loans: ${error.message || error}`, {
				label: 'economy',
			});
		}
	},
};
