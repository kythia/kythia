/**
 * @namespace: addons/core/events/guildScheduledEventUpdate.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { AuditLogEvent, MessageFlags } = require('discord.js');
const Sentry = require('@sentry/node');
const { BaseEvent } = require('kythia-core');
class GuildScheduledEventUpdateEvent extends BaseEvent {
	async execute(oldEvent, newEvent) {
		const container = this.container;
		const _bot = {
			client: this.client,
			container: this.container,
		};
		if (!newEvent.guild) return;
		const { kythiaConfig, models, helpers, logger, t } = container;
		const { ServerSetting } = models;
		const { simpleContainer } = helpers.discord;
		const { convertColor } = helpers.color;
		const guildId = newEvent.guild.id;
		try {
			const settings = await ServerSetting.getCache({
				guildId: newEvent.guild.id,
			});
			if (!settings?.auditLogChannelId) return;
			const logChannel = await helpers.discord.getChannelSafe(
				newEvent.guild,
				settings.auditLogChannelId,
			);
			if (!logChannel?.isTextBased()) return;
			if (
				!logChannel
					.permissionsFor(this.client.user)
					?.has(['ViewChannel', 'SendMessages'])
			)
				return;
			if (!newEvent.guild.members.me?.permissions?.has('ViewAuditLog')) return;
			const audit = await newEvent.guild
				.fetchAuditLogs({
					type: AuditLogEvent.GuildScheduledEventUpdate,
					limit: 1,
				})
				.catch(() => null);
			if (!audit) return;
			const entry = audit.entries.find(
				(e) =>
					e.target?.id === newEvent.id &&
					e.createdTimestamp > Date.now() - 5000,
			);
			if (!entry) return;
			const executor = entry.executor;
			const changes = [];
			if (oldEvent.name !== newEvent.name) {
				changes.push(`**Name**: \`${oldEvent.name}\` \`${newEvent.name}\``);
			}
			if (oldEvent.description !== newEvent.description) {
				changes.push(
					`**Description**: \`${oldEvent.description || 'None'}\` \`${newEvent.description || 'None'}\``,
				);
			}
			if (oldEvent.status !== newEvent.status) {
				changes.push(
					`**Status**: \`${oldEvent.status}\` \`${newEvent.status}\``,
				);
			}
			if (changes.length === 0) return;
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
					'core.events.guildScheduledEventUpdate.log',
					{
						name: newEvent.name,
						changes: changes.join('\n'),
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
				label: 'guildScheduledEventUpdate',
			});
			if (kythiaConfig?.sentry?.dsn) {
				Sentry.captureException(err);
			}
		}
	}
}
module.exports = GuildScheduledEventUpdateEvent;
