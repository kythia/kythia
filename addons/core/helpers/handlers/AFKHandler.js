/**
 * @namespace: addons/core/helpers/handlers/AFKHandler.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	MessageFlags,
	ChannelType,
	ContainerBuilder,
	TextDisplayBuilder,
	SeparatorBuilder,
	SeparatorSpacingSize,
} = require('discord.js');
const moment = require('moment');

class AFKHandler {
	/**
	 * Handle AFK system logic
	 * @param {Message} message - Discord message
	 * @param {Object} container - Kythia container
	 */
	async handle(message, container) {
		const { models } = container;
		const { UserAFK } = models;

		if (message.author?.bot) return;

		// Check if user is returning from AFK
		const afkData = await UserAFK.getCache({
			userId: message.author.id,
		});

		if (afkData) {
			await this.handleUserReturn(message, afkData, container);
		}

		// Check mentioned users for AFK status
		if (!afkData && message.mentions.users.size > 0) {
			await this.handleMentionedUsers(message, container);
		}
	}

	async handleUserReturn(message, afkData, container) {
		const { t, kythiaConfig, logger, helpers } = container;
		const { formatDuration } = helpers.time;
		const { convertColor } = helpers.color;

		try {
			const afkSinceVal = afkData.timestamp || afkData.created_at || new Date();
			const duration = await formatDuration(
				Date.now() - new Date(afkSinceVal).getTime(),
				message,
			);

			const welcomeBackMessage = await t(
				message,
				'core.events.messageCreate.back',
				{
					user: message.author.toString(),
					duration: duration,
				},
			);

			const replyContainer = new ContainerBuilder()
				.setAccentColor(
					convertColor(kythiaConfig.bot.color, { from: 'hex', to: 'decimal' }),
				)
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(welcomeBackMessage),
				)
				.addSeparatorComponents(
					new SeparatorBuilder()
						.setSpacing(SeparatorSpacingSize.Small)
						.setDivider(true),
				)
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(
						await t(message, 'common.container.footer', {
							username: message.client.user.username,
						}),
					),
				);

			if (message.channel && message.channel.type !== ChannelType.DM) {
				const reply = await message
					.reply({
						components: [replyContainer],
						flags: MessageFlags.IsComponentsV2,
					})
					.catch(() => null);
				if (reply) setTimeout(() => reply.delete().catch(() => {}), 5000);
			} else {
				const dm = await message.author
					.send({
						components: [replyContainer],
						flags: MessageFlags.IsComponentsV2,
					})
					.catch(() => null);
				if (dm) {
					setTimeout(() => {
						dm.delete?.().catch(() => {});
					}, 5000);
				}
			}

			await afkData.destroy({ individualHooks: true });
		} catch (error) {
			logger.error(
				`Error when user returned from UserAFK: ${error.message || error}`,
				{ label: 'AFKHandler' },
			);

			try {
				const errorMessage = await t(
					message,
					'core.events.messageCreate.error',
				);
				const errorContainer = new ContainerBuilder()
					.setAccentColor(
						convertColor(kythiaConfig.bot.color, {
							from: 'hex',
							to: 'decimal',
						}),
					)
					.addTextDisplayComponents(
						new TextDisplayBuilder().setContent(errorMessage),
					)
					.addSeparatorComponents(
						new SeparatorBuilder()
							.setSpacing(SeparatorSpacingSize.Small)
							.setDivider(true),
					)
					.addTextDisplayComponents(
						new TextDisplayBuilder().setContent(
							await t(message, 'common.container.footer', {
								username: message.author.toString(),
							}),
						),
					);

				await message.author.send({
					components: [errorContainer],
					flags: MessageFlags.IsComponentsV2,
				});
			} catch (dmError) {
				logger.error(
					`Failed to send DM error from UserAFK to user: ${dmError.message || dmError}`,
					{ label: 'AFKHandler' },
				);
			}

			if (afkData) {
				await afkData
					.destroy()
					.catch((e) =>
						logger.error(
							`Failed to delete UserAFK data after error: ${e.message || e}`,
							{ label: 'AFKHandler' },
						),
					);
			}
		}
	}

	async handleMentionedUsers(message, container) {
		const { models, t, kythiaConfig, logger, helpers } = container;
		const { UserAFK } = models;
		const { convertColor } = helpers.color;

		const mentionedUsers = message.mentions.users;
		const afkReplies = [];

		for (const user of mentionedUsers.values()) {
			if (user.id === message.author.id) continue;

			try {
				const mentionedAfkData = await UserAFK.getCache({
					userId: user.id,
				});

				if (mentionedAfkData) {
					const afkSince = moment(mentionedAfkData.timestamp).fromNow();
					const reason = mentionedAfkData.reason;
					const afkReplyLine = await t(
						message,
						'core.events.messageCreate.line',
						{
							user: user.tag,
							reason: reason,
							time: afkSince,
						},
					);
					afkReplies.push(afkReplyLine);
				}
			} catch (error) {
				logger.error(
					`Error checking mentioned user's UserAFK status: ${error.message || error}`,
					{ label: 'AFKHandler' },
				);
			}
		}

		if (afkReplies.length > 0) {
			const combinedReply = afkReplies.join('\n');
			const afkContainer = new ContainerBuilder()
				.setAccentColor(
					convertColor(kythiaConfig.bot.color, { from: 'hex', to: 'decimal' }),
				)
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(combinedReply),
				)
				.addSeparatorComponents(
					new SeparatorBuilder()
						.setSpacing(SeparatorSpacingSize.Small)
						.setDivider(true),
				)
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(
						await t(message, 'common.container.footer', {
							username: message.client.user.username,
						}),
					),
				);

			const reply = await message.reply({
				components: [afkContainer],
				flags: MessageFlags.IsComponentsV2,
			});
			setTimeout(() => reply.delete().catch(logger.error), 30000);
		}
	}
}

module.exports = AFKHandler;
