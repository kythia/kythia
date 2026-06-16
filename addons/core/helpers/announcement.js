/**
 * @namespace: addons/core/helpers/announcement.js
 * @type: Helper Script
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { PermissionFlagsBits, MessageFlags } = require('discord.js');
async function sendToAllGuilds(container, interaction, payload) {
	const { t } = container;
	await interaction.editReply({
		content: await t(
			interaction,
			'core.utils.global-announcement.delivery.start',
		),
		flags: MessageFlags.Ephemeral,
	});
	let successCount = 0;
	let failCount = 0;
	const failedServers = [];
	const executeOnShard = async (clientContext, data) => {
		// const { PermissionFlagsBits: PFB } = require('discord.js');
		const { payload } = data;
		const SendMessages = PermissionFlagsBits.SendMessages;
		const ViewChannel = PermissionFlagsBits.ViewChannel;
		let sCount = 0;
		let fCount = 0;
		const fServers = [];
		const { ServerSetting } = clientContext.container.models;
		const sleepLocal = (ms) =>
			new Promise((resolve) => setTimeout(resolve, ms));
		for (const guild of clientContext.guilds.cache.values()) {
			let targetChannel = null;
			try {
				const settings = await ServerSetting.getCache({
					guildId: guild.id,
				});
				if (settings?.announcementChannelId) {
					targetChannel = await container.helpers.discord.getChannelSafe(
						guild,
						settings.announcementChannelId,
					);
				}
				if (!targetChannel) {
					const { getAllChannelsSafe } = guild.client.container.helpers.discord;
					const channels = await getAllChannelsSafe(guild);
					const possibleChannels = channels
						? channels.filter(
								(ch) =>
									ch.type === 0 &&
									ch.permissionsFor(guild.members.me).has(SendMessages) &&
									ch.permissionsFor(guild.members.me).has(ViewChannel),
							)
						: [];
					const channelNamesPriority = [
						'kythia-updates',
						'kythia',
						'update',
						'bot-updates',
						'announcements',
						'pengumuman',
						'general',
						'chat',
					];
					for (const name of channelNamesPriority) {
						targetChannel = possibleChannels.find((ch) =>
							ch.name.includes(name),
						);
						if (targetChannel) break;
					}
				}
				if (targetChannel) {
					await targetChannel.send(payload);
					sCount++;
				} else {
					fCount++;
					fServers.push(`${guild.name}`);
				}
			} catch (_e) {
				fCount++;
				fServers.push(`${guild.name}`);
			}
			await sleepLocal(1000);
		}
		return {
			sCount,
			fCount,
			fServers,
		};
	};
	const client =
		interaction.client || container.client || interaction.guild?.client;
	if (client?.shard) {
		const results = await client.shard.broadcastEval(executeOnShard, {
			context: {
				payload,
			},
		});
		for (const res of results) {
			successCount += res.sCount;
			failCount += res.fCount;
			failedServers.push(...res.fServers);
		}
	} else {
		const res = await executeOnShard(client, {
			payload,
		});
		successCount = res.sCount;
		failCount = res.fCount;
		failedServers.push(...res.fServers);
	}
	const failList =
		failedServers.length > 0
			? await t(
					interaction,
					'core.utils.global-announcement.delivery.report.list',
					{
						names: failedServers.slice(0, 10).join('\n'),
					},
				)
			: '';
	const description =
		(await t(
			interaction,
			'core.utils.global-announcement.delivery.report.success',
			{
				count: successCount,
			},
		)) +
		'\n' +
		(await t(
			interaction,
			'core.utils.global-announcement.delivery.report.failed',
			{
				count: failCount,
			},
		)) +
		failList;
	const { simpleContainer } = container.helpers.discord;
	const components = await simpleContainer(
		interaction,
		(await t(
			interaction,
			'core.utils.global-announcement.delivery.report.title',
		)) +
			'\n' +
			description,
		{
			color: 'Green',
		},
	);
	await interaction.editReply({
		components,
		flags: MessageFlags.IsComponentsV2,
	});
}
module.exports = {
	sendToAllGuilds,
};
