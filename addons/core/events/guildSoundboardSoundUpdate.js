/**
 * @namespace: addons/core/events/guildSoundboardSoundUpdate.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const {
	AuditLogEvent,
	MessageFlags,
	ContainerBuilder,
	SeparatorBuilder,
	TextDisplayBuilder,
	SeparatorSpacingSize,
} = require('discord.js');
const Sentry = require('@sentry/node');
const { BaseEvent } = require('kythia-core');
class GuildSoundboardSoundUpdateEvent extends BaseEvent {
	async execute(oldSound, newSound) {
		const container = this.container;
		const bot = {
			client: this.client,
			container: this.container,
		};
		if (!newSound.guild) return;
		const { models, helpers, logger, t } = container;
		const { ServerSetting } = models;
		const { convertColor } = helpers.color;
		const guildId = newSound.guild.id;
		try {
			const settings = await ServerSetting.getCache({
				guildId: newSound.guild.id,
			});
			if (!settings?.auditLogChannelId) return;
			const logChannel = await helpers.discord.getChannelSafe(
				newSound.guild,
				settings.auditLogChannelId,
			);
			if (!logChannel?.isTextBased()) return;
			if (
				!logChannel
					.permissionsFor(this.client.user)
					?.has(['ViewChannel', 'SendMessages'])
			)
				return;
			if (!newSound.guild.members.me?.permissions?.has('ViewAuditLog')) return;
			const audit = await newSound.guild
				.fetchAuditLogs({
					type: AuditLogEvent.SoundboardSoundUpdate,
					limit: 1,
				})
				.catch(() => null);
			if (!audit) return;
			const entry = audit.entries.find(
				(e) =>
					e.target?.id === newSound.soundId &&
					e.createdTimestamp > Date.now() - 5000,
			);
			if (!entry) return;
			const changes = [];
			if (oldSound.name !== newSound.name) {
				changes.push(`**Name**: \`${oldSound.name}\` ➔ \`${newSound.name}\``);
			}
			if (oldSound.emoji !== newSound.emoji) {
				changes.push(
					`**Emoji**: \`${oldSound.emoji || 'None'}\` ➔ \`${newSound.emoji || 'None'}\``,
				);
			}
			if (oldSound.volume !== newSound.volume) {
				changes.push(
					`**Volume**: \`${oldSound.volume}\` ➔ \`${newSound.volume}\``,
				);
			}
			if (changes.length === 0) return;
			const executor = entry.executor;
			const components = [
				new ContainerBuilder()
					.setAccentColor(
						convertColor('Blurple', {
							from: 'discord',
							to: 'decimal',
						}),
					)
					.addTextDisplayComponents(
						new TextDisplayBuilder().setContent(
							`🔊 **Soundboard Sound Updated** by <@${executor?.id || 'Unknown'}>\n\n` +
								`**Sound:** ${newSound.name}\n\n` +
								`**Changes:**\n${changes.join('\n')}` +
								(entry.reason ? `\n\n**Reason:** ${entry.reason}` : ''),
						),
					)
					.addSeparatorComponents(
						new SeparatorBuilder()
							.setSpacing(SeparatorSpacingSize.Small)
							.setDivider(true),
					)
					.addTextDisplayComponents(
						new TextDisplayBuilder().setContent(
							`👤 **Executor:** ${executor?.tag || 'Unknown'} (${executor?.id || 'Unknown'})\n` +
								`🕒 **Timestamp:** <t:${Math.floor(Date.now() / 1000)}:F>`,
						),
					)
					.addSeparatorComponents(
						new SeparatorBuilder()
							.setSpacing(SeparatorSpacingSize.Small)
							.setDivider(true),
					)
					.addTextDisplayComponents(
						new TextDisplayBuilder().setContent(
							await t(
								{
									guildId,
								},
								'common.container.footer',
								{
									username: this.client.user.username,
								},
							),
						),
					),
			];
			await logChannel.send({
				components,
				flags: MessageFlags.IsComponentsV2,
				allowedMentions: {
					parse: [],
				},
			});
		} catch (err) {
			logger.error(`Error: ${err.message || err}`, {
				label: 'guildSoundboardSoundUpdate',
			});
			if (bot.config?.sentry?.dsn) {
				Sentry.captureException(err);
			}
		}
	}
}
module.exports = GuildSoundboardSoundUpdateEvent;
