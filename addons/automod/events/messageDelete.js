/**
 * @namespace: addons/automod/events/messageDelete.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	MessageFlags,
	SeparatorBuilder,
	ContainerBuilder,
	TextDisplayBuilder,
	SeparatorSpacingSize,
} = require('discord.js');

const { BaseEvent } = require('kythia-core');

const { automodDeletedMessages } = require('../helpers/automod');

class MessageDeleteEvent extends BaseEvent {
	async execute(message) {
		const container = this.container;
		const _bot = { client: this.client, container: this.container };
		const { models } = container;
		const { ServerSetting } = models;

		if (!message.guild || !message.author || message.author.bot) return;

		if (automodDeletedMessages.has(message.id)) {
			automodDeletedMessages.delete(message.id);
			return;
		}

		const mentionCount =
			message.mentions.users.size + message.mentions.roles.size;
		if (mentionCount === 0) return;

		const settings = await ServerSetting.getCache({
			guildId: message.guild.id,
		});

		if (!settings?.antiGhostPingOn) return;

		const ageMs = Date.now() - message.createdTimestamp;
		if (ageMs > 5 * 60 * 1000) return;

		const channelId = settings.auditLogChannelId || settings.modLogChannelId;
		if (!channelId) return;

		const logChannel = await message.guild.channels
			.fetch(channelId)
			.catch(() => null);
		if (!logChannel?.isTextBased()) return;

		const components = [
			new ContainerBuilder()
				.setAccentColor(0xffaa00)
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(
						`**Ghost Ping Detected**\n\n` +
							`**User:** ${message.author.tag} (<@${message.author.id}>)\n` +
							`**Channel:** <#${message.channel.id}>\n` +
							`**Pings:** ${mentionCount} mention(s)\n` +
							`**Original Message:**\n>>> ${message.content.substring(0, 500)}${message.content.length > 500 ? '...' : ''}`,
					),
				)
				.addSeparatorComponents(
					new SeparatorBuilder()
						.setSpacing(SeparatorSpacingSize.Small)
						.setDivider(true),
				)
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(
						`🤖 Kythia AutoMod • Auto-protection active`,
					),
				),
		];

		await logChannel
			.send({
				components,
				flags: MessageFlags.IsComponentsV2,
				allowedMentions: {
					parse: [],
				},
			})
			.catch(() => null);
	}
}

module.exports = MessageDeleteEvent;
