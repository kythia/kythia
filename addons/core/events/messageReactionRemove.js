/**
 * @namespace: addons/core/events/messageReactionRemove.js
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

class MessageReactionRemoveEvent extends BaseEvent {
	async execute(reaction, user) {
		const container = this.container;
		const bot = { client: this.client, container: this.container };

		const { helpers, models, logger, t } = container;
		const { convertColor } = helpers.color;
		const { ServerSetting } = models;
		const guildId = reaction.message.guild?.id;

		try {
			if (!user) return; // Prevent null user errors

			// Handle partials
			if (reaction.partial) {
				try {
					await reaction.fetch();
				} catch (error) {
					logger.error(`Error: ${error.message || error}`, {
						label: 'messageReactionRemove:fetchMessage',
					});
					return;
				}
			}
			if (user.partial) {
				try {
					await user.fetch();
				} catch (error) {
					logger.error(`Error: ${error.message || error}`, {
						label: 'messageReactionRemove:fetchUser',
					});
					return;
				}
			}

			if (user.bot) return; // Ignore bots
			const message = reaction.message;
			if (!message.guild) return; // Ignore DMs

			// Get audit log settings
			const settings = await ServerSetting.getCache({
				guildId: message.guild.id,
			});
			if (!settings?.auditLogChannelId) return;

			const logChannel = await message.guild.channels
				.fetch(settings.auditLogChannelId)
				.catch(() => null);
			if (!logChannel?.isTextBased()) return;
			if (
				!logChannel
					.permissionsFor(this.client.user)
					?.has(['ViewChannel', 'SendMessages'])
			)
				return;

			const emojiDisplay = reaction.emoji.id
				? `<:${reaction.emoji.name}:${reaction.emoji.id}>`
				: reaction.emoji.name;

			const components = [
				new ContainerBuilder()
					.setAccentColor(
						convertColor('Red', { from: 'discord', to: 'decimal' }),
					)
					.addTextDisplayComponents(
						new TextDisplayBuilder().setContent(
							`😟 **Reaction Removed** in <#${message.channelId}>\n\n` +
								`**User:** ${user.tag} (<@${user.id}>)\n` +
								`**Emoji:** ${emojiDisplay}\n` +
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
							`👤 **User:** ${user.tag} (${user.id})\n` +
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
				label: 'messageReactionRemove',
			});
			if (bot.config?.sentry?.dsn) {
				Sentry.captureException(err);
			}
		}
	}
}

module.exports = MessageReactionRemoveEvent;
