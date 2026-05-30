/**
 * @namespace: addons/api/routes/giveaway.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { Hono } = require('hono');
const { MessageFlags } = require('discord.js');
const app = new Hono();

// Helpers
const getBot = (c) => c.get('client');
const getContainer = (c) => getBot(c).container;
const getModels = (c) => getContainer(c).models;

/**
 * Build a minimal fake interaction context for GiveawayManager methods that
 * require an interaction-like object for i18n (t() calls) and Discord replies.
 *
 * - `t()` accepts a channel OR interaction — we pass the channel directly.
 * - `reply()` / `editReply()` are no-ops since the API returns JSON instead.
 * - `replied` is pre-set to true so the manager skips any final reply attempt.
 */
function buildFakeInteraction(channel) {
	return {
		// Allow t() to be called with this fake interaction; it just reads guild
		guild: channel?.guild ?? null,
		client: channel?.client ?? null,
		replied: true, // Prevents manager from trying to reply
		deferred: true,
		// No-op reply methods — API returns JSON to the caller instead
		reply: async () => {},
		editReply: async () => {},
		deferReply: async () => {},
		followUp: async () => {},
	};
}

// =============================================================================
// ACTION: Start a Giveaway
// =============================================================================

/**
 * POST /api/giveaway/start
 *
 * Full start flow — mirrors /giveaway start:
 * 1. Resolves the target channel from Discord
 * 2. Builds the giveaway Discord embed UI via GiveawayManager.buildGiveawayUI()
 * 3. Posts the message to the channel
 * 4. Saves the record to the database
 * 5. Registers the end time in the Redis scheduler
 *
 * Body: { channelId, guildId, hostId, durationMs, winners, prize, color?, roleId?, description? }
 * OR:   { channelId, guildId, hostId, durationString, winners, prize, color?, roleId?, description? }
 */
app.post('/start', async (c) => {
	const container = getContainer(c);
	const { giveawayManager } = container;
	const client = getBot(c);

	const body = await c.req.json();
	const {
		channelId,
		guildId,
		hostId,
		durationMs: rawDurationMs,
		durationString,
		winners,
		prize,
		color,
		roleId,
		description,
	} = body;

	if (!channelId || !guildId || !hostId || !winners || !prize) {
		return c.json(
			{
				success: false,
				error:
					'Missing required fields: channelId, guildId, hostId, winners, prize. Also provide durationMs (integer) or durationString (e.g. "1d 2h").',
			},
			400,
		);
	}

	// Resolve duration
	let durationMs = rawDurationMs;
	if (!durationMs && durationString) {
		durationMs = giveawayManager.parseDuration(durationString);
	}
	if (!durationMs || durationMs <= 0 || Number.isNaN(durationMs)) {
		return c.json(
			{
				success: false,
				error:
					'Invalid or missing duration. Provide durationMs (integer ms) or a valid durationString like "1d 2h 30m".',
			},
			400,
		);
	}

	try {
		// Fetch the channel from Discord
		const channel = await client.channels.fetch(channelId).catch(() => null);
		if (!channel) {
			return c.json(
				{
					success: false,
					error: `Channel (id=${channelId}) not found or bot lacks access.`,
				},
				404,
			);
		}

		const endTime = Date.now() + durationMs;
		const endTimestamp = Math.floor(endTime / 1000);
		const accentColor = color || container.kythiaConfig.bot.color;

		// Build the Discord Components UI using the manager's own method
		const uiComponents = await giveawayManager.buildGiveawayUI(channel, {
			prize,
			endTime: endTimestamp,
			hostId,
			winnersCount: winners,
			participantsCount: 0,
			ended: false,
			color: accentColor,
			roleId: roleId ?? null,
			description: description ?? null,
		});

		// Post the giveaway message to Discord
		const message = await channel.send({
			components: uiComponents,
			flags: MessageFlags.IsComponentsV2,
		});

		// Save to database
		const { Giveaway } = getModels(c);
		const giveaway = await Giveaway.create({
			messageId: message.id,
			channelId: channel.id,
			guildId,
			hostId,
			duration: durationMs,
			endTime: new Date(endTime),
			winners,
			prize,
			participants: [],
			ended: false,
			roleId: roleId ?? null,
			color: accentColor,
			description: description ?? null,
		});

		// Register in Redis scheduler so the auto-ender picks it up
		await Giveaway.scheduleAdd('active_schedule', endTimestamp, message.id);

		return c.json(
			{
				success: true,
				messageId: message.id,
				messageUrl: `https://discord.com/channels/${guildId}/${channelId}/${message.id}`,
				data: giveaway,
			},
			201,
		);
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

// =============================================================================
// ACTION: End a Giveaway (full flow — announces winners, DMs, edits message)
// =============================================================================

/**
 * POST /api/giveaway/:messageId/end
 *
 * Full end flow — mirrors /giveaway end:
 * 1. Finds the giveaway by messageId
 * 2. Picks random winners from participants
 * 3. Posts a winners announcement to the channel
 * 4. DMs each winner
 * 5. Edits the original giveaway message to show ended state
 * 6. Marks giveaway as ended in the DB
 */
app.post('/:messageId/end', async (c) => {
	const container = getContainer(c);
	const { giveawayManager } = container;
	const { Giveaway } = getModels(c);
	const messageId = c.req.param('messageId');

	try {
		const giveaway = await Giveaway.getCache({ where: { messageId } });

		if (!giveaway) {
			return c.json({ success: false, error: 'Giveaway not found' }, 404);
		}
		if (giveaway.ended) {
			return c.json({ success: false, error: 'Giveaway already ended' }, 409);
		}

		// endGiveaway(giveawayData, interaction = null) — interaction is optional
		// When null, it skips the slash command reply and just does the Discord posting
		await giveawayManager.endGiveaway(giveaway, null);

		// Refresh from DB to get the updated ended state
		await giveaway.reload();

		return c.json({ success: true, data: giveaway });
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

// =============================================================================
// ACTION: Cancel a Giveaway (marks ended, posts cancellation announcement)
// =============================================================================

/**
 * POST /api/giveaway/:messageId/cancel
 *
 * Full cancel flow — mirrors /giveaway cancel:
 * 1. Removes from Redis scheduler
 * 2. Marks giveaway as ended in DB
 * 3. Edits the Discord message to a cancelled state
 * 4. Posts a cancellation announcement in the channel
 */
app.post('/:messageId/cancel', async (c) => {
	const container = getContainer(c);
	const { giveawayManager } = container;
	const { Giveaway } = getModels(c);
	const client = getBot(c);
	const messageId = c.req.param('messageId');

	try {
		const giveaway = await Giveaway.getCache({ where: { messageId } });

		if (!giveaway) {
			return c.json({ success: false, error: 'Giveaway not found' }, 404);
		}
		if (giveaway.ended) {
			return c.json(
				{ success: false, error: 'Giveaway already ended or cancelled' },
				409,
			);
		}

		// Fetch the channel to pass as i18n context (t() works with channels too)
		const channel = await client.channels
			.fetch(giveaway.channelId)
			.catch(() => null);

		// Build a minimal fake interaction — cancelGiveaway() uses it for t() and reply()
		// We pass the channel as the i18n context, and reply() is a no-op
		const fakeInteraction = {
			...buildFakeInteraction(channel),
			// cancelGiveaway checks interaction.guild for the t() fallback
			guild: channel?.guild ?? null,
		};

		await giveawayManager.cancelGiveaway(messageId, fakeInteraction);

		await giveaway.reload();

		return c.json({ success: true, data: giveaway });
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

// =============================================================================
// ACTION: Reroll a Giveaway (pick new winners from existing participants)
// =============================================================================

/**
 * POST /api/giveaway/:messageId/reroll
 *
 * Full reroll flow — mirrors /giveaway reroll:
 * 1. Verifies the giveaway is ended
 * 2. Picks new random winners from existing participants
 * 3. Updates the Discord message with new winners
 * 4. Posts a reroll announcement in the channel
 * 5. Returns the newly selected winners
 */
app.post('/:messageId/reroll', async (c) => {
	const container = getContainer(c);
	const { giveawayManager } = container;
	const { Giveaway } = getModels(c);
	const client = getBot(c);
	const messageId = c.req.param('messageId');

	try {
		const giveaway = await Giveaway.getCache({ where: { messageId } });

		if (!giveaway) {
			return c.json({ success: false, error: 'Giveaway not found' }, 404);
		}
		if (!giveaway.ended) {
			return c.json(
				{
					success: false,
					error: 'Giveaway is still active. End it first before rerolling.',
				},
				409,
			);
		}

		const participants = Array.isArray(giveaway.participants)
			? giveaway.participants
			: JSON.parse(giveaway.participants || '[]');

		if (participants.length === 0) {
			return c.json(
				{ success: false, error: 'No participants to reroll from.' },
				400,
			);
		}

		// Fetch channel for i18n context
		const channel = await client.channels
			.fetch(giveaway.channelId)
			.catch(() => null);

		// rerollGiveaway(messageId, interaction) — uses interaction for t() and reply()
		const fakeInteraction = buildFakeInteraction(channel);

		await giveawayManager.rerollGiveaway(messageId, fakeInteraction);

		return c.json({
			success: true,
			data: { messageId, participants: participants.length },
		});
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

// =============================================================================
// CRUD: List / Get
// =============================================================================

// GET /api/giveaway
// Query: ?guildId, ?hostId, ?channelId, ?ended
app.get('/', async (c) => {
	const { Giveaway } = getModels(c);
	const where = {};

	const guildId = c.req.query('guildId');
	const hostId = c.req.query('hostId');
	const channelId = c.req.query('channelId');
	const ended = c.req.query('ended');

	if (guildId) where.guildId = guildId;
	if (hostId) where.hostId = hostId;
	if (channelId) where.channelId = channelId;
	if (ended !== undefined && ended !== '') where.ended = ended === 'true';

	try {
		const data = await Giveaway.getAllCache({
			where,
			order: [['endTime', 'DESC']],
		});
		return c.json({ success: true, count: data.length, data });
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

// GET /api/giveaway/message/:messageId
app.get('/message/:messageId', async (c) => {
	const { Giveaway } = getModels(c);
	const messageId = c.req.param('messageId');

	try {
		const giveaway = await Giveaway.getCache({ where: { messageId } });
		if (!giveaway)
			return c.json({ success: false, error: 'Giveaway not found' }, 404);
		return c.json({ success: true, data: giveaway });
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

// GET /api/giveaway/:id
app.get('/:id', async (c) => {
	const { Giveaway } = getModels(c);
	const id = parseInt(c.req.param('id'), 10);

	try {
		const giveaway = await Giveaway.getCache({ id: id });
		if (!giveaway)
			return c.json({ success: false, error: 'Giveaway not found' }, 404);
		return c.json({ success: true, data: giveaway });
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

// =============================================================================
// CRUD: Patch / Delete
// =============================================================================

// PATCH /api/giveaway/:id
app.patch('/:id', async (c) => {
	const { Giveaway } = getModels(c);
	const id = parseInt(c.req.param('id'), 10);
	const body = await c.req.json();

	const ALLOWED_FIELDS = [
		'prize',
		'description',
		'color',
		'roleId',
		'winners',
		'ended',
		'participants',
	];

	try {
		const giveaway = await Giveaway.getCache({ id: id });
		if (!giveaway)
			return c.json({ success: false, error: 'Giveaway not found' }, 404);

		const updates = {};
		for (const field of ALLOWED_FIELDS) {
			if (field in body) updates[field] = body[field];
		}

		await giveaway.update(updates);
		return c.json({ success: true, data: giveaway });
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

// DELETE /api/giveaway/:id
app.delete('/:id', async (c) => {
	const { Giveaway } = getModels(c);
	const id = parseInt(c.req.param('id'), 10);

	try {
		const giveaway = await Giveaway.getCache({ id: id });
		if (!giveaway)
			return c.json({ success: false, error: 'Giveaway not found' }, 404);

		await giveaway.destroy();
		return c.json({
			success: true,
			message: `Giveaway (id=${id}) deleted successfully`,
		});
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

// =============================================================================
// Participants Sub-resource
// =============================================================================

// GET /api/giveaway/:id/participants
app.get('/:id/participants', async (c) => {
	const { Giveaway } = getModels(c);
	const id = parseInt(c.req.param('id'), 10);

	try {
		const giveaway = await Giveaway.getCache({
			id: id,
			attributes: ['id', 'messageId', 'participants', 'ended'],
		});
		if (!giveaway)
			return c.json({ success: false, error: 'Giveaway not found' }, 404);

		let participants = giveaway.participants;
		if (typeof participants === 'string') {
			try {
				participants = JSON.parse(participants);
			} catch {
				participants = [];
			}
		}

		return c.json({ success: true, count: participants.length, participants });
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

// POST /api/giveaway/:id/participants
// Body: { userId }
app.post('/:id/participants', async (c) => {
	const { Giveaway } = getModels(c);
	const id = parseInt(c.req.param('id'), 10);
	const body = await c.req.json();
	const { userId } = body;

	if (!userId) {
		return c.json(
			{ success: false, error: 'Missing required field: userId' },
			400,
		);
	}

	try {
		const giveaway = await Giveaway.getCache({ id: id });
		if (!giveaway)
			return c.json({ success: false, error: 'Giveaway not found' }, 404);
		if (giveaway.ended)
			return c.json({ success: false, error: 'Giveaway has ended' }, 409);

		let participants = giveaway.participants;
		if (typeof participants === 'string') {
			try {
				participants = JSON.parse(participants);
			} catch {
				participants = [];
			}
		}
		if (participants.includes(userId)) {
			return c.json({ success: false, error: 'User already joined' }, 409);
		}

		participants.push(userId);
		giveaway.participants = participants;
		await giveaway.save();

		return c.json({ success: true, count: participants.length, participants });
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

// DELETE /api/giveaway/:id/participants/:userId
app.delete('/:id/participants/:userId', async (c) => {
	const { Giveaway } = getModels(c);
	const id = parseInt(c.req.param('id'), 10);
	const userId = c.req.param('userId');

	try {
		const giveaway = await Giveaway.getCache({ id: id });
		if (!giveaway)
			return c.json({ success: false, error: 'Giveaway not found' }, 404);

		let participants = giveaway.participants;
		if (typeof participants === 'string') {
			try {
				participants = JSON.parse(participants);
			} catch {
				participants = [];
			}
		}
		if (!participants.includes(userId)) {
			return c.json(
				{ success: false, error: 'User is not a participant' },
				404,
			);
		}

		giveaway.participants = participants.filter((uid) => uid !== userId);
		await giveaway.save();

		return c.json({
			success: true,
			count: giveaway.participants.length,
			participants: giveaway.participants,
		});
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

module.exports = app;
