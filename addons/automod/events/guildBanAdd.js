/**
 * @namespace: addons/automod/events/guildBanAdd.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { AuditLogEvent } = require('discord.js');
const { checkThreshold } = require('../helpers/antinuke');

module.exports = async (bot, ban) => {
	if (!ban.guild) return;

	try {
		if (!ban.guild.members.me?.permissions?.has('ViewAuditLog')) return;
		const audit = await ban.guild
			.fetchAuditLogs({
				type: AuditLogEvent.MemberBanAdd,
				limit: 1,
			})
			.catch(() => null);
		if (!audit) return;
		const entry = audit.entries.find(
			(e) =>
				e.target?.id === ban.user.id && e.createdTimestamp > Date.now() - 5000,
		);
		if (!entry?.executor) return;

		await checkThreshold({
			bot,
			guild: ban.guild,
			executor: entry.executor,
			moduleName: 'massBan',
			detail: `Banned user: ${ban.user.tag}`,
		});
	} catch (err) {
		bot.client.container.logger.error(
			`guildBanAdd error: ${err.message || err}`,
			{
				label: 'antinuke',
			},
		);
	}
};
