/**
 * @namespace: addons/automod/events/roleDelete.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { AuditLogEvent } = require('discord.js');
const { checkThreshold } = require('../helpers/antinuke');

const { BaseEvent } = require('kythia-core');

class RoleDeleteEvent extends BaseEvent {
	async execute(role) {
		const _container = this.container;
		const bot = { client: this.client, container: this.container };

		if (!role.guild) return;

		try {
			if (!role.guild.members.me?.permissions?.has('ViewAuditLog')) return;
			const audit = await role.guild
				.fetchAuditLogs({
					type: AuditLogEvent.RoleDelete,
					limit: 1,
				})
				.catch(() => null);
			if (!audit) return;
			const entry = audit.entries.find(
				(e) =>
					e.target?.id === role.id && e.createdTimestamp > Date.now() - 5000,
			);
			if (!entry?.executor) return;

			await checkThreshold({
				bot,
				guild: role.guild,
				executor: entry.executor,
				moduleName: 'roleDelete',
				detail: `Deleted role: ${role.name}`,
			});
		} catch (err) {
			this.container.logger.error(`roleDelete error: ${err.message || err}`, {
				label: 'antinuke',
			});
		}
	}
}

module.exports = RoleDeleteEvent;
