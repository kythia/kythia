/**
 * @namespace: addons/activity/events/messageCreate.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

/**
 * Increments totalMessages for a guild member on every non-bot message.
 * Uses findOrCreate to avoid a separate existence check.
 *
 * @param {import('kythia-core').Kythia} bot
 * @param {import('discord.js').Message} message
 */
module.exports = async (bot, message) => {
	if (message.author.bot || !message.guild) return;

	const { models } = bot.client.container;
	const { ServerSetting, ActivityStat, ActivityLog } = models;

	const guildId = message.guild.id;
	const userId = message.author.id;

	// Feature flag check
	const serverSetting = await ServerSetting.getCache({ guildId });
	if (!serverSetting?.activityOn) return;

	const today = new Date().toISOString().slice(0, 10);

	try {
		// All-time counter
		const [stat, statCreated] = await ActivityStat.getOrCreateCache(
			{ guildId, userId },
			{ totalMessages: '1', totalVoiceTime: '0' },
		);

		if (!statCreated) {
			stat.totalMessages = (BigInt(stat.totalMessages) + 1n).toString();
			stat.changed('totalMessages', true);
			await stat.save();
		}

		// Daily bucket
		const [log, logCreated] = await ActivityLog.getOrCreateCache(
			{ guildId, userId, date: today },
			{ messages: '1', voiceTime: '0' },
		);

		if (!logCreated) {
			log.messages = (BigInt(log.messages) + 1n).toString();
			log.changed('messages', true);
			await log.save();
		}
	} catch (err) {
		bot.client.container.logger.error(
			`Failed to track message activity for ${userId} in ${guildId}: ${err.message}`,
			{ label: 'activity:messageCreate' },
		);
	}
};
