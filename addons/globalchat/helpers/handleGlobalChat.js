/**
 * @namespace: addons/globalchat/helpers/handleGlobalChat.js
 * @type: Helper Script
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const fetch = require('node-fetch');
const { handleFailedGlobalChat } = require('./handleFailedGlobalChat');

const processedMessageIds = new Set();

async function handleGlobalChat(message, container) {
	const { logger, kythiaConfig } = container;

	if (message.author.bot) return;
	if (!message.guild) return;

	// Prevent duplicate processing
	if (processedMessageIds.has(message.id)) return;
	processedMessageIds.add(message.id);
	setTimeout(() => processedMessageIds.delete(message.id), 60000);

	try {
		// Resolve the referenced message — Discord.js only populates message.referencedMessage
		// when the message is in the local cache. For cache misses we fall back to fetchReference().
		let resolvedRef = message.referencedMessage ?? null;
		if (!resolvedRef && message.reference?.messageId) {
			try {
				resolvedRef = await message.fetchReference();
			} catch {
				// Referenced message may be deleted or inaccessible — skip gracefully.
				resolvedRef = null;
			}
		}

		const safeMessage = {
			id: message.id,
			content: message.content,
			author: {
				id: message.author.id,
				username: message.author.username,
				globalName: message.author.globalName,
				avatarURL: message.author.avatarURL(),
			},
			components: message.components ?? null,
			channelId: message.channelId,
			guildId: message.guildId,
			referencedMessage: resolvedRef
				? {
						id: resolvedRef.id,
						content: resolvedRef.content,
						components: resolvedRef.components ?? null,
						author: {
							id: resolvedRef.author.id,
							username: resolvedRef.author.username,
							globalName: resolvedRef.author.globalName,
						},
					}
				: null,
			attachments: message.attachments?.map((a) => ({
				url: a.url,
				contentType: a.contentType,
			})),
			stickerItems: message.stickers?.map((s) => ({
				id: s.id,
				name: s.name,
				formatType: s.formatType,
			})),
		};

		const apiUrl = kythiaConfig.addons.globalchat.apiUrl;
		const apiKey = kythiaConfig.addons.globalchat.apiKey;

		const headers = {
			'Content-Type': 'application/json',
			...(apiKey && { Authorization: `Bearer ${apiKey}` }),
		};

		const response = await fetch(`${apiUrl}/chat`, {
			method: 'POST',
			headers,
			body: JSON.stringify({
				message: safeMessage,
				guildName: message.guild.name,
				isReply: !!resolvedRef,
			}),
			signal: AbortSignal.timeout(30000),
		});

		const result = await response.json();

		switch (result.status) {
			case 'ok':
				logger.info(
					`Message broadcasted successfully to ${result.data?.deliveryStats?.total || 0} servers`,
					{ label: 'globalchat' },
				);
				logger.info(
					`Success rate: ${result.data?.deliveryStats?.successRate || 0}%`,
					{ label: 'globalchat' },
				);
				break;

			case 'ignored':
				logger.info(
					`Message ignored: ${result.data?.reason || 'Not from global chat channel'}`,
					{ label: 'globalchat' },
				);
				break;

			case 'skipped':
				break;

			case 'partial': {
				logger.info(
					`Partially delivered: ${result.data?.deliveryStats?.successful || 0}/${result.data?.deliveryStats?.total || 0}`,
					{ label: 'globalchat' },
				);
				const partialFailed = result.data?.failedGuilds;
				if (partialFailed && partialFailed.length > 0) {
					const failedGuildNames = partialFailed
						.map((g) => g.guildName)
						.join(', ');
					logger.warn(`Failed guilds: ${failedGuildNames}`, {
						label: 'globalchat',
					});
					await handleFailedGlobalChat(partialFailed, container);
				}
				break;
			}

			case 'failed': {
				logger.error(`All deliveries failed for message ${safeMessage.id}`, {
					label: 'globalchat',
				});
				const allFailed = result.data?.failedGuilds;
				if (allFailed && allFailed.length > 0) {
					const failedGuildErrors = allFailed.map((g) => g.error).join('; ');
					logger.error(`Failed guilds: ${failedGuildErrors}`, {
						label: 'globalchat',
					});
					await handleFailedGlobalChat(allFailed, container);
				}
				break;
			}

			case 'error':
				if (
					result.error?.includes('message not from global chat channel') ||
					result.error?.includes('is not registered in global chat') ||
					result.error?.includes('message already processed') ||
					result.error?.includes('Internal Server Error') ||
					result.error?.includes('The user aborted a request')
				) {
					return;
				}

				logger.error(`API Error: ${result.error || 'Unknown error'}`, {
					label: 'globalchat',
				});
				break;

			default:
				logger.warn(`Unknown response status: ${result.status}`, {
					label: 'globalchat',
				});
				logger.info(`Full response: ${JSON.stringify(result)}`, {
					label: 'globalchat',
				});
		}

		if (result.status === 'ok' || result.status === 'partial') {
			logger.info(`From guild: ${message.guild.name} (${message.guildId})`, {
				label: 'globalchat',
			});
		}
	} catch (apiError) {
		const errMsg = apiError.message || String(apiError);
		if (
			(apiError instanceof Error && apiError.name === 'TimeoutError') ||
			apiError.name === 'AbortError' ||
			errMsg.includes('The user aborted a request')
		) {
			return; // Silently ignore timeouts and aborts
		}
		logger.error(`Failed to send message to API: ${errMsg}`, {
			label: 'globalchat',
		});
	}
}

module.exports = { handleGlobalChat };
