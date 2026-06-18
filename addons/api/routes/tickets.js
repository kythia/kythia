/**
 * @namespace: addons/api/routes/tickets.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { Hono } = require('hono');
const {
	ContainerBuilder,
	TextDisplayBuilder,
	SeparatorBuilder,
	SeparatorSpacingSize,
	MediaGalleryBuilder,
	MediaGalleryItemBuilder,
	MessageFlags,
} = require('discord.js');
const app = new Hono();

// Helper to get container and models
const getBot = (c) => c.get('client');
const getContainer = (c) => getBot(c).container;
const getModels = (c) => getContainer(c).models;

// Import ticket helpers

// =============================================================================
// TICKET endpoints
// =============================================================================

// GET /api/tickets - List tickets (filter by guildId, userId, channelId, status)
app.get('/', async (c) => {
	const { Ticket } = getModels(c);
	const where = {};
	const guildId = c.req.query('guildId');
	const userId = c.req.query('userId');
	const channelId = c.req.query('channelId');
	const status = c.req.query('status');
	if (guildId) where.guildId = guildId;
	if (userId) where.userId = userId;
	if (channelId) where.channelId = channelId;
	if (status) where.status = status;
	try {
		const tickets = await Ticket.getAllCache({
			where,
		});
		return c.json({
			success: true,
			count: tickets.length,
			data: tickets,
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

// GET /api/tickets/:id - Get a single ticket
app.get('/:id', async (c) => {
	const { Ticket } = getModels(c);
	const id = c.req.param('id');
	try {
		const ticket = await Ticket.getCache({
			id: id,
		});
		if (!ticket)
			return c.json(
				{
					success: false,
					error: 'Ticket not found',
				},
				404,
			);
		return c.json({
			success: true,
			data: ticket,
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

// PATCH /api/tickets/:id - Update a ticket record
app.patch('/:id', async (c) => {
	const { Ticket } = getModels(c);
	const id = c.req.param('id');
	const body = await c.req.json();
	try {
		const ticket = await Ticket.getCache({
			id: id,
		});
		if (!ticket)
			return c.json(
				{
					success: false,
					error: 'Ticket not found',
				},
				404,
			);
		await ticket.update(body);
		await ticket.save();
		return c.json({
			success: true,
			data: ticket,
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

// DELETE /api/tickets/:id - Delete a ticket record
app.delete('/:id', async (c) => {
	const { Ticket } = getModels(c);
	const id = c.req.param('id');
	try {
		const ticket = await Ticket.getCache({
			id: id,
		});
		if (!ticket)
			return c.json(
				{
					success: false,
					error: 'Ticket not found',
				},
				404,
			);
		await ticket.destroy();
		return c.json({
			success: true,
			message: 'Ticket deleted successfully',
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

// POST /api/tickets/open - Open a new ticket (mirrors createTicketChannel helper)
// Body: { guildId, userId, ticketConfigId, reason? }
app.post('/open', async (c) => {
	const client = getBot(c);
	const container = getContainer(c);
	const { TicketConfig } = getModels(c);
	const body = await c.req.json();
	const { guildId, userId, ticketConfigId, reason } = body;
	if (!guildId || !userId || !ticketConfigId)
		return c.json(
			{
				success: false,
				error: 'Missing required: guildId, userId, ticketConfigId',
			},
			400,
		);
	try {
		const { getGuildSafe, getMemberSafe } = getContainer(c).helpers.discord;
		const guild = await getGuildSafe(client, guildId);
		const user = await client.container.helpers.discord.getUserSafe(
			client,
			userId,
		);
		const ticketConfig = await TicketConfig.getCache({
			id: ticketConfigId,
		});
		if (!guild)
			return c.json(
				{
					success: false,
					error: 'Guild not found',
				},
				404,
			);
		if (!user)
			return c.json(
				{
					success: false,
					error: 'User not found',
				},
				404,
			);
		if (!ticketConfig)
			return c.json(
				{
					success: false,
					error: 'TicketConfig not found',
				},
				404,
			);
		const mockInteraction = {
			client,
			guild,
			user,
			member: await getMemberSafe(guild, userId),
			reply: async () => {},
			followUp: async () => {},
			replied: false,
			deferred: false,
		};
		await container.helpers.ticket.index.createTicketChannel(
			mockInteraction,
			ticketConfig,
			container,
			reason ?? null,
		);
		return c.json({
			success: true,
			message: 'Ticket creation initiated',
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

// POST /api/tickets/:id/close - Close a ticket (mirrors closeTicket helper)
// Body: { userId, reason? }
app.post('/:id/close', async (c) => {
	const client = getBot(c);
	const container = getContainer(c);
	const { Ticket } = getModels(c);
	const id = c.req.param('id');
	const body = await c.req.json();
	const { userId, reason } = body;
	if (!userId)
		return c.json(
			{
				success: false,
				error: 'Missing required: userId (closer)',
			},
			400,
		);
	try {
		const ticket = await Ticket.getCache({
			id: id,
		});
		if (!ticket)
			return c.json(
				{
					success: false,
					error: 'Ticket not found',
				},
				404,
			);
		if (ticket.status === 'closed')
			return c.json(
				{
					success: false,
					error: 'Ticket is already closed',
				},
				400,
			);
		const { getGuildSafe, getMemberSafe } = getContainer(c).helpers.discord;
		const guild = await getGuildSafe(client, ticket.guildId);
		const user = await client.container.helpers.discord.getUserSafe(
			client,
			userId,
		);
		const channel = await client.container.helpers.discord.getChannelGlobalSafe(
			client,
			ticket.channelId,
		);
		if (!guild || !user || !channel)
			return c.json(
				{
					success: false,
					error: 'Guild, user, or channel not found',
				},
				404,
			);
		const mockInteraction = {
			client,
			guild,
			user,
			channel,
			member: await getMemberSafe(guild, userId),
			reply: async () => {},
			followUp: async () => {},
			replied: false,
			deferred: false,
		};
		await container.helpers.ticket.index.closeTicket(
			mockInteraction,
			container,
			reason ?? null,
		);
		return c.json({
			success: true,
			message: 'Ticket closing initiated',
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
// PANEL endpoints  (/api/tickets/panels/...)
// =============================================================================

// GET /api/tickets/panels/:guildId - List all panels for a guild
app.get('/panels/:guildId', async (c) => {
	const { TicketPanel } = getModels(c);
	const guildId = c.req.param('guildId');
	try {
		const panels = await TicketPanel.getAllCache({
			where: {
				guildId,
			},
		});
		return c.json({
			success: true,
			count: panels.length,
			data: panels,
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

// POST /api/tickets/panels - Create a new panel
// Mirrors the tkt-panel-create modal: posts the panel to Discord first, then creates the DB record.
// Body: { guildId, channelId, title, description?, image? }
app.post('/panels', async (c) => {
	const client = getBot(c);
	const container = getContainer(c);
	const { TicketPanel } = getModels(c);
	const { kythiaConfig, helpers } = container;
	const { convertColor } = helpers.color;
	const body = await c.req.json();
	const { guildId, channelId, title, description, image } = body;
	if (!guildId || !channelId || !title)
		return c.json(
			{
				success: false,
				error: 'Missing required fields: guildId, channelId, title',
			},
			400,
		);
	try {
		const channel = await client.container.helpers.discord.getChannelGlobalSafe(
			client,
			channelId,
		);
		if (!channel)
			return c.json(
				{
					success: false,
					error: `Channel ${channelId} not found`,
				},
				404,
			);

		// Build initial panel message (no types yet)
		const accentColor = convertColor(kythiaConfig.bot.color, {
			from: 'hex',
			to: 'decimal',
		});
		const panelContainer = new ContainerBuilder()
			.setAccentColor(accentColor)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					await c
						.get('client')
						.container.t({ locale: 'en-US' }, 'api.routes.tickets.title_md', {
							title,
						}),
				),
			)
			.addSeparatorComponents(
				new SeparatorBuilder()
					.setSpacing(SeparatorSpacingSize.Small)
					.setDivider(true),
			);
		if (description) {
			panelContainer.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(description),
			);
		}
		if (
			image &&
			(image.startsWith('http://') || image.startsWith('https://'))
		) {
			panelContainer.addSeparatorComponents(
				new SeparatorBuilder()
					.setSpacing(SeparatorSpacingSize.Small)
					.setDivider(false),
			);
			panelContainer.addMediaGalleryComponents(
				new MediaGalleryBuilder().addItems([
					new MediaGalleryItemBuilder().setURL(image),
				]),
			);
		}
		panelContainer
			.addSeparatorComponents(
				new SeparatorBuilder()
					.setSpacing(SeparatorSpacingSize.Small)
					.setDivider(false),
			)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					'> No ticket types configured yet.',
				),
			);

		// Post to Discord first to get the real messageId
		const panelMessage = await channel.send({
			components: [panelContainer],
			flags: MessageFlags.IsComponentsV2,
		});

		// Create DB record with the messageId
		const panel = await TicketPanel.create({
			guildId,
			channelId,
			messageId: panelMessage.id,
			title,
			description: description || null,
			image: image || null,
		});
		await panel.save();
		return c.json({
			success: true,
			data: panel,
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

// PATCH /api/tickets/panels/:id - Update panel details and refresh the Discord message
// Body: { title?, description?, image? }
app.patch('/panels/:id', async (c) => {
	const container = getContainer(c);
	const { TicketPanel } = getModels(c);
	const id = c.req.param('id');
	const body = await c.req.json();
	try {
		const panel = await TicketPanel.getCache({
			id: id,
		});
		if (!panel)
			return c.json(
				{
					success: false,
					error: 'Panel not found',
				},
				404,
			);
		await panel.update(body);
		await panel.save();

		// Refresh the live Discord panel message
		if (panel.messageId) {
			await container.helpers.ticket.index.refreshTicketPanel(
				panel.messageId,
				container,
			);
		}
		return c.json({
			success: true,
			data: panel,
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

// DELETE /api/tickets/panels/:id - Delete a panel + all its ticket types + Discord message
// Mirrors /ticket panel delete command behaviour.
app.delete('/panels/:id', async (c) => {
	const client = getBot(c);
	const { TicketPanel, TicketConfig } = getModels(c);
	const id = c.req.param('id');
	try {
		const panel = await TicketPanel.getCache({
			id: id,
		});
		if (!panel)
			return c.json(
				{
					success: false,
					error: 'Panel not found',
				},
				404,
			);

		// Delete the Discord panel message (best-effort)
		try {
			const channel =
				await client.container.helpers.discord.getChannelGlobalSafe(
					client,
					panel.channelId,
				);
			if (channel) {
				const message = await client.container.helpers.discord.getMessageSafe(
					channel,
					panel.messageId,
				);
				if (message) await message.delete();
			}
		} catch (_) {}

		// Delete all associated ticket types
		const relatedTypes = await TicketConfig.getAllCache({
			where: {
				panelMessageId: panel.messageId,
			},
		});
		if (relatedTypes && relatedTypes.length > 0) {
			for (const type of relatedTypes) {
				await type.destroy();
			}
		}
		await panel.destroy();
		return c.json({
			success: true,
			message: `Panel "${panel.title}" deleted successfully`,
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

// POST /api/tickets/panels/:messageId/refresh - Force-refresh a panel's Discord message
app.post('/panels/:messageId/refresh', async (c) => {
	const container = getContainer(c);
	const messageId = c.req.param('messageId');
	try {
		await container.helpers.ticket.index.refreshTicketPanel(
			messageId,
			container,
		);
		return c.json({
			success: true,
			message: 'Panel refreshed',
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

// POST /api/tickets/panels/:id/resend - Resend a panel to a (optionally different) channel
// Deletes the old Discord message, posts a fresh panel message to the target channel,
// updates the DB record (channelId + messageId), then refreshes with all ticket types.
// Body: { channelId? }
app.post('/panels/:id/resend', async (c) => {
	const client = getBot(c);
	const container = getContainer(c);
	const { TicketPanel } = getModels(c);
	const { kythiaConfig, helpers } = container;
	const { convertColor } = helpers.color;
	const id = c.req.param('id');
	let body = {};
	try {
		body = await c.req.json();
	} catch (_) {}
	try {
		const panel = await TicketPanel.getCache({
			id: id,
		});
		if (!panel)
			return c.json(
				{
					success: false,
					error: 'Panel not found',
				},
				404,
			);
		const targetChannelId = body.channelId || panel.channelId;
		const targetChannel =
			await client.container.helpers.discord.getChannelGlobalSafe(
				client,
				targetChannelId,
			);
		if (!targetChannel)
			return c.json(
				{
					success: false,
					error: `Channel ${targetChannelId} not found`,
				},
				404,
			);

		// Delete old Discord message (best-effort — may already be gone)
		try {
			const oldChannel =
				await client.container.helpers.discord.getChannelGlobalSafe(
					client,
					panel.channelId,
				);
			if (oldChannel) {
				const oldMessage = await helpers.discord.getMessageSafe(
					oldChannel,
					panel.messageId,
				);
				if (oldMessage) await oldMessage.delete();
			}
		} catch (_) {}

		// Post a fresh panel stub to the target channel
		const accentColor = convertColor(kythiaConfig.bot.color, {
			from: 'hex',
			to: 'decimal',
		});
		const panelContainer = new ContainerBuilder()
			.setAccentColor(accentColor)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					await c
						.get('client')
						.container.t({ locale: 'en-US' }, 'api.routes.tickets.title_md', {
							title: panel.title,
						}),
				),
			)
			.addSeparatorComponents(
				new SeparatorBuilder()
					.setSpacing(SeparatorSpacingSize.Small)
					.setDivider(true),
			);
		if (panel.description) {
			panelContainer.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(panel.description),
			);
		}
		if (
			panel.image &&
			(panel.image.startsWith('http://') || panel.image.startsWith('https://'))
		) {
			panelContainer.addSeparatorComponents(
				new SeparatorBuilder()
					.setSpacing(SeparatorSpacingSize.Small)
					.setDivider(false),
			);
			panelContainer.addMediaGalleryComponents(
				new MediaGalleryBuilder().addItems([
					new MediaGalleryItemBuilder().setURL(panel.image),
				]),
			);
		}
		panelContainer
			.addSeparatorComponents(
				new SeparatorBuilder()
					.setSpacing(SeparatorSpacingSize.Small)
					.setDivider(false),
			)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					'> No ticket types configured yet.',
				),
			);
		const newMessage = await targetChannel.send({
			components: [panelContainer],
			flags: MessageFlags.IsComponentsV2,
		});

		// Update DB record with new channel + message IDs
		const oldMessageId = panel.messageId;
		await panel.update({
			channelId: targetChannelId,
			messageId: newMessage.id,
		});
		await panel.save();

		// Update all linked TicketConfig records to point to the new messageId.
		// Without this, refreshTicketPanel finds no types (they still reference
		// the old panelMessageId) and the panel renders as empty.
		const { TicketConfig } = getModels(c);
		const linkedTypes = await TicketConfig.getAllCache({
			where: {
				panelMessageId: oldMessageId,
			},
		});
		for (const type of linkedTypes) {
			await type.update({
				panelMessageId: newMessage.id,
			});
		}

		// Refresh the panel to populate ticket type buttons
		await container.helpers.ticket.index.refreshTicketPanel(
			newMessage.id,
			container,
		);
		return c.json({
			success: true,
			message: `Panel "${panel.title}" resent to channel ${targetChannelId}`,
			data: {
				panelId: panel.id,
				channelId: targetChannelId,
				messageId: newMessage.id,
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
// TICKET TYPE (TicketConfig) endpoints  (/api/tickets/configs/...)
// =============================================================================

// GET /api/tickets/configs/:guildId - List all ticket types for a guild
app.get('/configs/:guildId', async (c) => {
	const { TicketConfig } = getModels(c);
	const guildId = c.req.param('guildId');
	try {
		const configs = await TicketConfig.getAllCache({
			where: {
				guildId,
			},
		});
		return c.json({
			success: true,
			count: configs.length,
			data: configs,
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

// GET /api/tickets/configs/id/:id - Get a single ticket type by ID
app.get('/configs/id/:id', async (c) => {
	const { TicketConfig } = getModels(c);
	const id = c.req.param('id');
	try {
		const config = await TicketConfig.getCache({
			id: id,
		});
		if (!config)
			return c.json(
				{
					success: false,
					error: 'TicketConfig not found',
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

// POST /api/tickets/configs - Create a new ticket type and refresh the parent panel
// Mirrors /ticket type create command behaviour (step2 submit).
// Body: { guildId, panelMessageId, typeName, typeEmoji?, staffRoleId, logsChannelId,
//         transcriptChannelId, ticketCategoryId?, ticketOpenMessage?, ticketOpenImage?,
//         askReason?, ticketStyle?, ticketThreadChannelId? }
app.post('/configs', async (c) => {
	const container = getContainer(c);
	const { TicketConfig } = getModels(c);
	const body = await c.req.json();
	const {
		guildId,
		panelMessageId,
		typeName,
		staffRoleId,
		logsChannelId,
		transcriptChannelId,
	} = body;
	if (
		!guildId ||
		!panelMessageId ||
		!typeName ||
		!staffRoleId ||
		!logsChannelId ||
		!transcriptChannelId
	)
		return c.json(
			{
				success: false,
				error:
					'Missing required fields: guildId, panelMessageId, typeName, staffRoleId, logsChannelId, transcriptChannelId',
			},
			400,
		);
	const ticketStyle = body.ticketStyle || 'channel';
	const ticketThreadChannelId = body.ticketThreadChannelId || null;
	if (ticketStyle === 'thread' && !ticketThreadChannelId)
		return c.json(
			{
				success: false,
				error: 'ticketThreadChannelId is required when ticketStyle is "thread"',
			},
			400,
		);
	try {
		const config = await TicketConfig.create({
			guildId,
			panelMessageId,
			typeName,
			typeEmoji: body.typeEmoji || null,
			staffRoleId,
			logsChannelId,
			transcriptChannelId,
			ticketCategoryId: body.ticketCategoryId || null,
			ticketOpenMessage: body.ticketOpenMessage || null,
			ticketOpenImage: body.ticketOpenImage || null,
			askReason: body.askReason || null,
			ticketStyle,
			ticketThreadChannelId,
		});
		await config.save();

		// Refresh the parent panel so the new type appears immediately
		await container.helpers.ticket.index.refreshTicketPanel(
			panelMessageId,
			container,
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

// PATCH /api/tickets/configs/:id - Update a ticket type and refresh the parent panel
// Mirrors /ticket type edit (if it existed) — updates fields and re-renders the panel.
app.patch('/configs/:id', async (c) => {
	const container = getContainer(c);
	const { TicketConfig } = getModels(c);
	const id = c.req.param('id');
	const body = await c.req.json();
	try {
		const config = await TicketConfig.getCache({
			id: id,
		});
		if (!config)
			return c.json(
				{
					success: false,
					error: 'TicketConfig not found',
				},
				404,
			);
		await config.update(body);
		await config.save();

		// Refresh the parent panel
		if (config.panelMessageId) {
			await container.helpers.ticket.index.refreshTicketPanel(
				config.panelMessageId,
				container,
			);
		}
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

// DELETE /api/tickets/configs/:id - Delete a ticket type and refresh the parent panel
// Mirrors /ticket type delete command behaviour.
app.delete('/configs/:id', async (c) => {
	const container = getContainer(c);
	const { TicketConfig } = getModels(c);
	const id = c.req.param('id');
	try {
		const config = await TicketConfig.getCache({
			id: id,
		});
		if (!config)
			return c.json(
				{
					success: false,
					error: 'TicketConfig not found',
				},
				404,
			);
		const { panelMessageId, typeName } = config;
		await config.destroy();

		// Refresh the parent panel so the deleted type disappears
		await container.helpers.ticket.index.refreshTicketPanel(
			panelMessageId,
			container,
		);
		return c.json({
			success: true,
			message: `Ticket type "${typeName}" deleted successfully`,
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
