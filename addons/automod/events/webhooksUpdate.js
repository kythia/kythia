/**
 * @namespace: addons/automod/events/webhooksUpdate.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { AuditLogEvent } = require('discord.js');
const { checkThreshold } = require('../helpers/antinuke');

module.exports = async (bot, channel) => {
	if (!channel.guild) return;

	try {
		if (!channel.guild.members.me?.permissions?.has('ViewAuditLog')) return;
		const audit = await channel.guild
			.fetchAuditLogs({
				type: AuditLogEvent.WebhookCreate,
				limit: 1,
			})
			.catch(() => null);
		if (!audit) return;
		const entry = audit.entries.find(
			(e) =>
				e.extra?.channel?.id === channel.id &&
				e.createdTimestamp > Date.now() - 5000,
		);
		if (!entry?.executor) return;

		await checkThreshold({
			bot,
			guild: channel.guild,
			executor: entry.executor,
			moduleName: 'webhookCreate',
			detail: `Created webhook in <#${channel.id}>: ${entry.target?.name || 'unknown'}`,
		});
	} catch (err) {
		bot.client.container.logger.error(
			`webhooksUpdate error: ${err.message || err}`,
			{
				label: 'antinuke',
			},
		);
	}
};
