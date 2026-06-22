/**
 * @namespace: addons/core/events/stageInstanceUpdate.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { AuditLogEvent, MessageFlags } = require('discord.js');
const Sentry = require('@sentry/node');
const { BaseEvent } = require('kythia-core');
class StageInstanceUpdateEvent extends BaseEvent {
	async execute(oldStage, newStage) {
		const container = this.container;
		const _bot = {
			client: this.client,
			container: this.container,
		};
		if (!newStage.guild) return;
		const { kythiaConfig, models, helpers, logger, t } = container;
		const { ServerSetting } = models;
		const { simpleContainer } = helpers.discord;
		const { convertColor } = helpers.color;
		const guildId = newStage.guild.id;
		try {
			const settings = await ServerSetting.getCache({
				guildId: newStage.guild.id,
			});
			if (!settings?.auditLogChannelId) return;
			const logChannel = await helpers.discord.getChannelSafe(
				newStage.guild,
				settings.auditLogChannelId,
			);
			if (!logChannel?.isTextBased()) return;
			if (
				!logChannel
					.permissionsFor(this.client.user)
					?.has(['ViewChannel', 'SendMessages'])
			)
				return;
			if (!newStage.guild.members.me?.permissions?.has('ViewAuditLog')) return;
			const audit = await newStage.guild
				.fetchAuditLogs({
					type: AuditLogEvent.StageInstanceUpdate,
					limit: 1,
				})
				.catch(() => null);
			if (!audit) return;
			const entry = audit.entries.find(
				(e) =>
					e.target?.id === newStage.id &&
					e.createdTimestamp > Date.now() - 5000,
			);
			if (!entry) return;
			const changes = [];
			if (oldStage.topic !== newStage.topic) {
				changes.push(`**Topic**: \`${oldStage.topic}\` \`${newStage.topic}\``);
			}
			if (oldStage.privacyLevel !== newStage.privacyLevel) {
				const oldPrivacy =
					oldStage.privacyLevel === 1 ? 'Public' : 'Guild Only';
				const newPrivacy =
					newStage.privacyLevel === 1 ? 'Public' : 'Guild Only';
				changes.push(`**Privacy**: \`${oldPrivacy}\` \`${newPrivacy}\``);
			}
			if (changes.length === 0) return;
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
					'core.events.stageInstanceUpdate.log',
					{
						channelId: newStage.channelId,
						changes: changes.join('\n'),
						reason: entry.reason
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
				label: 'stageInstanceUpdate',
			});
			if (kythiaConfig?.sentry?.dsn) {
				Sentry.captureException(err);
			}
		}
	}
}
module.exports = StageInstanceUpdateEvent;
