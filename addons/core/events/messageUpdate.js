/**
 * @namespace: addons/core/events/messageUpdate.js
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
class MessageUpdateEvent extends BaseEvent {
	async execute(oldMessage, newMessage) {
		const container = this.container;
		const bot = {
			client: this.client,
			container: this.container,
		};
		const { helpers, models, logger, t } = container;
		const { convertColor } = helpers.color;
		const { ServerSetting } = models;
		const guildId = newMessage.guild?.id;
		try {
			if (!newMessage?.author || !newMessage.guild) return;
			if (!newMessage.author || newMessage.author.bot) return;

			// Don't log if content hasn't changed
			if (oldMessage.content === newMessage.content) return;

			// Get audit log settings
			const settings = await ServerSetting.getCache({
				guildId: newMessage.guild.id,
			});
			if (!settings?.auditLogChannelId) return;
			const logChannel = await helpers.discord.getChannelSafe(
				newMessage.guild,
				settings.auditLogChannelId,
			);
			if (!logChannel?.isTextBased()) return;
			if (
				!logChannel
					.permissionsFor(this.client.user)
					?.has(['ViewChannel', 'SendMessages'])
			)
				return;

			// Build Components V2
			const oldContent = oldMessage.content
				? oldMessage.content.length > 1024
					? `${oldMessage.content.substring(0, 1021)}...`
					: oldMessage.content
				: '*(Unable to fetch old content)*';
			const newContent = newMessage.content
				? newMessage.content.length > 1024
					? `${newMessage.content.substring(0, 1021)}...`
					: newMessage.content
				: '*(Empty)*';
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
							`✏️ **Message Edited** in <#${newMessage.channelId}>\n\n` +
								`**Author:** ${newMessage.author.tag} (<@${newMessage.author.id}>)\n` +
								`**Message:** [Jump to Message](${newMessage.url})\n\n` +
								`**Before:**\n${oldContent}\n\n` +
								`**After:**\n${newContent}`,
						),
					)
					.addSeparatorComponents(
						new SeparatorBuilder()
							.setSpacing(SeparatorSpacingSize.Small)
							.setDivider(true),
					)
					.addTextDisplayComponents(
						new TextDisplayBuilder().setContent(
							`👤 **Author:** ${newMessage.author.tag} (${newMessage.author.id})\n` +
								`📝 **Message ID:** ${newMessage.id}\n` +
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
				label: 'messageUpdate',
			});
			if (bot.config?.sentry?.dsn) {
				Sentry.captureException(err);
			}
		}
	}
}
module.exports = MessageUpdateEvent;
