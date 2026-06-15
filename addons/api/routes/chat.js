/**
 * @namespace: addons/api/routes/chat.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { Hono } = require('hono');
const { ChannelType, MessageFlags } = require('discord.js');
const { parseDiscordMarkdown } = require('../helpers/parser');
const app = new Hono();
app.get('/:guildId/channels', async (c) => {
	const client = c.get('client');
	const guildId = c.req.param('guildId');
	try {
		const { getGuildSafe } = client.container.helpers.discord;
		const guild = await getGuildSafe(client, guildId);
		if (!guild)
			return c.json(
				{
					error: 'Guild not found',
				},
				404,
			);
		const allChannels = guild.channels.cache;
		const categories = allChannels
			.filter((c) => c.type === ChannelType.GuildCategory)
			.sort((a, b) => a.position - b.position)
			.map((c) => ({
				id: c.id,
				name: c.name.toUpperCase(),
				channels: [],
			}));
		const channelsWithoutCategory = [];
		allChannels
			.filter(
				(c) =>
					c.type === ChannelType.GuildText &&
					c.permissionsFor(client.user).has('ViewChannel'),
			)
			.sort((a, b) => a.position - b.position)
			.forEach((channel) => {
				const parent = categories.find((cat) => cat.id === channel.parentId);
				const chanData = {
					id: channel.id,
					name: channel.name,
				};
				if (parent) parent.channels.push(chanData);
				else channelsWithoutCategory.push(chanData);
			});
		const result = categories.filter((c) => c.channels.length > 0);
		if (channelsWithoutCategory.length > 0) {
			result.push({
				id: 'no-category',
				name: 'WITHOUT CATEGORY',
				channels: channelsWithoutCategory,
			});
		}
		return c.json(result);
	} catch (e) {
		return c.json(
			{
				error: e.message,
			},
			500,
		);
	}
});
app.get('/messages/:channelId', async (c) => {
	const client = c.get('client');
	const channelId = c.req.param('channelId');
	const limit = parseInt(c.req.query('limit') || '50', 10);
	try {
		const channel = await client.container.helpers.discord.getChannelGlobalSafe(
			client,
			channelId,
		);
		if (!channel.permissionsFor(client.user).has('ReadMessageHistory')) {
			return c.json(
				{
					error: 'Missing Permissions',
				},
				403,
			);
		}
		const messages =
			await client.container.helpers.discord.fetchMessagesQuerySafe(channel, {
				limit,
			});
		const formatted = messages.map((msg) => ({
			id: msg.id,
			content: parseDiscordMarkdown(msg.content, msg.guild),
			author: {
				username: msg.author.username,
				avatar: msg.author.displayAvatarURL(),
				bot: msg.author.bot,
			},
			timestamp: msg.createdAt,
			embeds: msg.embeds,
			attachments: msg.attachments.map((a) => a.url),
		}));
		return c.json(formatted.reverse());
	} catch (_e) {
		return c.json(
			{
				error: 'Failed to fetch messages',
			},
			500,
		);
	}
});
app.post('/messages/:channelId', async (c) => {
	const client = c.get('client');
	const channelId = c.req.param('channelId');
	const { message } = await c.req.json();
	try {
		const channel = await client.container.helpers.discord.getChannelGlobalSafe(
			client,
			channelId,
		);
		const { simpleContainer } = client.container.helpers.discord;
		const components = await simpleContainer(
			{
				client,
			},
			typeof message === 'string' ? message.trim() : JSON.stringify(message),
		);
		await channel.send({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
		return c.json({
			success: true,
		});
	} catch (_e) {
		return c.json(
			{
				error: 'Failed to send',
			},
			500,
		);
	}
});
module.exports = app;
