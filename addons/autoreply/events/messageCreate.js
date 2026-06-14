/**
 * @namespace: addons/autoreply/events/messageCreate.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { MessageFlags } = require('discord.js');

const { BaseEvent } = require('kythia-core');

class MessageCreateEvent extends BaseEvent {
	async execute(message) {
		const container = this.container;
		const bot = { client: this.client, container: this.container };

		const { models, helpers } = this.container;
		const { AutoReply } = models;
		const { createContainer } = helpers.discord;

		if (!message.author || message.author.bot || !message.guild) return;

		const autoReplies = await AutoReply.getAllCache({
			where: { guildId: message.guild.id },
		});

		if (!autoReplies.length) return;

		const content = message.content.toLowerCase();
		const reply = autoReplies.find(({ trigger }) => {
			const escaped = trigger.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
			return new RegExp(`\\b${escaped}\\b`, 'i').test(content);
		});

		if (!reply) return;

		if (reply.useContainer) {
			const replyContaner = await createContainer(message, {
				description: reply.response,
				media: reply.media ? [reply.media] : [],
				footer: true,
			});

			return message.reply({
				components: replyContaner,
				flags: MessageFlags.IsComponentsV2,
			});
		} else {
			const content = {};
			if (reply.response) content.content = reply.response;
			if (reply.media) content.files = [reply.media];

			if (Object.keys(content).length > 0) {
				return message.reply(content);
			}
		}
	}
}

module.exports = MessageCreateEvent;
