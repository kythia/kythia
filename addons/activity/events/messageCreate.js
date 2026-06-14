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

const { BaseEvent } = require('kythia-core');

class MessageCreateEvent extends BaseEvent {
	async execute(message) {
		if (!message.author || message.author.bot || !message.guild) return;

		const container = this.container;

		const { models } = container;
		const { ServerSetting, ActivityStat, ActivityLog, ActivityHourly } = models;

		const guildId = message.guild.id;
		const userId = message.author.id;

		// Feature flag check
		const serverSetting = await ServerSetting.getCache({ guildId });
		if (!serverSetting?.activityOn) return;

		const now = new Date();
		const today = now.toISOString().slice(0, 10);
		const dayOfWeek = now.getDay();
		const hour = now.getHours();

		try {
			// All-time counter
			const [stat, statCreated] = await ActivityStat.firstOrCreateCache(
				{ guildId, userId },
				{
					totalMessages: '1',
					totalVoiceTime: '0',
					totalReactions: '0',
					totalVoiceJoins: '0',
				},
			);

			if (!statCreated) {
				stat.totalMessages = (BigInt(stat.totalMessages) + 1n).toString();
				stat.changed('totalMessages', true);
				await stat.save();
			}

			// Daily bucket
			const [log, logCreated] = await ActivityLog.firstOrCreateCache(
				{ guildId, userId, date: today },
				{ messages: '1', voiceTime: '0', reactions: '0' },
			);

			if (!logCreated) {
				log.messages = (BigInt(log.messages) + 1n).toString();
				log.changed('messages', true);
				await log.save();
			}

			// Hourly bucket
			const [hourlyLog, hourlyCreated] =
				await ActivityHourly.firstOrCreateCache(
					{ guildId, dayOfWeek, hour },
					{ messages: '1', voiceTime: '0' },
				);

			if (!hourlyCreated) {
				hourlyLog.messages = (BigInt(hourlyLog.messages) + 1n).toString();
				hourlyLog.changed('messages', true);
				await hourlyLog.save();
			}

			// ── Achievement checks ──────────────────────────────────────────
			const { checkAndUnlock } = require('../helpers/achievementChecker');

			// Detect special flags
			const specialFlags = [];

			// First message ever in this guild
			if (statCreated || BigInt(stat.totalMessages) === 1n) {
				specialFlags.push('first_message');
			}

			// Night owl: message sent at exactly 03:xx UTC
			if (now.getUTCHours() === 3) {
				specialFlags.push('night_owl');
			}

			// Wall of text: message longer than 1000 characters
			if (message.content?.length > 1000) {
				specialFlags.push('wall_of_text');
			}

			// Precision typer: message exactly 200 characters
			if (message.content?.length === 200) {
				specialFlags.push('precision_typer');
			}

			// Talking to myself: reply to own message
			if (
				message.reference?.messageId &&
				message.channel.messages?.cache.get(message.reference.messageId)?.author
					?.id === userId
			) {
				specialFlags.push('talking_to_myself');
			}

			// Fire-and-forget achievement check (non-blocking)
			checkAndUnlock('message', {
				guildId,
				userId,
				guild: message.guild,
				container: this.container,
				specialFlags,
			}).catch(() => null);
		} catch (err) {
			this.container.logger.error(
				`Failed to track message activity for ${userId} in ${guildId}: ${err.message}`,
				{ label: 'activity:messageCreate' },
			);
		}
	}
}

module.exports = MessageCreateEvent;
