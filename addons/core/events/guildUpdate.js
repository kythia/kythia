/**
 * @namespace: addons/core/events/guildUpdate.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { AuditLogEvent, MessageFlags } = require('discord.js');
const Sentry = require('@sentry/node');
function formatChanges(changes) {
	if (!changes || changes.length === 0) return 'No changes detected.';
	return changes
		.map((change) => {
			const key = change.key
				.replace(/_/g, ' ')
				.replace(/\b\w/g, (l) => l.toUpperCase());
			const oldValue = change.old ?? 'Nothing';
			const newValue = change.new ?? 'Nothing';
			return `**${key}**: \`${oldValue}\` \`${newValue}\``;
		})
		.join('\n');
}
const { BaseEvent } = require('kythia-core');
class GuildUpdateEvent extends BaseEvent {
	async execute(_oldGuild, newGuild) {
		const container = this.container;
		const _bot = {
			client: this.client,
			container: this.container,
		};
		const { kythiaConfig, models, helpers, logger, t } = container;
		const { ServerSetting } = models;
		const { simpleContainer } = helpers.discord;
		const { convertColor } = helpers.color;
		const guildId = newGuild.id;
		try {
			const settings = await ServerSetting.getCache({
				guildId: newGuild.id,
			});
			if (!settings?.auditLogChannelId) return;
			const logChannel = await helpers.discord.getChannelSafe(
				newGuild,
				settings.auditLogChannelId,
			);
			if (!logChannel?.isTextBased()) return;
			if (
				!logChannel
					.permissionsFor(this.client.user)
					?.has(['ViewChannel', 'SendMessages'])
			)
				return;
			if (!newGuild.members.me?.permissions?.has('ViewAuditLog')) return;
			const audit = await newGuild
				.fetchAuditLogs({
					type: AuditLogEvent.GuildUpdate,
					limit: 1,
				})
				.catch(() => null);
			if (!audit) return;
			const entry = audit.entries.find(
				(e) => e.createdTimestamp > Date.now() - 5000,
			);
			if (!entry) return;
			const executor = entry.executor;
			const components = await simpleContainer(
				{
					client: this.client,
					guildId: guildId,
				},
				await t(
					{
						client: this.client,
						guildId: guildId,
					},
					'core.events.guildUpdate.log',
					{
						var0: executor?.id || 'Unknown',
						var1: formatChanges(entry.changes),
						conditional2: entry.reason
							? await t(
									{
										client: this.client,
										guildId: guildId,
									},
									'core.events.common.reason',
									{
										reason: entry.reason,
									},
								)
							: '',
						var3: executor?.tag || 'Unknown',
						var4: executor?.id || 'Unknown',
						var5: Math.floor(Date.now() / 1000),
					},
				),
				{
					color: convertColor('Blurple', {
						from: 'discord',
						to: 'decimal',
					}),
					withFooter: true,
				},
			);
			await logChannel.send({
				components,
				flags: MessageFlags.IsComponentsV2,
				allowedMentions: {
					parse: [],
				},
			});
		} catch (err) {
			logger.error(`Error: ${err.message || err}`, {
				label: 'guildUpdate',
			});
			if (kythiaConfig?.sentry?.dsn) {
				Sentry.captureException(err);
			}
		}
	}
}
module.exports = GuildUpdateEvent;
