/**
 * @namespace: addons/core/events/messageReactionAdd.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { MessageFlags } = require('discord.js');
const Sentry = require('@sentry/node');
const { BaseEvent } = require('kythia-core');
class MessageReactionAddEvent extends BaseEvent {
	async execute(reaction, user) {
		const container = this.container;
		const _bot = {
			client: this.client,
			container: this.container,
		};
		const { kythiaConfig, helpers, models, logger, t } = container;
		const { convertColor } = helpers.color;
		const { ServerSetting } = models;
		const { simpleContainer } = helpers.discord;
		const guildId = reaction.message.guild?.id;
		try {
			if (!user) return; // Prevent null user errors

			// Handle partials
			if (reaction.partial) {
				try {
					await helpers.discord.resolvePartialSafe(reaction);
				} catch (error) {
					logger.error(`Error: ${error.message || error}`, {
						label: 'messageReactionAdd:fetchMessage',
					});
					return;
				}
			}
			if (user.partial) {
				try {
					await helpers.discord.refreshObjectSafe(user);
				} catch (error) {
					logger.error(`Error: ${error.message || error}`, {
						label: 'messageReactionAdd:fetchUser',
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
			const logChannel = await helpers.discord.getChannelSafe(
				message.guild,
				settings.auditLogChannelId,
			);
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
					'core.events.messageReactionAdd.log',
					{
						channelId: message.channelId,
						tag: user.tag,
						id: user.id,
						emojiDisplay: emojiDisplay,
						url: message.url,
						tag_1: user.tag,
						id_1: user.id,
						var7: Math.floor(Date.now() / 1000),
					},
				),
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
				label: 'messageReactionAdd',
			});
			if (kythiaConfig?.sentry?.dsn) {
				Sentry.captureException(err);
			}
		}
	}
}
module.exports = MessageReactionAddEvent;
