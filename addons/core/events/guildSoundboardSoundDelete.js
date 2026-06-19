/**
 * @namespace: addons/core/events/guildSoundboardSoundDelete.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { AuditLogEvent, MessageFlags } = require('discord.js');
const Sentry = require('@sentry/node');
const { BaseEvent } = require('kythia-core');
class GuildSoundboardSoundDeleteEvent extends BaseEvent {
	async execute(sound) {
		const container = this.container;
		const _bot = {
			client: this.client,
			container: this.container,
		};
		if (!sound.guild) return;
		const { kythiaConfig, models, helpers, logger, t } = container;
		const { ServerSetting } = models;
		const { simpleContainer } = helpers.discord;
		const { convertColor } = helpers.color;
		const guildId = sound.guild.id;
		try {
			const settings = await ServerSetting.getCache({
				guildId: sound.guild.id,
			});
			if (!settings?.auditLogChannelId) return;
			const logChannel = await helpers.discord.getChannelSafe(
				sound.guild,
				settings.auditLogChannelId,
			);
			if (!logChannel?.isTextBased()) return;
			if (
				!logChannel
					.permissionsFor(this.client.user)
					?.has(['ViewChannel', 'SendMessages'])
			)
				return;
			if (!sound.guild.members.me?.permissions?.has('ViewAuditLog')) return;
			const audit = await sound.guild
				.fetchAuditLogs({
					type: AuditLogEvent.SoundboardSoundDelete,
					limit: 1,
				})
				.catch(() => null);
			if (!audit) return;
			const entry = audit.entries.find(
				(e) =>
					e.target?.id === sound.soundId &&
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
					'core.events.guildSoundboardSoundDelete.log',
					{
						var0: executor?.id || 'Unknown',
						name: sound.name,
						emoji: sound.emoji || 'None',
						conditional3: entry.reason
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
						var4: executor?.tag || 'Unknown',
						var5: executor?.id || 'Unknown',
						var6: Math.floor(Date.now() / 1000),
					},
				),
				{
					color: convertColor('Red', {
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
				label: 'guildSoundboardSoundDelete',
			});
			if (kythiaConfig?.sentry?.dsn) {
				Sentry.captureException(err);
			}
		}
	}
}
module.exports = GuildSoundboardSoundDeleteEvent;
