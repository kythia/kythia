/**
 * @namespace: addons/core/events/messagePollVoteRemove.js
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
class MessagePollVoteRemoveEvent extends BaseEvent {
	async execute(pollAnswer, userId) {
		const container = this.container;
		const bot = {
			client: this.client,
			container: this.container,
		};
		const { helpers, models, logger, t } = container;
		const { convertColor } = helpers.color;
		const { ServerSetting } = models;
		const message = pollAnswer.poll.message;
		const guild = message.guild;
		const guildId = guild?.id;
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
			const user = await helpers.discord.getUserSafe(this.client, userId);
			const components = [
				new ContainerBuilder()
					.setAccentColor(
						convertColor('Red', {
							from: 'discord',
							to: 'decimal',
						}),
					)
					.addTextDisplayComponents(
						new TextDisplayBuilder().setContent(
							`📊 **Poll Vote Removed** in <#${message.channelId}>\n\n` +
								`**User:** ${user ? `${user.tag} (<@${user.id}>)` : `Unknown User (${userId})`}\n` +
								`**Option:** ${pollAnswer.text || '(Image Only)'} (ID: ${pollAnswer.id})\n` +
								`**Message:** [Jump to Message](${message.url})`,
						),
					)
					.addSeparatorComponents(
						new SeparatorBuilder()
							.setSpacing(SeparatorSpacingSize.Small)
							.setDivider(true),
					)
					.addTextDisplayComponents(
						new TextDisplayBuilder().setContent(
							`👤 **User:** ${user?.tag || 'Unknown'} (${userId})\n` +
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
				label: 'messagePollVoteRemove',
			});
			if (bot.config?.sentry?.dsn) {
				Sentry.captureException(err);
			}
		}
	}
}
module.exports = MessagePollVoteRemoveEvent;
