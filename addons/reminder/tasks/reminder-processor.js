/**
 * @namespace: addons/reminder/tasks/reminder-processor.js
 * @type: Scheduled Task
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');
const { Op } = require('sequelize');
const { BaseTask } = require('kythia-core');
class ReminderProcessorTask extends BaseTask {
	taskName = 'reminder-processor';
	schedule = '* * * * *'; // Every minute
	active = true;
	async execute(container) {
		const { logger, client, models, helpers, t } = container;
		const { KythiaReminder } = models;
		const { getTextChannelSafe } = helpers.discord;
		logger.info('⏰ Running reminder processor task...', {
			label: 'reminder-processor',
		});
		try {
			// Find all reminders where expiresAt is less than or equal to now
			const expiredReminders = await KythiaReminder.getAllCache({
				where: {
					expiresAt: {
						[Op.lte]: new Date(),
					},
				},
			});
			if (!expiredReminders || expiredReminders.length === 0) return;
			for (const reminder of expiredReminders) {
				try {
					let targetChannel = null;
					let user = null;
					try {
						user = await client.container.helpers.discord.getUserSafe(
							client,
							reminder.userId,
						);
					} catch (_e) {
						// User not found or bot can't fetch them
					}
					if (!user) {
						await reminder.destroy();
						continue;
					}
					const titleContent = await t(
						{
							locale: 'en-US',
						},
						'reminder.tasks.reminder-processor.processor.title',
					);
					const msgContent = await t(
						{
							locale: 'en-US',
						},
						'reminder.tasks.reminder-processor.processor.desc',
						{
							reason: reminder.reason,
							user: `<@${reminder.userId}>`,
							createdAt: `<t:${Math.floor(reminder.createdAt.getTime() / 1000)}:R>`,
						},
					);
					const { createContainer } = helpers.discord;
					const components = await createContainer(
						{
							client,
						},
						{
							title: titleContent,
							description: msgContent,
							color: container.kythiaConfig.bot.color,
						},
					);

					// If channelId is specified, try to send there, else fallback to DM
					if (reminder.channelId) {
						targetChannel = await getTextChannelSafe(
							client,
							reminder.channelId,
						);
					}
					const payload = {
						components,
						flags: MessageFlags.IsComponentsV2,
						allowedMentions: {
							parse: ['users'],
						},
					};
					if (targetChannel) {
						await targetChannel.send(payload);
					} else {
						// Send DM
						await user.send(payload);
					}

					// Reschedule or remove from DB after successful delivery
					if (reminder.repeatMode) {
						const nextDate = new Date(reminder.expiresAt);
						switch (reminder.repeatMode) {
							case 'daily':
								nextDate.setUTCDate(nextDate.getUTCDate() + 1);
								break;
							case 'weekly':
								nextDate.setUTCDate(nextDate.getUTCDate() + 7);
								break;
							case 'monthly':
								nextDate.setUTCMonth(nextDate.getUTCMonth() + 1);
								break;
						}

						// If the nextDate is somehow still in the past (e.g. bot was offline for days),
						// catch it up to the next future occurrence
						const now = new Date();
						while (nextDate <= now) {
							if (reminder.repeatMode === 'daily')
								nextDate.setUTCDate(nextDate.getUTCDate() + 1);
							else if (reminder.repeatMode === 'weekly')
								nextDate.setUTCDate(nextDate.getUTCDate() + 7);
							else if (reminder.repeatMode === 'monthly')
								nextDate.setUTCMonth(nextDate.getUTCMonth() + 1);
						}
						reminder.expiresAt = nextDate;
						await reminder.save();
					} else {
						await reminder.destroy();
					}
				} catch (err) {
					logger.error(
						`Failed to process reminder ID ${reminder.id}: ${err.message}`,
						{
							label: 'reminder-processor',
						},
					);
					// Destroy it anyway to prevent infinite loops if DM is locked,
					// UNLESS it's a recurring reminder, then just skip and it will retry next minute?
					// Wait, if DM is locked and we don't delete/advance it, it will spam the console every minute.
					// Let's just advance it or destroy it.
					if (reminder.repeatMode) {
						reminder.expiresAt = new Date(Date.now() + 60 * 60 * 1000); // Retry in 1 hour if failed
						await reminder.save().catch(() => {});
					} else {
						await reminder.destroy().catch(() => {});
					}
				}
			}
		} catch (err) {
			logger.error(
				`Failed to run reminder-processor task: ${err.message || err}`,
				{
					label: 'reminder-processor',
				},
			);
		}
	}
}
exports.default = ReminderProcessorTask;
