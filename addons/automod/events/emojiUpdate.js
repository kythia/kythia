/**
 * @namespace: addons/automod/events/emojiUpdate.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { AuditLogEvent } = require('discord.js');
const { checkThreshold, revertTampering } = require('../helpers/antinuke');

const { BaseEvent } = require('kythia-core');

class EmojiUpdateEvent extends BaseEvent {
	async execute(oldEmoji, newEmoji) {
		const container = this.container;
		const bot = { client: this.client, container: this.container };

		const guild = newEmoji.guild;
		if (!guild) return;

		try {
			if (!guild.members.me?.permissions?.has('ViewAuditLog')) return;

			const nameChanged = oldEmoji.name !== newEmoji.name;

			if (!nameChanged) return;

			const audit = await guild
				.fetchAuditLogs({
					type: AuditLogEvent.EmojiUpdate,
					limit: 1,
				})
				.catch(() => null);
			if (!audit) return;
			const entry = audit.entries.find(
				(e) =>
					e.target?.id === newEmoji.id &&
					e.createdTimestamp > Date.now() - 5000,
			);
			if (!entry?.executor || entry.executor.bot) return;

			const detail = `Emoji renamed: :${oldEmoji.name}: -> :${newEmoji.name}:`;

			// Revert changes
			await revertTampering(newEmoji, oldEmoji, 'emoji');

			await checkThreshold({
				bot,
				guild,
				executor: entry.executor,
				moduleName: 'emojiUpdate',
				detail,
			});
		} catch (err) {
			this.container.logger.error(`emojiUpdate error: ${err.message || err}`, {
				label: 'antinuke',
			});
		}
	}
}

module.exports = EmojiUpdateEvent;
