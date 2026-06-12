/**
 * @namespace: addons/automod/events/inviteDelete.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { AuditLogEvent } = require('discord.js');
const { checkThreshold } = require('../helpers/antinuke');

module.exports = async (bot, invite) => {
	const guild = invite.guild;
	if (!guild) return;

	try {
		if (!guild.members.me?.permissions?.has('ViewAuditLog')) return;

		const audit = await guild
			.fetchAuditLogs({
				type: AuditLogEvent.InviteDelete,
				limit: 1,
			})
			.catch(() => null);
		if (!audit) return;
		const entry = audit.entries.find(
			(e) =>
				e.target?.code === invite.code &&
				e.createdTimestamp > Date.now() - 5000,
		);
		if (!entry?.executor || entry.executor.bot) return;

		const detail = `Invite deleted: ${invite.code}`;

		await checkThreshold({
			bot,
			guild,
			executor: entry.executor,
			moduleName: 'inviteDelete',
			detail,
		});
	} catch (err) {
		bot.client.container.logger.error(
			`inviteDelete error: ${err.message || err}`,
			{
				label: 'antinuke',
			},
		);
	}
};
