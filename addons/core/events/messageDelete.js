/**
 * @namespace: addons/core/events/messageDelete.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const {
	MessageFlags,
	AuditLogEvent,
	AttachmentBuilder,
} = require('discord.js');
const Sentry = require('@sentry/node');

/**
 * Helper delay biar audit log sempet ke-generate
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const { BaseEvent } = require('kythia-core');
class MessageDeleteEvent extends BaseEvent {
	async execute(message) {
		const container = this.container;
		const _bot = {
			client: this.client,
			container: this.container,
		};

		// 1. Basic Checks
		if (!message.guild || !message.channelId) return;
		if (message.author?.bot) return;
		const { kythiaConfig, models, helpers, logger, t, redis } = container;
		const { ServerSetting } = models;
		const { simpleContainer } = helpers.discord;
		const { convertColor } = helpers.color;
		const guildId = message.guild.id;

		// Save to snipe cache using Redis
		if (redis && redis.status === 'ready' && !message.partial) {
			const snipeKey = `snipe:${message.channelId}`;
			const snipeData = {
				content: message.content,
				authorId: message.author?.id,
				authorTag: message.author?.tag,
				image: message.attachments?.first()?.url,
				timestamp: Date.now(),
			};
			try {
				await redis.lpush(snipeKey, JSON.stringify(snipeData));
				await redis.ltrim(snipeKey, 0, 19); // Keep up to 20 deleted messages
				await redis.expire(snipeKey, 86400); // 24 hours expiry
			} catch (e) {
				logger.error(`Snipe Redis Error: ${e.message}`, {
					label: 'messageDelete',
				});
			}
		}
		try {
			const settings = await ServerSetting.getCache({
				guildId,
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

			// 2. Prepare Attachments (Re-upload logic)
			// Kita siapin ini DULUAN sebelum sleep, mumpung link-nya masih hidup.
			const filesToUpload = [];
			if (message.attachments && message.attachments.size > 0) {
				message.attachments.forEach((attachment) => {
					// Filter: Hanya upload ulang jika size < 8MB (Batas aman bot non-nitro)
					// dan maksimal 4 file biar log gak berantakan.
					if (attachment.size <= 8 * 1024 * 1024 && filesToUpload.length < 4) {
						const file = new AttachmentBuilder(attachment.url, {
							name: attachment.name,
							description: 'Recovered attachment from deleted message',
						});
						filesToUpload.push(file);
					}
				});
			}

			// 3. TUNGGU Audit Log (900ms)
			await sleep(900);

			// 4. Fetch Audit Logs
			const audit = await message.guild
				.fetchAuditLogs({
					type: AuditLogEvent.MessageDelete,
					limit: 1,
				})
				.catch(() => null);

			// 5. Determine Executor
			let executor = null;
			let logReason = null;
			const entry = audit?.entries.find(
				(e) =>
					e.target?.id === message.author?.id &&
					e.extra?.channel?.id === message.channelId &&
					e.createdTimestamp > Date.now() - 20000,
			);
			if (entry) {
				executor = entry.executor;
				logReason = entry.reason;
			} else {
				// Fallback: Self Delete
				if (message.author) {
					executor = message.author;
				}
			}
			const executorId = executor?.id || 'Unknown';
			const executorTag = executor?.tag || 'Unknown User';
			const isSelfDelete = message.author && executor?.id === message.author.id;

			// 6. Build Components V2
			let contentText = '';
			if (message.content) {
				const displayContent =
					message.content.length > 1024
						? `${message.content.substring(0, 1021)}...`
						: message.content;
				contentText = `\n**Content:** ${displayContent}`;
			} else if (message.partial) {
				contentText = '\n**Content:** *(Message not cached)*';
			}
			let attachmentText = '';
			if (message.attachments.size > 0) {
				const fileNames = message.attachments
					.map((a) => `\`${a.name}\``)
					.join(', ');
				attachmentText = `\n**Attachments (${message.attachments.size}):** ${fileNames.length > 200 ? `${fileNames.substring(0, 197)}...` : fileNames}`;
			}
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
					'core.events.messageDelete.log',
					{
						channelId: message.channelId,
						var1: message.author
							? `<@${message.author.id}>`
							: 'Unknown (Partial)',
						executorId: executorId,
						var3: isSelfDelete ? '(Self)' : '',
						expr4: contentText,
						expr5: attachmentText,
						conditional6: logReason
							? await t(
									{
										client: this.client,
										guildId: guildId,
									},
									'core.helpers.index.events.common.reason',
									{
										reason: logReason,
									},
								)
							: '',
						executorTag: executorTag,
						var8: isSelfDelete ? ' (Self Delete)' : '',
						id: message.id,
						var10: Math.floor(Date.now() / 1000),
					},
				),
				{
					color: convertColor(isSelfDelete ? 'Orange' : 'Red', {
						from: 'discord',
						to: 'decimal',
					}),
					withFooter: true,
				},
			);

			// 7. Send Log (Include Files!)
			await logChannel.send({
				components,
				files: filesToUpload,
				// Re-uploaded attachments
				flags: MessageFlags.IsComponentsV2,
				allowedMentions: {
					parse: [],
				},
			});
		} catch (err) {
			// Ignore permission errors
			if (err.code === 50013 || err.code === 50001) return;
			logger.error(`Error: ${err.message || err}`, {
				label: 'messageDelete',
			});
			if (kythiaConfig?.sentry?.dsn) {
				Sentry.captureException(err);
			}
		}
	}
}
module.exports = MessageDeleteEvent;
