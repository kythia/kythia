/**
 * @namespace: addons/automod/events/emojiDelete.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { AuditLogEvent } = require('discord.js');
const { checkThreshold } = require('../helpers/antinuke');

const { BaseEvent } = require('kythia-core');

class EmojiDeleteEvent extends BaseEvent {
	async execute(emoji) {
		const _container = this.container;
		const bot = { client: this.client, container: this.container };

		const guild = emoji.guild;
		if (!guild) return;

		try {
			if (!guild.members.me?.permissions?.has('ViewAuditLog')) return;

			const audit = await guild
				.fetchAuditLogs({
					type: AuditLogEvent.EmojiDelete,
					limit: 1,
				})
				.catch(() => null);
			if (!audit) return;
			const entry = audit.entries.find(
				(e) =>
					e.target?.id === emoji.id && e.createdTimestamp > Date.now() - 5000,
			);
			if (!entry?.executor || entry.executor.bot) return;

			const detail = `Emoji deleted: :${emoji.name}:`;

			await checkThreshold({
				bot,
				guild,
				executor: entry.executor,
				moduleName: 'emojiDelete',
				detail,
			});
		} catch (err) {
			this.container.logger.error(`emojiDelete error: ${err.message || err}`, {
				label: 'antinuke',
			});
		}
	}
}

module.exports = EmojiDeleteEvent;
