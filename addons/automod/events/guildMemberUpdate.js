/**
 * @namespace: addons/automod/events/guildMemberUpdate.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { AuditLogEvent, PermissionFlagsBits } = require('discord.js');
const { checkInstant } = require('../helpers/antinuke');
const { getAntiNukeConfig } = require('../helpers/antinuke');

module.exports = async (bot, oldMember, newMember) => {
	if (!newMember.guild) return;

	try {
		// Check if admin was newly granted
		const hadAdmin = oldMember.permissions.has(
			PermissionFlagsBits.Administrator,
		);
		const hasAdmin = newMember.permissions.has(
			PermissionFlagsBits.Administrator,
		);
		if (hadAdmin || !hasAdmin) return; // only care about newly granted

		// Early exit if antiNuke is not enabled — avoids useless API calls
		const { ServerSetting } = bot.client.container.models;
		const settings = await ServerSetting.getCache({
			guildId: newMember.guild.id,
		}).catch(() => null);
		const config = getAntiNukeConfig(settings);
		if (!config.enabled) return;
		if (!config.modules?.adminGrant?.enabled) return;

		// Bot must have ViewAuditLog permission to fetch audit logs
		const me = newMember.guild.members.me;
		if (!me?.permissions.has(PermissionFlagsBits.ViewAuditLog)) return;

		// Find who granted it
		if (!newMember.guild.members.me?.permissions?.has('ViewAuditLog')) return;
		const audit = await newMember.guild
			.fetchAuditLogs({
				type: AuditLogEvent.MemberRoleUpdate,
				limit: 5,
			})
			.catch(() => null);
		if (!audit) return;
		const entry = audit.entries.find(
			(e) =>
				e.target?.id === newMember.id && e.createdTimestamp > Date.now() - 5000,
		);
		if (!entry?.executor) return;

		await checkInstant({
			bot,
			guild: newMember.guild,
			executor: entry.executor,
			moduleName: 'adminGrant',
			detail: `Granted Administrator to ${newMember.user.tag}`,
		});
	} catch (err) {
		// Log non-permission errors only, permission errors are expected
		// when bot doesn't have required permissions in certain guilds
		if (err?.code !== 50013) {
			bot.client.container.logger.error(
				`guildMemberUpdate (adminGrant) error: ${err.message}`,
				{ label: 'antinuke' },
			);
		}
	}
};
