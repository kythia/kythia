/**
 * @namespace: addons/core/events/messagePollVoteAdd.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { MessageFlags } = require('discord.js');
const Sentry = require('@sentry/node');
const { BaseEvent } = require('kythia-core');
class MessagePollVoteAddEvent extends BaseEvent {
	async execute(pollAnswer, userId) {
		const container = this.container;
		const _bot = {
			client: this.client,
			container: this.container,
		};
		const { kythiaConfig, helpers, models, logger, t } = container;
		const { convertColor } = helpers.color;
		const { ServerSetting } = models;
		const { simpleContainer } = helpers.discord;
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
					'core.events.messagePollVoteAdd.log',
					{
						channelId: message.channelId,
						var1: user
							? `${user.tag} (<@${user.id}>)`
							: `Unknown User (${userId})`,
						text: pollAnswer.text || '(Image Only)',
						id: pollAnswer.id,
						url: message.url,
						var5: user?.tag || 'Unknown',
						userId: userId,
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
				label: 'messagePollVoteAdd',
			});
			if (kythiaConfig?.sentry?.dsn) {
				Sentry.captureException(err);
			}
		}
	}
}
module.exports = MessagePollVoteAddEvent;
