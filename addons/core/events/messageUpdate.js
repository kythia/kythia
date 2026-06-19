/**
 * @namespace: addons/core/events/messageUpdate.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { MessageFlags } = require('discord.js');
const Sentry = require('@sentry/node');
const { BaseEvent } = require('kythia-core');
class MessageUpdateEvent extends BaseEvent {
	async execute(oldMessage, newMessage) {
		const container = this.container;
		const _bot = {
			client: this.client,
			container: this.container,
		};
		const { kythiaConfig, helpers, models, logger, t } = container;
		const { convertColor } = helpers.color;
		const { ServerSetting } = models;
		const { simpleContainer } = helpers.discord;
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
			const components = await simpleContainer(
				{
					client: this.client,
					guildId: guildId,
				},
				await t(
					{
						client: this.client,
						guildId: guildId,
					},
					'core.events.messageUpdate.log',
					{
						channelId: newMessage.channelId,
						tag: newMessage.author.tag,
						id: newMessage.author.id,
						url: newMessage.url,
						oldContent: oldContent,
						newContent: newContent,
						tag_1: newMessage.author.tag,
						id_1: newMessage.author.id,
						id_2: newMessage.id,
						var9: Math.floor(Date.now() / 1000),
					},
				),
				{
					color: convertColor('Blurple', {
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
				label: 'messageUpdate',
			});
			if (kythiaConfig?.sentry?.dsn) {
				Sentry.captureException(err);
			}
		}
	}
}
module.exports = MessageUpdateEvent;
