/**
 * @namespace: addons/core/events/guildScheduledEventUpdate.js
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

class GuildScheduledEventUpdateEvent extends BaseEvent {
	async execute(oldEvent, newEvent) {
		const container = this.container;
		const bot = { client: this.client, container: this.container };

		if (!newEvent.guild) return;
		const { models, helpers, logger, t } = container;
		const { ServerSetting } = models;
		const { convertColor } = helpers.color;
		const guildId = newEvent.guild.id;

		try {
			const settings = await ServerSetting.getCache({
				guildId: newEvent.guild.id,
			});
			if (!settings?.auditLogChannelId) return;

			const logChannel = await newEvent.guild.channels
				.fetch(settings.auditLogChannelId)
				.catch(() => null);
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
				changes.push(`**Name**: \`${oldEvent.name}\` ➔ \`${newEvent.name}\``);
			}
			if (oldEvent.description !== newEvent.description) {
				changes.push(
					`**Description**: \`${oldEvent.description || 'None'}\` ➔ \`${newEvent.description || 'None'}\``,
				);
			}
			if (oldEvent.status !== newEvent.status) {
				changes.push(
					`**Status**: \`${oldEvent.status}\` ➔ \`${newEvent.status}\``,
				);
			}

			if (changes.length === 0) return;

			const components = [
				new ContainerBuilder()
					.setAccentColor(
						convertColor('Blurple', { from: 'discord', to: 'decimal' }),
					)
					.addTextDisplayComponents(
						new TextDisplayBuilder().setContent(
							`📅 **Scheduled Event Updated** by <@${executor?.id || 'Unknown'}>\n\n` +
								`**Event:** ${newEvent.name}\n\n` +
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
							await t({ guildId }, 'common.container.footer', {
								username: this.client.user.username,
							}),
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
				label: 'guildScheduledEventUpdate',
			});
			if (bot.config?.sentry?.dsn) {
				Sentry.captureException(err);
			}
		}
	}
}

module.exports = GuildScheduledEventUpdateEvent;
