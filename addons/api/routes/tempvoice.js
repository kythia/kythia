/**
 * @namespace: addons/api/routes/tempvoice.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { Hono } = require('hono');
const app = new Hono();
const { ChannelType } = require('discord.js');

// Helper to get client and models
const getClient = (c) => c.get('client');
const getModels = (c) => getClient(c).container.models;
const getContainer = (c) => getClient(c).container;
const { requireVote } = require('../helpers/locks');
app.use('*', (c, next) => {
	if (c.req.method !== 'GET') {
		return requireVote()(c, next);
	}
	return next();
});

// =============================================================================
// TEMP VOICE SETUP endpoint (/api/tempvoice/setup)
// =============================================================================

// POST /api/tempvoice/setup - Set up "Join to Create" voice system
// Mirrors /tempvoice setup command behaviour.
app.post('/setup', async (c) => {
	const client = getClient(c);
	const { TempVoiceConfig } = getModels(c);
	const container = client.container;
	const { logger, t } = container;
	const body = await c.req.json();
	const { guildId } = body;
	if (!guildId) {
		return c.json(
			{
				success: false,
				error: 'Missing guildId',
			},
			400,
		);
	}
	try {
		const { getGuildSafe } = container.helpers.discord;
		const guild = await getGuildSafe(client, guildId);
		if (!guild) {
			return c.json(
				{
					success: false,
					error: 'Guild not found',
				},
				404,
			);
		}
		let triggerChannel = body.triggerChannelId
			? await container.helpers.discord.getChannelSafe(
					guild,
					body.triggerChannelId,
				)
			: null;
		let category = body.categoryId
			? await container.helpers.discord.getChannelSafe(guild, body.categoryId)
			: null;
		let controlPanel = body.controlPanelChannelId
			? await container.helpers.discord.getChannelSafe(
					guild,
					body.controlPanelChannelId,
				)
			: null;
		const autoReason = await t(
			{
				guildId,
			},
			'tempvoice.commands.setup.auto_reason',
		);
		if (!category) {
			category = await guild.channels.create({
				name: await t(
					{
						guildId,
					},
					'tempvoice.commands.setup.auto_category_name',
				),
				type: ChannelType.GuildCategory,
				reason: autoReason,
			});
		}
		if (!triggerChannel) {
			triggerChannel = await guild.channels.create({
				name: await t(
					{
						guildId,
					},
					'tempvoice.commands.setup.auto_trigger_name',
				),
				type: ChannelType.GuildVoice,
				parent: category.id,
				reason: autoReason,
			});
		} else if (
			!triggerChannel.parentId ||
			triggerChannel.parentId !== category.id
		) {
			await triggerChannel.setParent(category.id, {
				lockPermissions: false,
			});
		}
		if (!controlPanel) {
			controlPanel = await guild.channels.create({
				name: await t(
					{
						guildId,
					},
					'tempvoice.commands.setup.auto_control_name',
				),
				type: ChannelType.GuildText,
				parent: category.id,
				reason: autoReason,
			});
		} else if (
			!controlPanel.parentId ||
			controlPanel.parentId !== category.id
		) {
			await controlPanel.setParent(category.id, {
				lockPermissions: false,
			});
		}

		// Cleanup old panel message if exists
		const oldConfig = await TempVoiceConfig.getCache({
			guildId,
		});
		if (oldConfig?.interfaceMessageId) {
			try {
				const oldChannel =
					await client.container.helpers.discord.getChannelGlobalSafe(
						client,
						oldConfig.controlPanelChannelId,
					);
				const oldMsg = await container.helpers.discord.getMessageSafe(
					oldChannel,
					oldConfig.interfaceMessageId,
				);
				await oldMsg.delete();
			} catch (e) {
				logger.warn(`Failed to delete old panel: ${e.message}`, {
					label: 'tempvoice api',
				});
			}
		}

		// Build and send the new interface
		// Mock interaction object for buildInterface
		const mockInteraction = {
			client,
			guildId: guild.id,
			guild,
		};
		const { components, flags } =
			await getContainer(c).helpers.tempvoice.interface.buildInterface(
				mockInteraction,
			);
		const interfaceMessage = await controlPanel.send({
			components,
			flags,
		});
		if (!interfaceMessage) {
			return c.json(
				{
					success: false,
					error: 'Failed to send interface message',
				},
				500,
			);
		}

		// Save to database
		const [config] = await TempVoiceConfig.findOrCreateCache({
			where: {
				guildId: guildId,
			},
			defaults: {
				guildId: guildId,
				triggerChannelId: triggerChannel.id,
				categoryId: category.id,
				controlPanelChannelId: controlPanel.id,
				interfaceMessageId: interfaceMessage.id,
			},
		});

		// Update if already exists
		await config.update({
			triggerChannelId: triggerChannel.id,
			categoryId: category.id,
			controlPanelChannelId: controlPanel.id,
			interfaceMessageId: interfaceMessage.id,
		});
		await config.save();
		return c.json({
			success: true,
			data: {
				guildId: guildId,
				triggerChannelId: triggerChannel.id,
				categoryId: category.id,
				controlPanelChannelId: controlPanel.id,
				interfaceMessageId: interfaceMessage.id,
			},
		});
	} catch (error) {
		return c.json(
			{
				success: false,
				error: error.message,
			},
			500,
		);
	}
});
// POST /api/tempvoice/configs/:guildId/refresh - Refresh the control panel interface message
app.post('/configs/:guildId/refresh', async (c) => {
	const client = getClient(c);
	const { TempVoiceConfig } = getModels(c);
	const guildId = c.req.param('guildId');
	try {
		const config = await TempVoiceConfig.getCache({
			guildId,
		});
		if (!config) {
			return c.json(
				{
					success: false,
					error: 'TempVoiceConfig not found',
				},
				404,
			);
		}
		const { getGuildSafe } = client.container.helpers.discord;
		const guild = await getGuildSafe(client, guildId);
		if (!guild) {
			return c.json(
				{
					success: false,
					error: 'Guild not found',
				},
				404,
			);
		}
		const channel = await client.container.helpers.discord.getChannelSafe(
			guild,
			config.controlPanelChannelId,
		);
		if (!channel) {
			return c.json(
				{
					success: false,
					error: 'Control panel channel not found',
				},
				404,
			);
		}

		// Mock interaction for buildInterface
		const mockInteraction = {
			client,
			guildId,
			guild,
		};
		const { components, flags } =
			await getContainer(c).helpers.tempvoice.interface.buildInterface(
				mockInteraction,
			);
		let message = null;
		if (config.interfaceMessageId) {
			message = await client.container.helpers.discord.getMessageSafe(
				channel,
				config.interfaceMessageId,
			);
		}
		if (message) {
			// Try to edit existing message
			await message.edit({
				components,
				flags,
			});
		} else {
			// Send new message if missing
			const newMessage = await channel.send({
				components,
				flags,
			});
			config.interfaceMessageId = newMessage.id;
			await config.save();
			await config.save();
		}
		return c.json({
			success: true,
			message: message
				? 'Interface message refreshed'
				: 'New interface message sent',
			data: {
				interfaceMessageId: config.interfaceMessageId,
			},
		});
	} catch (error) {
		return c.json(
			{
				success: false,
				error: error.message,
			},
			500,
		);
	}
});

// =============================================================================
// TEMP VOICE CONFIG endpoints (/api/tempvoice/configs)
// =============================================================================

// GET /api/tempvoice/configs/:guildId - Get a guild's tempvoice config
app.get('/configs/:guildId', async (c) => {
	const { TempVoiceConfig } = getModels(c);
	const guildId = c.req.param('guildId');
	try {
		const config = await TempVoiceConfig.getCache({
			guildId,
		});
		if (!config)
			return c.json(
				{
					success: false,
					error: 'TempVoiceConfig not found',
				},
				404,
			);
		return c.json({
			success: true,
			data: config,
		});
	} catch (error) {
		return c.json(
			{
				success: false,
				error: error.message,
			},
			500,
		);
	}
});

// POST /api/tempvoice/configs - Create or update a guild's tempvoice config (upsert)
app.post('/configs', async (c) => {
	const { TempVoiceConfig } = getModels(c);
	const body = await c.req.json();
	const { guildId, triggerChannelId, categoryId } = body;
	if (!guildId || !triggerChannelId || !categoryId) {
		return c.json(
			{
				success: false,
				error: 'Missing required fields: guildId, triggerChannelId, categoryId',
			},
			400,
		);
	}
	try {
		const [config, created] = await TempVoiceConfig.findOrCreateCache({
			where: {
				guildId,
			},
			defaults: {
				guildId,
				triggerChannelId,
				categoryId,
				controlPanelChannelId: body.controlPanelChannelId ?? null,
				interfaceMessageId: body.interfaceMessageId ?? null,
			},
		});
		if (!created) {
			await config.update({
				triggerChannelId,
				categoryId,
				...(body.controlPanelChannelId !== undefined && {
					controlPanelChannelId: body.controlPanelChannelId,
				}),
				...(body.interfaceMessageId !== undefined && {
					interfaceMessageId: body.interfaceMessageId,
				}),
			});
		}
		return c.json({
			success: true,
			created,
			data: config,
		});
	} catch (error) {
		return c.json(
			{
				success: false,
				error: error.message,
			},
			500,
		);
	}
});

// PATCH /api/tempvoice/configs/:guildId - Partially update a guild's tempvoice config
app.patch('/configs/:guildId', async (c) => {
	const { TempVoiceConfig } = getModels(c);
	const guildId = c.req.param('guildId');
	const body = await c.req.json();
	try {
		const config = await TempVoiceConfig.getCache({
			guildId,
		});
		if (!config)
			return c.json(
				{
					success: false,
					error: 'TempVoiceConfig not found',
				},
				404,
			);
		const allowedFields = [
			'triggerChannelId',
			'categoryId',
			'controlPanelChannelId',
			'interfaceMessageId',
		];
		const updates = {};
		for (const field of allowedFields) {
			if (Object.hasOwn(body, field)) {
				updates[field] = body[field];
			}
		}
		await config.update(updates);
		return c.json({
			success: true,
			data: config,
		});
	} catch (error) {
		return c.json(
			{
				success: false,
				error: error.message,
			},
			500,
		);
	}
});

// DELETE /api/tempvoice/configs/:guildId - Delete a guild's tempvoice config
app.delete('/configs/:guildId', async (c) => {
	const { TempVoiceConfig } = getModels(c);
	const guildId = c.req.param('guildId');
	try {
		const config = await TempVoiceConfig.getCache({
			guildId,
		});
		if (!config)
			return c.json(
				{
					success: false,
					error: 'TempVoiceConfig not found',
				},
				404,
			);
		await config.destroy();
		return c.json({
			success: true,
			message: 'TempVoiceConfig deleted successfully',
		});
	} catch (error) {
		return c.json(
			{
				success: false,
				error: error.message,
			},
			500,
		);
	}
});

// =============================================================================
// TEMP VOICE CHANNEL endpoints (/api/tempvoice/channels)
// =============================================================================

// GET /api/tempvoice/channels - List active temp voice channels (with optional filters)
app.get('/channels', async (c) => {
	const { TempVoiceChannel } = getModels(c);
	const guildId = c.req.query('guildId');
	const ownerId = c.req.query('ownerId');
	const where = {};
	if (guildId) where.guildId = guildId;
	if (ownerId) where.ownerId = ownerId;
	try {
		const data = await TempVoiceChannel.getAllCache({
			where,
		});
		return c.json({
			success: true,
			count: data.length,
			data,
		});
	} catch (error) {
		return c.json(
			{
				success: false,
				error: error.message,
			},
			500,
		);
	}
});

// GET /api/tempvoice/channels/:channelId - Get a single temp voice channel by channel ID
app.get('/channels/:channelId', async (c) => {
	const { TempVoiceChannel } = getModels(c);
	const channelId = c.req.param('channelId');
	try {
		const channel = await TempVoiceChannel.getCache({
			id: channelId,
		});
		if (!channel)
			return c.json(
				{
					success: false,
					error: 'TempVoiceChannel not found',
				},
				404,
			);
		return c.json({
			success: true,
			data: channel,
		});
	} catch (error) {
		return c.json(
			{
				success: false,
				error: error.message,
			},
			500,
		);
	}
});

// PATCH /api/tempvoice/channels/:channelId - Update a temp voice channel record
app.patch('/channels/:channelId', async (c) => {
	const { TempVoiceChannel } = getModels(c);
	const channelId = c.req.param('channelId');
	const body = await c.req.json();
	try {
		const channel = await TempVoiceChannel.getCache({
			id: channelId,
		});
		if (!channel)
			return c.json(
				{
					success: false,
					error: 'TempVoiceChannel not found',
				},
				404,
			);
		const allowedFields = [
			'ownerId',
			'waitingRoomChannelId',
			'pendingJoinRequests',
		];
		const updates = {};
		for (const field of allowedFields) {
			if (Object.hasOwn(body, field)) {
				updates[field] = body[field];
			}
		}
		await channel.update(updates);
		return c.json({
			success: true,
			data: channel,
		});
	} catch (error) {
		return c.json(
			{
				success: false,
				error: error.message,
			},
			500,
		);
	}
});

// DELETE /api/tempvoice/channels/:channelId - Delete a temp voice channel record
app.delete('/channels/:channelId', async (c) => {
	const { TempVoiceChannel } = getModels(c);
	const channelId = c.req.param('channelId');
	try {
		const channel = await TempVoiceChannel.getCache({
			id: channelId,
		});
		if (!channel)
			return c.json(
				{
					success: false,
					error: 'TempVoiceChannel not found',
				},
				404,
			);
		await channel.destroy();
		return c.json({
			success: true,
			message: 'TempVoiceChannel deleted successfully',
		});
	} catch (error) {
		return c.json(
			{
				success: false,
				error: error.message,
			},
			500,
		);
	}
});
module.exports = app;
