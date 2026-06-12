/**
 * @namespace: addons/automod/events/messageDelete.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { automodDeletedMessages } = require('../helpers/automod');
const {
	ContainerBuilder,
	TextDisplayBuilder,
	SeparatorBuilder,
	SeparatorSpacingSize,
	MessageFlags,
} = require('kythia-core');

module.exports = {
	name: 'messageDelete',
	async execute(message, bot) {
		if (!message.guild || !message.author || message.author.bot) return;

		// Ignore messages deleted by the bot's own automod
		if (automodDeletedMessages.has(message.id)) {
			automodDeletedMessages.delete(message.id);
			return;
		}

		// Check if it's a ghost ping (contains mentions)
		const mentionCount =
			message.mentions.users.size + message.mentions.roles.size;
		if (mentionCount === 0) return;

		// Check if antiGhostPing is enabled
		const container = bot.client.container;
		const { ServerSetting } = container.models;
		const settings = await ServerSetting.getCache({
			guildId: message.guild.id,
		});

		if (!settings?.antiGhostPingOn) return;

		// Optional: Only count as ghost ping if deleted within 5 minutes of sending
		const ageMs = Date.now() - message.createdTimestamp;
		if (ageMs > 5 * 60 * 1000) return;

		// Ghost Ping Detected
		const channelId = settings.auditLogChannelId || settings.modLogChannelId;
		if (!channelId) return;

		const logChannel = await message.guild.channels
			.fetch(channelId)
			.catch(() => null);
		if (!logChannel?.isTextBased()) return;

		const components = [
			new ContainerBuilder()
				.setAccentColor(0xffaa00) // Orange warning
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
				allowedMentions: { parse: [] }, // Don't ping people again
			})
			.catch(() => null);

		// Note: We could timeout the user here if desired, but logging is the safest default for ghost pings.
	},
};
