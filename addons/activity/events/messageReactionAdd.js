/**
 * @namespace: addons/activity/events/messageReactionAdd.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
/**
 * @param {import('kythia-core').Kythia} bot
 * @param {import('discord.js').MessageReaction} reaction
 * @param {import('discord.js').User} user
 */

const { BaseEvent } = require('kythia-core');

class MessageReactionAddEvent extends BaseEvent {
	async execute(reaction, user) {
		const container = this.container;
		const bot = { client: this.client, container: this.container };

		if (!user || user.bot) return;
		if (!reaction.message?.guild) return;

		const { models } = this.container;
		const { ServerSetting, ActivityStat, ActivityLog } = models;

		const guildId = reaction.message.guild.id;
		const userId = user.id;

		// Feature flag check
		const serverSetting = await ServerSetting.getCache({ guildId });
		if (!serverSetting?.activityOn) return;

		const now = new Date();
		const today = now.toISOString().slice(0, 10);

		try {
			// All-time counter
			const [stat, statCreated] = await ActivityStat.firstOrCreateCache(
				{ guildId, userId },
				{
					totalMessages: '0',
					totalVoiceTime: '0',
					totalReactions: '1',
					totalVoiceJoins: '0',
				},
			);

			if (!statCreated) {
				stat.totalReactions = (BigInt(stat.totalReactions) + 1n).toString();
				stat.changed('totalReactions', true);
				await stat.save();
			}

			// Daily bucket
			const [log, logCreated] = await ActivityLog.firstOrCreateCache(
				{ guildId, userId, date: today },
				{ messages: '0', voiceTime: '0', reactions: '1' },
			);

			if (!logCreated) {
				log.reactions = (BigInt(log.reactions) + 1n).toString();
				log.changed('reactions', true);
				await log.save();
			}

			// Achievement check (fire-and-forget)
			const { checkAndUnlock } = require('../helpers/achievementChecker');
			checkAndUnlock('reaction', {
				guildId,
				userId,
				guild: reaction.message.guild,
				container: this.container,
			}).catch(() => null);
		} catch (err) {
			this.container.logger.error(
				`Failed to track reaction for ${userId} in ${guildId}: ${err.message}`,
				{ label: 'activity:messageReactionAdd' },
			);
		}
	}
}

module.exports = MessageReactionAddEvent;
