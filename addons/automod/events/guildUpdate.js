/**
 * @namespace: addons/automod/events/guildUpdate.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { AuditLogEvent } = require('discord.js');
const { checkInstant } = require('../helpers/antinuke');

const { BaseEvent } = require('kythia-core');

class GuildUpdateEvent extends BaseEvent {
	async execute(oldGuild, newGuild) {
		const _container = this.container;
		const bot = { client: this.client, container: this.container };

		try {
			if (!newGuild.members.me?.permissions?.has('ViewAuditLog')) return;

			const nameChanged = oldGuild.name !== newGuild.name;
			const iconChanged = oldGuild.icon !== newGuild.icon;
			const vanityChanged = oldGuild.vanityURLCode !== newGuild.vanityURLCode;

			if (!nameChanged && !iconChanged && !vanityChanged) return;

			const audit = await newGuild
				.fetchAuditLogs({
					type: AuditLogEvent.GuildUpdate,
					limit: 1,
				})
				.catch(() => null);
			if (!audit) return;
			const entry = audit.entries.find(
				(e) =>
					e.target?.id === newGuild.id &&
					e.createdTimestamp > Date.now() - 5000,
			);
			if (!entry?.executor || entry.executor.bot) return;

			let detail = 'Tampering detected: ';
			if (nameChanged)
				detail += `Name (${oldGuild.name} -> ${newGuild.name}). `;
			if (iconChanged) detail += `Icon changed. `;
			if (vanityChanged) detail += `Vanity URL changed. `;

			await checkInstant({
				bot,
				guild: newGuild,
				executor: entry.executor,
				moduleName: 'serverUpdate',
				detail: detail.trim(),
				tamperData: { entity: newGuild, oldState: oldGuild, type: 'guild' },
			});
		} catch (err) {
			this.container.logger.error(`guildUpdate error: ${err.message || err}`, {
				label: 'antinuke',
			});
		}
	}
}

module.exports = GuildUpdateEvent;
