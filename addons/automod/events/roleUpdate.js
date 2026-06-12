/**
 * @namespace: addons/automod/events/roleUpdate.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { AuditLogEvent } = require('discord.js');
const { checkThreshold, revertTampering } = require('../helpers/antinuke');

module.exports = async (bot, oldRole, newRole) => {
	const guild = newRole.guild;
	if (!guild) return;

	try {
		if (!guild.members.me?.permissions?.has('ViewAuditLog')) return;

		const nameChanged = oldRole.name !== newRole.name;
		const permsChanged =
			oldRole.permissions.bitfield !== newRole.permissions.bitfield;
		const colorChanged = oldRole.color !== newRole.color;
		const hoistChanged = oldRole.hoist !== newRole.hoist;
		const mentionableChanged = oldRole.mentionable !== newRole.mentionable;

		if (
			!nameChanged &&
			!permsChanged &&
			!colorChanged &&
			!hoistChanged &&
			!mentionableChanged
		)
			return;

		const audit = await guild
			.fetchAuditLogs({
				type: AuditLogEvent.RoleUpdate,
				limit: 1,
			})
			.catch(() => null);
		if (!audit) return;
		const entry = audit.entries.find(
			(e) =>
				e.target?.id === newRole.id && e.createdTimestamp > Date.now() - 5000,
		);
		if (!entry?.executor || entry.executor.bot) return;

		let detail = `Role modified: ${oldRole.name}`;
		if (nameChanged) detail += ` (renamed to ${newRole.name})`;

		// Revert changes
		await revertTampering(newRole, oldRole, 'role');

		await checkThreshold({
			bot,
			guild,
			executor: entry.executor,
			moduleName: 'roleUpdate',
			detail,
		});
	} catch (err) {
		bot.client.container.logger.error(
			`roleUpdate error: ${err.message || err}`,
			{
				label: 'antinuke',
			},
		);
	}
};
