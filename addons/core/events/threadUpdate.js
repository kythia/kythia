/**
 * @namespace: addons/core/events/threadUpdate.js
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
class ThreadUpdateEvent extends BaseEvent {
	async execute(_oldThread, newThread) {
		const container = this.container;
		const _bot = {
			client: this.client,
			container: this.container,
		};
		if (!newThread.guild) return;
		const { kythiaConfig, models, helpers, logger, t } = container;
		const { ServerSetting } = models;
		const { simpleContainer } = helpers.discord;
		const { convertColor } = helpers.color;
		const guildId = newThread.guild.id;
		try {
			const settings = await ServerSetting.getCache({
				guildId: newThread.guild.id,
			});
			if (!settings?.auditLogChannelId) return;
			const logChannel = await helpers.discord.getChannelSafe(
				newThread.guild,
				settings.auditLogChannelId,
			);
			if (!logChannel?.isTextBased()) return;
			if (
				!logChannel
					.permissionsFor(this.client.user)
					?.has(['ViewChannel', 'SendMessages'])
			)
				return;
			if (!newThread.guild.members.me?.permissions?.has('ViewAuditLog')) return;
			const audit = await newThread.guild
				.fetchAuditLogs({
					type: AuditLogEvent.ThreadUpdate,
					limit: 1,
				})
				.catch(() => null);
			if (!audit) return;
			const entry = audit.entries.find(
				(e) =>
					e.target?.id === newThread.id &&
					e.createdTimestamp > Date.now() - 5000,
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
					'core.events.threadUpdate.log',
					{
						id: newThread.id,
						changes: formatChanges(entry.changes),
						reason: entry.reason
							? await t(
									{
										client: this.client,
										guildId: guildId,
									},
									'core.helpers.index.events.common.reason',
									{
										reason: entry.reason,
									},
								)
							: '',
						executorTag: executor?.tag || 'Unknown',
						executorId: executor?.id || 'Unknown',
						timestamp: Math.floor(Date.now() / 1000),
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
				label: 'threadUpdate',
			});
			if (kythiaConfig?.sentry?.dsn) {
				Sentry.captureException(err);
			}
		}
	}
}
module.exports = ThreadUpdateEvent;
