/**
 * @namespace: addons/globalchat/helpers/handleFailedGlobalChat.js
 * @type: Helper Script
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const fetch = require('node-fetch');
const { PermissionsBitField } = require('discord.js');

/**
 * Attempts to automatically fix broken webhooks for guilds that failed delivery.
 * Fetches guild info, creates a new webhook, updates the API, and persists in DB.
 * @param {Array<{guildId: string, guildName?: string, error: string}>} failedGuilds - Array of failed guilds from API response.
 * @param {object} container - The Kythia container object (client, logger, kythiaConfig, models, etc.).
 */
async function handleFailedGlobalChat(failedGuilds, container) {
	const { logger, client, kythiaConfig, models } = container;
	const { GlobalChat } = models;
	const apiUrl = kythiaConfig.addons.globalchat.apiUrl;
	const apiKey = kythiaConfig.addons.globalchat.apiKey;
	const webhookName =
		kythiaConfig.addons.globalchat.webhookName || 'Global Chat via Kythia';
	logger.info(
		`🌏 [GlobalChat] Starting webhook fix process for ${failedGuilds.length} failed guild(s)...`,
		{
			label: 'globalchat',
		},
	);
	let allGuildsData;
	try {
		logger.info(`Fetching master guild list from API...`, {
			label: 'globalchat',
		});
		const listResponse = await fetch(`${apiUrl}/list`, {
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${apiKey}`,
			},
		});
		if (!listResponse.ok)
			throw new Error(`API /list returned status ${listResponse.status}`);
		const listData = await listResponse.json();
		if (listData.status !== 'ok' || !listData.data?.guilds) {
			throw new Error(
				`API /list failed or returned invalid data: ${listData.message || listData.error || 'Unknown error'}`,
			);
		}
		allGuildsData = listData.data.guilds;
	} catch (listError) {
		logger.error(
			`❌ [GlobalChat] Error fetching master /list. Aborting fix process.`,
			listError.message,
			{
				label: 'globalchat',
			},
		);
		return;
	}
	for (const failedGuild of failedGuilds) {
		logger.warn(
			`Handling failed guild: ${failedGuild.guildName || failedGuild.guildId}. Reason: ${failedGuild.error}`,
			{
				label: 'globalchat',
			},
		);
		try {
			logger.info(
				`🌏 [GlobalChat] Attempting to fix webhook for guild ${failedGuild.guildName || failedGuild.guildId}`,
				{
					label: 'globalchat',
				},
			);
			const guildInfo = allGuildsData.find((g) => g.id === failedGuild.guildId);
			if (!guildInfo?.globalChannelId) {
				logger.warn(
					`Could not find registered channel info for guild ${failedGuild.guildId} in API /list response. Skipping fix.`,
					{
						label: 'globalchat',
					},
				);
				continue;
			}
			let channel;
			try {
				channel = await client.container.helpers.discord.getChannelGlobalSafe(
					client,
					guildInfo.globalChannelId,
				);
				if (!channel?.isTextBased() || channel.isDMBased()) {
					logger.warn(
						`Channel ${guildInfo.globalChannelId} for guild ${failedGuild.guildId} not found, not text-based, or is DM. Skipping fix.`,
						{
							label: 'globalchat',
						},
					);
					continue;
				}
				const guild = channel.guild;
				if (!guild) {
					logger.warn(
						`Cannot access guild ${failedGuild.guildId} for channel ${channel.id}. Bot might have been kicked. Skipping fix.`,
						{
							label: 'globalchat',
						},
					);
					continue;
				}
				const me = await guild.members.fetchMe().catch(() => null);
				if (!me) {
					logger.warn(
						`Bot is not a member of guild ${guild.name} (${guild.id}). Skipping fix.`,
						{
							label: 'globalchat',
						},
					);
					continue;
				}
				if (
					!channel
						.permissionsFor(me)
						.has(PermissionsBitField.Flags.ManageWebhooks)
				) {
					logger.warn(
						`Missing 'Manage Webhooks' permission in channel #${channel.name} (${channel.id}) for guild ${guild.name} (${guild.id}). Cannot fix webhook.`,
						{
							label: 'globalchat',
						},
					);
					continue;
				}
			} catch (channelError) {
				logger.error(
					`❌ [GlobalChat] Error accessing channel/permissions for ${guildInfo.globalChannelId} in guild ${failedGuild.guildId}:`,
					channelError,
					{
						label: 'globalchat',
					},
				);
				continue;
			}
			let remainingWebhooksCount = 0;
			try {
				logger.info(
					`🧹 [GlobalChat] Checking for old webhooks in #${channel.name}...`,
					{
						label: 'globalchat',
					},
				);
				const webhooks = await channel.fetchWebhooks();
				const kythWebhooks = webhooks.filter(
					(wh) => wh.owner?.id === client.user.id,
				);
				if (kythWebhooks.size > 0) {
					logger.info(
						`🧹 [GlobalChat] Found ${kythWebhooks.size} old webhook(s) owned by me. Deleting...`,
						{
							label: 'globalchat',
						},
					);
					for (const [_id, webhook] of kythWebhooks) {
						await webhook
							.delete('Cleaning up old Kythia webhooks before creation')
							.then(() =>
								logger.debug(
									`🗑️ [GlobalChat] Deleted old webhook: ${webhook.name} (${webhook.id})`,
									{
										label: 'globalchat',
									},
								),
							)
							.catch((err) =>
								logger.warn(
									`⚠️ [GlobalChat] Failed to delete old webhook ${webhook.id}: ${err.message || err}`,
									{
										label: 'globalchat',
									},
								),
							);
					}
				} else {
					logger.debug(`✨ [GlobalChat] No old webhooks found to clean.`, {
						label: 'globalchat',
					});
				}
				remainingWebhooksCount = webhooks.size - kythWebhooks.size;
			} catch (cleanupError) {
				logger.warn(
					`⚠️ [GlobalChat] Error during webhook cleanup (ignoring to proceed):`,
					cleanupError,
					{
						label: 'globalchat',
					},
				);
			}
			if (remainingWebhooksCount >= 15) {
				logger.warn(
					`Channel #${channel.name} (${channel.id}) in guild ${failedGuild.guildId} has reached the maximum webhook limit (15). Skipping webhook creation.`,
					{
						label: 'globalchat',
					},
				);
				continue;
			}
			let newWebhook;
			try {
				logger.info(
					`🌏 [GlobalChat] Creating new webhook in #${channel.name} (${channel.id})...`,
					{
						label: 'globalchat',
					},
				);
				newWebhook = await channel.createWebhook({
					name: webhookName,
					avatar: client.user.displayAvatarURL(),
					reason: 'Automatic webhook recreation for Kythia Global Chat',
				});
				logger.info(`New webhook created: ${newWebhook.id}`, {
					label: 'globalchat',
				});
			} catch (webhookError) {
				logger.error(
					`❌ [GlobalChat] Failed to create webhook in channel ${channel.id} for guild ${failedGuild.guildId}:`,
					webhookError,
					{
						label: 'globalchat',
					},
				);
				continue;
			}
			let webhookUpdateSuccess = false;
			try {
				logger.info(
					`🌏 [GlobalChat] Updating API with new webhook info for guild ${failedGuild.guildId}...`,
					{
						label: 'globalchat',
					},
				);
				const updateResponse = await fetch(`${apiUrl}/add`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${apiKey}`,
					},
					body: JSON.stringify({
						guildId: failedGuild.guildId,
						globalChannelId: guildInfo.globalChannelId,
						webhookId: newWebhook.id,
						webhookToken: newWebhook.token,
					}),
				});
				if (!updateResponse.ok)
					throw new Error(`API /add returned status ${updateResponse.status}`);
				const updateResult = await updateResponse.json();
				if (updateResult.status === 'ok') {
					logger.info(
						`✅ [GlobalChat] Successfully fixed and updated webhook for guild ${failedGuild.guildName || failedGuild.guildId}`,
						{
							label: 'globalchat',
						},
					);
					webhookUpdateSuccess = true;
				} else {
					logger.error(
						`❌ [GlobalChat] Failed to update guild ${failedGuild.guildName || failedGuild.guildId} in API after creating webhook:`,
						updateResult.message || updateResult.error || updateResult,
						{
							label: 'globalchat',
						},
					);
					await newWebhook
						.delete('Failed to update Global Chat API')
						.catch((delErr) =>
							logger.warn(
								`⚠️ [GlobalChat] Failed to delete orphaned webhook ${newWebhook.id}:`,
								delErr,
								{
									label: 'globalchat',
								},
							),
						);
				}
			} catch (updateError) {
				logger.error(
					`[GlobalChat] ❌ Error calling API /add to update webhook for guild ${failedGuild.guildId}:`,
					updateError,
					{
						label: 'globalchat',
					},
				);
				await newWebhook
					.delete('Failed to call Global Chat API /add')
					.catch((delErr) =>
						logger.warn(
							`⚠️ [GlobalChat] Failed to delete orphaned webhook ${newWebhook.id}:`,
							delErr,
							{
								label: 'globalchat',
							},
						),
					);
			}

			// Update our local DB only if API update succeeded
			if (webhookUpdateSuccess) {
				try {
					// Try to find and update existing entry, or fallback to upsert/create
					logger.info(
						`🌏 [GlobalChat] Updating local database with new webhook for guild ${failedGuild.guildId}...`,
						{
							label: 'globalchat',
						},
					);
					const updateResult = await GlobalChat.update(
						{
							globalChannelId: guildInfo.globalChannelId,
							webhookId: newWebhook.id,
							webhookToken: newWebhook.token,
						},
						{
							where: {
								guildId: failedGuild.guildId,
							},
						},
					);
					if (
						!updateResult ||
						(Array.isArray(updateResult) && updateResult[0] === 0)
					) {
						await GlobalChat.create({
							guildId: failedGuild.guildId,
							globalChannelId: guildInfo.globalChannelId,
							webhookId: newWebhook.id,
							webhookToken: newWebhook.token,
						});
					}
					logger.info(
						`✅ [GlobalChat] Local DB updated for guild ${failedGuild.guildId}.`,
						{
							label: 'globalchat',
						},
					);
				} catch (dbErr) {
					logger.error(
						`❌ [GlobalChat] Failed to update local DB for guild ${failedGuild.guildId}: ${dbErr.message || dbErr}`,
						{
							label: 'globalchat',
						},
					);
				}
			}
		} catch (error) {
			logger.error(
				`❌ [GlobalChat] Unexpected error during webhook fix for guild ${failedGuild.guildId}: ${error.message || error}`,
				{
					label: 'globalchat',
				},
			);
		}
	}
	logger.info(`Webhook fix process finished.`, {
		label: 'globalchat',
	});
}
module.exports = {
	handleFailedGlobalChat,
};
