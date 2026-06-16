/**
 * @namespace: addons/economy/tasks/loan-processor.js
 * @type: Scheduled Task
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { Op } = require('sequelize');
const { toBigIntSafe } = require('../helpers/bigint');
const { BaseTask } = require('kythia-core');
class LoanProcessorTask extends BaseTask {
	task = {
		taskName: 'economy-loan-processor',
		schedule: '0 0 * * *',
		// Run once a day at midnight
		active: true,
	};
	async execute(container) {
		const { client, models, logger, t } = container || this.container;
		const { KythiaUser } = models;
		if (client.shard && !client.shard.ids.includes(0)) {
			return;
		}
		logger.info(`Processing daily loan interests and defaults...`, {
			label: 'economy',
		});
		try {
			const usersWithLoans = await KythiaUser.getAllCache({
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
						const discordUser =
							await client.container.helpers.discord.getUserSafe(
								client,
								user.userId,
							);
						await discordUser.send(
							await t(null, 'economy.tasks.loan.defaulted'),
						);
					} catch (_e) {}
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
	}
}
exports.default = LoanProcessorTask;
