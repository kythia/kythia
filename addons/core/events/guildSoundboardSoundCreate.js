/**
 * @namespace: addons/core/events/guildSoundboardSoundCreate.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { AuditLogEvent, MessageFlags } = require('discord.js');
const Sentry = require('@sentry/node');
const { BaseEvent } = require('kythia-core');
class GuildSoundboardSoundCreateEvent extends BaseEvent {
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
					type: AuditLogEvent.SoundboardSoundCreate,
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
					'core.events.guildSoundboardSoundCreate.log',
					{
						var0: executor?.id || 'Unknown',
						name: sound.name,
						emoji: sound.emoji || 'None',
						volume: sound.volume || 1.0,
						conditional4: entry.reason
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
						var5: executor?.tag || 'Unknown',
						var6: executor?.id || 'Unknown',
						var7: Math.floor(Date.now() / 1000),
					},
				),
				{
					color: convertColor('Green', {
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
				label: 'guildSoundboardSoundCreate',
			});
			if (kythiaConfig?.sentry?.dsn) {
				Sentry.captureException(err);
			}
		}
	}
}
module.exports = GuildSoundboardSoundCreateEvent;
