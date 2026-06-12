/**
 * @namespace: addons/automod/events/channelUpdate.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { AuditLogEvent } = require('discord.js');
const { checkThreshold, revertTampering } = require('../helpers/antinuke');

module.exports = async (bot, oldChannel, newChannel) => {
	const guild = newChannel.guild;
	if (!guild) return;

	try {
		if (!guild.members.me?.permissions?.has('ViewAuditLog')) return;

		const nameChanged = oldChannel.name !== newChannel.name;

		if (!nameChanged) return; // Only care about renames for this module

		const audit = await guild
			.fetchAuditLogs({
				type: AuditLogEvent.ChannelUpdate,
				limit: 1,
			})
			.catch(() => null);
		if (!audit) return;
		const entry = audit.entries.find(
			(e) =>
				e.target?.id === newChannel.id &&
				e.createdTimestamp > Date.now() - 5000,
		);
		if (!entry?.executor || entry.executor.bot) return;

		const detail = `Channel renamed: ${oldChannel.name} -> ${newChannel.name}`;

		// Revert changes
		await revertTampering(newChannel, oldChannel, 'channel');

		await checkThreshold({
			bot,
			guild,
			executor: entry.executor,
			moduleName: 'channelUpdate',
			detail,
		});
	} catch (err) {
		bot.client.container.logger.error(
			`channelUpdate error: ${err.message || err}`,
			{
				label: 'antinuke',
			},
		);
	}
};
