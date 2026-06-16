/**
 * @namespace: addons/api/routes/modmail.js
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
	MessageFlags,
} = require('discord.js');
const app = new Hono();

// ── Helpers ───────────────────────────────────────────────────────────────────
const getBot = (c) => c.get('client');
const getContainer = (c) => getBot(c).container;
const getModels = (c) => getContainer(c).models;

// Import modmail helpers
const modmailHelpers = require('../../modmail/helpers/index.js');

// =============================================================================
// MODMAIL THREAD endpoints  (/api/modmail)
// =============================================================================

/**
 * GET /api/modmail
 * List all modmail threads. Supports filtering via query params.
 * Query: guildId, userId, threadChannelId, status (open|closed)
 */
app.get('/', async (c) => {
	const { Modmail } = getModels(c);
	const where = {};
	const guildId = c.req.query('guildId');
	const userId = c.req.query('userId');
	const threadChannelId = c.req.query('threadChannelId');
	const status = c.req.query('status');
	if (guildId) where.guildId = guildId;
	if (userId) where.userId = userId;
	if (threadChannelId) where.threadChannelId = threadChannelId;
	if (status) where.status = status;
	try {
		const modmails = await Modmail.getAllCache({
			where,
		});
		return c.json({
			success: true,
			count: modmails.length,
			data: modmails,
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

/**
 * GET /api/modmail/:id
 * Get a single modmail thread by primary key.
 */
app.get('/:id', async (c) => {
	const { Modmail } = getModels(c);
	const id = c.req.param('id');
	try {
		const modmail = await Modmail.getCache({
			id: id,
		});
		if (!modmail)
			return c.json(
				{
					success: false,
					error: 'Modmail not found',
				},
				404,
			);
		return c.json({
			success: true,
			data: modmail,
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

/**
 * PATCH /api/modmail/:id
 * Update soft fields on a modmail record (e.g. closedReason, notes).
 * Does NOT close the thread — use POST /api/modmail/:id/close for that.
 */
app.patch('/:id', async (c) => {
	const { Modmail } = getModels(c);
	const id = c.req.param('id');
	const body = await c.req.json();
	try {
		const modmail = await Modmail.getCache({
			id: id,
		});
		if (!modmail)
			return c.json(
				{
					success: false,
					error: 'Modmail not found',
				},
				404,
			);
		await modmail.update(body);
		await modmail.save();
		return c.json({
			success: true,
			data: modmail,
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

/**
 * DELETE /api/modmail/:id
 * Hard-delete a modmail record from the database.
 * Does NOT delete the Discord thread — use /close for a graceful shutdown.
 */
app.delete('/:id', async (c) => {
	const { Modmail } = getModels(c);
	const id = c.req.param('id');
	try {
		const modmail = await Modmail.getCache({
			id: id,
		});
		if (!modmail)
			return c.json(
				{
					success: false,
					error: 'Modmail not found',
				},
				404,
			);
		await modmail.destroy();
		return c.json({
			success: true,
			message: 'Modmail record deleted',
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
// ACTION: Open a new modmail thread programmatically
// POST /api/modmail/open
// Body: { guildId, userId, initialMessage? }
// =============================================================================
app.post('/open', async (c) => {
	const client = getBot(c);
	const container = getContainer(c);
	const { ModmailConfig } = getModels(c);
	const body = await c.req.json();
	const { guildId, userId, initialMessage } = body;
	if (!guildId || !userId)
		return c.json(
			{
				success: false,
				error: 'Missing required: guildId, userId',
			},
			400,
		);
	try {
		const config = await ModmailConfig.getCache({
			guildId,
		});
		if (!config)
			return c.json(
				{
					success: false,
					error: 'Modmail not configured for this guild',
				},
				404,
			);
		const user = await client.container.helpers.discord.getUserSafe(
			client,
			userId,
		);
		if (!user)
			return c.json(
				{
					success: false,
					error: `User ${userId} not found`,
				},
				404,
			);
		const { getGuildSafe } = getContainer(c).helpers.discord;
		const guild = await getGuildSafe(client, guildId);
		if (!guild)
			return c.json(
				{
					success: false,
					error: `Guild ${guildId} not found`,
				},
				404,
			);

		// Check if already has an open modmail in this guild
		const { Modmail } = getModels(c);
		const existing = await Modmail.getCache({
			userId,
			guildId,
			status: 'open',
		});
		if (existing)
			return c.json(
				{
					success: false,
					error: 'User already has an open modmail in this guild',
				},
				409,
			);

		// Check block list
		const blocked = Array.isArray(config.blockedUserIds)
			? config.blockedUserIds
			: [];
		if (blocked.includes(userId))
			return c.json(
				{
					success: false,
					error: 'User is blocked from modmail in this guild',
				},
				403,
			);
		const modmail = await modmailHelpers.createModmailThread(
			user,
			guildId,
			initialMessage || '',
			new Map(),
			// no attachments via API
			container,
		);
		if (!modmail)
			return c.json(
				{
					success: false,
					error: 'Failed to create modmail thread (check bot logs)',
				},
				500,
			);
		return c.json({
			success: true,
			data: modmail,
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
// ACTION: Close a modmail thread
// POST /api/modmail/:id/close
// Body: { closerId, reason? }
// =============================================================================
app.post('/:id/close', async (c) => {
	const client = getBot(c);
	const container = getContainer(c);
	const { Modmail } = getModels(c);
	const id = c.req.param('id');
	const body = await c.req.json();
	const { closerId, reason } = body;
	if (!closerId)
		return c.json(
			{
				success: false,
				error: 'Missing required: closerId',
			},
			400,
		);
	try {
		const modmail = await Modmail.getCache({
			id: id,
		});
		if (!modmail)
			return c.json(
				{
					success: false,
					error: 'Modmail not found',
				},
				404,
			);
		if (modmail.status === 'closed')
			return c.json(
				{
					success: false,
					error: 'Modmail is already closed',
				},
				400,
			);
		const { getGuildSafe } = getContainer(c).helpers.discord;
		const guild = await getGuildSafe(client, modmail.guildId);
		const channel = await client.container.helpers.discord.getChannelGlobalSafe(
			client,
			modmail.threadChannelId,
		);
		const closer = await client.container.helpers.discord.getUserSafe(
			client,
			closerId,
		);
		if (!guild || !channel)
			return c.json(
				{
					success: false,
					error: 'Guild or thread channel not found',
				},
				404,
			);
		if (!closer)
			return c.json(
				{
					success: false,
					error: `User ${closerId} (closer) not found`,
				},
				404,
			);

		// Build a mock interaction that satisfies closeModmail's requirements
		const mockInteraction = {
			client,
			guild,
			user: closer,
			channel,
			member: await getContainer(c).helpers.discord.getMemberSafe(
				guild,
				closerId,
			),
			replied: false,
			deferred: false,
			reply: async () => {},
			followUp: async () => {},
			editReply: async () => {},
		};
		await modmailHelpers.closeModmail(
			mockInteraction,
			container,
			reason ?? null,
		);
		return c.json({
			success: true,
			message: 'Modmail closed successfully',
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
// ACTION: Send a staff reply via API (relays to user DM + thread)
// POST /api/modmail/:id/reply
// Body: { staffId, content, anonymous? }
// =============================================================================
app.post('/:id/reply', async (c) => {
	const client = getBot(c);
	const container = getContainer(c);
	const { Modmail } = getModels(c);
	const id = c.req.param('id');
	const body = await c.req.json();
	const { staffId, content, anonymous } = body;
	if (!staffId || !content)
		return c.json(
			{
				success: false,
				error: 'Missing required: staffId, content',
			},
			400,
		);
	try {
		const modmail = await Modmail.getCache({
			id: id,
		});
		if (!modmail)
			return c.json(
				{
					success: false,
					error: 'Modmail not found',
				},
				404,
			);
		if (modmail.status === 'closed')
			return c.json(
				{
					success: false,
					error: 'Cannot reply to a closed modmail',
				},
				400,
			);
		const staff = await client.container.helpers.discord.getUserSafe(
			client,
			staffId,
		);
		if (!staff)
			return c.json(
				{
					success: false,
					error: `User ${staffId} (staff) not found`,
				},
				404,
			);
		const thread = await client.container.helpers.discord.getChannelGlobalSafe(
			client,
			modmail.threadChannelId,
		);
		if (!thread)
			return c.json(
				{
					success: false,
					error: 'Thread channel not found',
				},
				404,
			);

		// Build a mock message-like object that satisfies relayGuildReply
		const mockMessage = {
			author: staff,
			channel: thread,
			content,
			attachments: new Map(),
			delete: async () => {},
		};
		await modmailHelpers.relayGuildReply(
			mockMessage,
			modmail,
			content,
			anonymous === true,
			container,
		);
		return c.json({
			success: true,
			message: 'Reply sent to user',
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
// ACTION: Add an internal staff note to the thread (not relayed to user)
// POST /api/modmail/:id/note
// Body: { staffId, content }
// =============================================================================
app.post('/:id/note', async (c) => {
	const client = getBot(c);
	const { Modmail } = getModels(c);
	const id = c.req.param('id');
	const body = await c.req.json();
	const { staffId, content } = body;
	if (!staffId || !content)
		return c.json(
			{
				success: false,
				error: 'Missing required: staffId, content',
			},
			400,
		);
	try {
		const modmail = await Modmail.getCache({
			id: id,
		});
		if (!modmail)
			return c.json(
				{
					success: false,
					error: 'Modmail not found',
				},
				404,
			);
		if (modmail.status === 'closed')
			return c.json(
				{
					success: false,
					error: 'Cannot add a note to a closed modmail',
				},
				400,
			);
		const thread = await client.container.helpers.discord.getChannelGlobalSafe(
			client,
			modmail.threadChannelId,
		);
		if (!thread)
			return c.json(
				{
					success: false,
					error: 'Thread channel not found',
				},
				404,
			);
		const staff = await client.container.helpers.discord.getUserSafe(
			client,
			staffId,
		);
		if (!staff)
			return c.json(
				{
					success: false,
					error: `User ${staffId} (staff) not found`,
				},
				404,
			);

		// const accentColor = convertColor(kythiaConfig.bot.color, {
		// 	from: 'hex',
		// 	to: 'decimal',
		// });

		const noteCard = new ContainerBuilder()
			.setAccentColor(0x808080) // grey accent for notes
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					await c
						.get('client')
						.container.t(
							{ locale: 'en-US' },
							'api.routes.modmail.staff_note_md',
							{ staffId, staffUsername: staff.username },
						),
				),
			)
			.addSeparatorComponents(
				new SeparatorBuilder()
					.setSpacing(SeparatorSpacingSize.Small)
					.setDivider(true),
			)
			.addTextDisplayComponents(new TextDisplayBuilder().setContent(content));
		await thread.send({
			components: [noteCard],
			flags: MessageFlags.IsComponentsV2,
			allowedMentions: {
				parse: [],
			},
		});
		return c.json({
			success: true,
			message: 'Note posted to thread',
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
// CONFIG endpoints  (/api/modmail/configs/...)
// =============================================================================

/**
 * GET /api/modmail/configs/:guildId
 * Get the modmail configuration for a guild.
 */
app.get('/configs/:guildId', async (c) => {
	const { ModmailConfig } = getModels(c);
	const guildId = c.req.param('guildId');
	try {
		const config = await ModmailConfig.getCache({
			guildId,
		});
		if (!config)
			return c.json(
				{
					success: false,
					error: 'Modmail not configured for this guild',
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

/**
 * PUT /api/modmail/configs/:guildId
 * Create or fully replace the modmail config for a guild.
 * Body: { inboxChannelId, staffRoleId?, logsChannelId?, transcriptChannelId?,
 *         pingStaff?, greetingMessage?, closingMessage?,
 *         greetingColor?, greetingImage?, closingColor?, closingImage? }
 */
app.put('/configs/:guildId', async (c) => {
	const { ModmailConfig } = getModels(c);
	const guildId = c.req.param('guildId');
	const body = await c.req.json();
	if (!body.inboxChannelId)
		return c.json(
			{
				success: false,
				error: 'Missing required: inboxChannelId',
			},
			400,
		);
	try {
		const existing = await ModmailConfig.getCache({
			guildId,
		});
		const data = {
			guildId,
			inboxChannelId: body.inboxChannelId,
			staffRoleId: body.staffRoleId || null,
			logsChannelId: body.logsChannelId || null,
			transcriptChannelId: body.transcriptChannelId || null,
			pingStaff: body.pingStaff !== undefined ? body.pingStaff : true,
			greetingMessage: body.greetingMessage || null,
			closingMessage: body.closingMessage || null,
			greetingColor: body.greetingColor || null,
			greetingImage: body.greetingImage || null,
			closingColor: body.closingColor || null,
			closingImage: body.closingImage || null,
		};
		if (existing) {
			await existing.update(data);
			await existing.save();
			return c.json({
				success: true,
				data: existing,
			});
		} else {
			const config = await ModmailConfig.create({
				...data,
				blockedUserIds: body.blockedUserIds || [],
				snippets: body.snippets || {},
			});
			return c.json({
				success: true,
				data: config,
			});
		}
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

/**
 * PATCH /api/modmail/configs/:guildId
 * Partially update specific fields of the modmail config.
 * Body: any subset of the config fields.
 */
app.patch('/configs/:guildId', async (c) => {
	const { ModmailConfig } = getModels(c);
	const guildId = c.req.param('guildId');
	const body = await c.req.json();
	try {
		const config = await ModmailConfig.getCache({
			guildId,
		});
		if (!config)
			return c.json(
				{
					success: false,
					error: 'Modmail config not found for this guild',
				},
				404,
			);
		await config.update(body);
		await config.save();
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

/**
 * DELETE /api/modmail/configs/:guildId
 * Delete the modmail config for a guild (disables modmail for that guild).
 */
app.delete('/configs/:guildId', async (c) => {
	const { ModmailConfig } = getModels(c);
	const guildId = c.req.param('guildId');
	try {
		const config = await ModmailConfig.getCache({
			guildId,
		});
		if (!config)
			return c.json(
				{
					success: false,
					error: 'Modmail config not found for this guild',
				},
				404,
			);
		await config.destroy();
		return c.json({
			success: true,
			message: `Modmail config for guild ${guildId} deleted`,
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
// BLOCK / UNBLOCK endpoints  (/api/modmail/configs/:guildId/block)
// =============================================================================

/**
 * GET /api/modmail/configs/:guildId/block
 * List all blocked user IDs for a guild.
 */
app.get('/configs/:guildId/block', async (c) => {
	const { ModmailConfig } = getModels(c);
	const guildId = c.req.param('guildId');
	try {
		const config = await ModmailConfig.getCache({
			guildId,
		});
		if (!config)
			return c.json(
				{
					success: false,
					error: 'Modmail config not found',
				},
				404,
			);
		const blockedUserIds = Array.isArray(config.blockedUserIds)
			? config.blockedUserIds
			: [];
		return c.json({
			success: true,
			count: blockedUserIds.length,
			data: blockedUserIds,
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

/**
 * POST /api/modmail/configs/:guildId/block
 * Block a user from opening modmail in this guild.
 * Body: { userId }
 */
app.post('/configs/:guildId/block', async (c) => {
	const { ModmailConfig } = getModels(c);
	const guildId = c.req.param('guildId');
	const body = await c.req.json();
	const { userId } = body;
	if (!userId)
		return c.json(
			{
				success: false,
				error: 'Missing required: userId',
			},
			400,
		);
	try {
		const config = await ModmailConfig.getCache({
			guildId,
		});
		if (!config)
			return c.json(
				{
					success: false,
					error: 'Modmail config not found',
				},
				404,
			);
		const blocked = Array.isArray(config.blockedUserIds)
			? [...config.blockedUserIds]
			: [];
		if (blocked.includes(userId))
			return c.json(
				{
					success: false,
					error: 'User is already blocked',
				},
				409,
			);
		blocked.push(userId);
		config.blockedUserIds = blocked;
		await config.save();
		return c.json({
			success: true,
			data: {
				blockedUserIds: blocked,
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

/**
 * DELETE /api/modmail/configs/:guildId/block/:userId
 * Unblock a user so they can open modmail again.
 */
app.delete('/configs/:guildId/block/:userId', async (c) => {
	const { ModmailConfig } = getModels(c);
	const guildId = c.req.param('guildId');
	const userId = c.req.param('userId');
	try {
		const config = await ModmailConfig.getCache({
			guildId,
		});
		if (!config)
			return c.json(
				{
					success: false,
					error: 'Modmail config not found',
				},
				404,
			);
		const blocked = Array.isArray(config.blockedUserIds)
			? [...config.blockedUserIds]
			: [];
		if (!blocked.includes(userId))
			return c.json(
				{
					success: false,
					error: 'User is not blocked',
				},
				404,
			);
		config.blockedUserIds = blocked.filter((id) => id !== userId);
		await config.save();
		return c.json({
			success: true,
			data: {
				blockedUserIds: config.blockedUserIds,
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
// SNIPPET endpoints  (/api/modmail/configs/:guildId/snippets)
// =============================================================================

/**
 * GET /api/modmail/configs/:guildId/snippets
 * List all quick-reply snippets for a guild.
 */
app.get('/configs/:guildId/snippets', async (c) => {
	const { ModmailConfig } = getModels(c);
	const guildId = c.req.param('guildId');
	try {
		const config = await ModmailConfig.getCache({
			guildId,
		});
		if (!config)
			return c.json(
				{
					success: false,
					error: 'Modmail config not found',
				},
				404,
			);
		const snippets = config.snippets || {};
		return c.json({
			success: true,
			count: Object.keys(snippets).length,
			data: snippets,
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

/**
 * PUT /api/modmail/configs/:guildId/snippets/:name
 * Create or update a snippet by name.
 * Body: { content }
 */
app.put('/configs/:guildId/snippets/:name', async (c) => {
	const { ModmailConfig } = getModels(c);
	const guildId = c.req.param('guildId');
	const name = c.req.param('name').toLowerCase();
	const body = await c.req.json();
	if (!body.content)
		return c.json(
			{
				success: false,
				error: 'Missing required: content',
			},
			400,
		);
	try {
		const config = await ModmailConfig.getCache({
			guildId,
		});
		if (!config)
			return c.json(
				{
					success: false,
					error: 'Modmail config not found',
				},
				404,
			);
		const snippets = {
			...(config.snippets || {}),
			[name]: body.content,
		};
		config.snippets = snippets;
		await config.save();
		return c.json({
			success: true,
			data: {
				name,
				content: body.content,
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

/**
 * DELETE /api/modmail/configs/:guildId/snippets/:name
 * Delete a snippet by name.
 */
app.delete('/configs/:guildId/snippets/:name', async (c) => {
	const { ModmailConfig } = getModels(c);
	const guildId = c.req.param('guildId');
	const name = c.req.param('name').toLowerCase();
	try {
		const config = await ModmailConfig.getCache({
			guildId,
		});
		if (!config)
			return c.json(
				{
					success: false,
					error: 'Modmail config not found',
				},
				404,
			);
		const snippets = {
			...(config.snippets || {}),
		};
		if (!snippets[name])
			return c.json(
				{
					success: false,
					error: `Snippet "${name}" not found`,
				},
				404,
			);
		delete snippets[name];
		config.snippets = snippets;
		await config.save();
		return c.json({
			success: true,
			message: `Snippet "${name}" deleted`,
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
