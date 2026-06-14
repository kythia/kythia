/**
 * @namespace: addons/core/events/guildScheduledEventUserAdd.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const {
	MessageFlags,
	ContainerBuilder,
	SeparatorBuilder,
	TextDisplayBuilder,
	SeparatorSpacingSize,
} = require('discord.js');
const Sentry = require('@sentry/node');

const { BaseEvent } = require('kythia-core');

class GuildScheduledEventUserAddEvent extends BaseEvent {
	async execute(guildScheduledEvent, user) {
		const container = this.container;
		const bot = { client: this.client, container: this.container };

		const { helpers, models, logger, t } = container;
		const { convertColor } = helpers.color;
		const { ServerSetting } = models;
		const guild = guildScheduledEvent.guild;
		const guildId = guild.id;

		if (!guild) return;

		try {
			const settings = await ServerSetting.getCache({
				guildId: guild.id,
			});
			if (!settings?.auditLogChannelId) return;

			const logChannel = await guild.channels
				.fetch(settings.auditLogChannelId)
				.catch(() => null);
			if (!logChannel?.isTextBased()) return;
			if (
				!logChannel
					.permissionsFor(this.client.user)
					?.has(['ViewChannel', 'SendMessages'])
			)
				return;

			const components = [
				new ContainerBuilder()
					.setAccentColor(
						convertColor('Green', { from: 'discord', to: 'decimal' }),
					)
					.addTextDisplayComponents(
						new TextDisplayBuilder().setContent(
							`📅 **Event Subscription**\n\n` +
								`**User:** ${user.tag} (<@${user.id}>)\n` +
								`**Event:** ${guildScheduledEvent.name}\n` +
								`**Description:** ${guildScheduledEvent.description || 'No description'}\n` +
								`**Start Time:** <t:${Math.floor(guildScheduledEvent.scheduledStartTimestamp / 1000)}:F>`,
						),
					)
					.addSeparatorComponents(
						new SeparatorBuilder()
							.setSpacing(SeparatorSpacingSize.Small)
							.setDivider(true),
					)
					.addTextDisplayComponents(
						new TextDisplayBuilder().setContent(
							`👤 **User:** ${user.tag} (${user.id})\n` +
								`🔗 **Event ID:** ${guildScheduledEvent.id}\n` +
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
				label: 'guildScheduledEventUserAdd',
			});
			if (bot.config?.sentry?.dsn) {
				Sentry.captureException(err);
			}
		}
	}
}

module.exports = GuildScheduledEventUserAddEvent;
