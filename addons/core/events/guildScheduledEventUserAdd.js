/**
 * @namespace: addons/core/events/guildScheduledEventUserAdd.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { MessageFlags } = require('discord.js');
const Sentry = require('@sentry/node');
const { BaseEvent } = require('kythia-core');
class GuildScheduledEventUserAddEvent extends BaseEvent {
	async execute(guildScheduledEvent, user) {
		const container = this.container;
		const _bot = {
			client: this.client,
			container: this.container,
		};
		const { kythiaConfig, helpers, models, logger, t } = container;
		const { convertColor } = helpers.color;
		const { ServerSetting } = models;
		const { simpleContainer } = helpers.discord;
		const guild = guildScheduledEvent.guild;
		const guildId = guild.id;
		if (!guild) return;
		try {
			const settings = await ServerSetting.getCache({
				guildId: guild.id,
			});
			if (!settings?.auditLogChannelId) return;
			const logChannel = await helpers.discord.getChannelSafe(
				guild,
				settings.auditLogChannelId,
			);
			if (!logChannel?.isTextBased()) return;
			if (
				!logChannel
					.permissionsFor(this.client.user)
					?.has(['ViewChannel', 'SendMessages'])
			)
				return;
			const components = await simpleContainer(
				{
					client: this.client,
					guildId: guildId,
				},
				`**Event Subscription**\n\n` +
					`**User:** ${user.tag} (<@${user.id}>)\n` +
					`**Event:** ${guildScheduledEvent.name}\n` +
					`**Description:** ${guildScheduledEvent.description || 'No description'}\n` +
					`**Start Time:** <t:${Math.floor(guildScheduledEvent.scheduledStartTimestamp / 1000)}:F>` +
					'\n\n' +
					(`**User:** ${user.tag} (${user.id})\n` +
						`**Event ID:** ${guildScheduledEvent.id}\n` +
						`**Timestamp:** <t:${Math.floor(Date.now() / 1000)}:F>`),
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
				label: 'guildScheduledEventUserAdd',
			});
			if (kythiaConfig?.sentry?.dsn) {
				Sentry.captureException(err);
			}
		}
	}
}
module.exports = GuildScheduledEventUserAddEvent;
