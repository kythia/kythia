/**
 * @namespace: addons/automod/events/roleDelete.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { AuditLogEvent } = require('discord.js');
const { checkThreshold } = require('../helpers/antinuke');

module.exports = async (bot, role) => {
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
			(e) => e.target?.id === role.id && e.createdTimestamp > Date.now() - 5000,
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
		bot.client.container.logger.error(
			`roleDelete error: ${err.message || err}`,
			{
				label: 'antinuke',
			},
		);
	}
};
