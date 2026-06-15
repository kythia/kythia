/**
 * @namespace: addons/api/routes/sticky.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { Hono } = require('hono');
const {
	MessageFlags,
	ContainerBuilder,
	TextDisplayBuilder,
	SeparatorBuilder,
	SeparatorSpacingSize,
} = require('discord.js');
const app = new Hono();

// Helper to get models
const getModels = (c) => c.get('client').container.models;

// GET /api/sticky - List all sticky messages (with optional channelId filter)
app.get('/', async (c) => {
	const { StickyMessage } = getModels(c);
	const channelId = c.req.query('channelId');

	const where = {};
	if (channelId) where.channelId = channelId;

	try {
		const data = await StickyMessage.getAllCache({ where });
		return c.json({ success: true, count: data.length, data });
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

// GET /api/sticky/:id - Get a single sticky message by primary key
app.get('/:id', async (c) => {
	const { StickyMessage } = getModels(c);
	const id = c.req.param('id');

	try {
		const result = await StickyMessage.getCache({ id: id });
		if (!result)
			return c.json({ success: false, error: 'Sticky message not found' }, 404);
		return c.json({ success: true, data: result });
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

// POST /api/sticky - Create a new sticky message and send it to the channel
app.post('/', async (c) => {
	const client = c.get('client');
	const { models, kythiaConfig, helpers, t } = client.container;
	const { StickyMessage } = models;
	const { convertColor } = helpers.color;

	const body = await c.req.json();

	if (!body.channelId || !body.message) {
		return c.json(
			{
				success: false,
				error: 'Missing required fields (channelId, message)',
			},
			400,
		);
	}

	// Block if a sticky already exists for this channel
	const existing = await StickyMessage.getCache({ channelId: body.channelId });
	if (existing) {
		return c.json(
			{
				success: false,
				error: 'A sticky message already exists in this channel.',
			},
			409,
		);
	}

	try {
		// Build container identical to StickyMessageHandler
		const stickyContainer = new ContainerBuilder()
			.setAccentColor(
				convertColor(kythiaConfig.bot.color, { from: 'hex', to: 'decimal' }),
			)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(body.message),
			)
			.addSeparatorComponents(
				new SeparatorBuilder()
					.setSpacing(SeparatorSpacingSize.Small)
					.setDivider(true),
			)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					await t({ client, user: client.user }, 'common.container.footer', {
						username: client.user.username,
					}),
				),
			);

		// Send the message to Discord via broadcastEval to handle all shards
		const stickyContainerJSON = stickyContainer.toJSON();
		let sentId = null;

		if (client.shard) {
			const results = await client.shard.broadcastEval(
				async (c, { chId, containerJson }) => {
					const ch = await c.container.helpers.discord.getChannelGlobalSafe(
						c,
						chId,
					);
					if (!ch) return null;
					try {
						const sentMsg = await ch.send({
							components: [containerJson],
							flags: 8192, // MessageFlags.IsComponentsV2
						});
						return sentMsg.id;
					} catch (_e) {
						return null;
					}
				},
				{
					context: { chId: body.channelId, containerJson: stickyContainerJSON },
				},
			);

			sentId = results.find((id) => id !== null);
		} else {
			const channel =
				await client.container.helpers.discord.getChannelGlobalSafe(
					client,
					body.channelId,
				);
			if (channel) {
				const sent = await channel.send({
					components: [stickyContainerJSON],
					flags: MessageFlags.IsComponentsV2,
				});
				sentId = sent.id;
			}
		}

		if (!sentId) {
			return c.json(
				{
					success: false,
					error: 'Channel not found or bot cannot access it on any shard.',
				},
				404,
			);
		}

		// Persist the record with the real messageId
		const result = await StickyMessage.create(
			{ channelId: body.channelId, message: body.message, messageId: sentId },
			{ individualHooks: true },
		);

		return c.json({ success: true, data: result });
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

// PATCH /api/sticky/:id - Update a sticky message
app.patch('/:id', async (c) => {
	const { StickyMessage } = getModels(c);
	const id = c.req.param('id');
	const body = await c.req.json();

	try {
		const result = await StickyMessage.getCache({ id: id });
		if (!result)
			return c.json({ success: false, error: 'Sticky message not found' }, 404);

		await result.update(body);
		return c.json({ success: true, data: result });
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

// DELETE /api/sticky/:id - Delete a sticky message
app.delete('/:id', async (c) => {
	const { StickyMessage } = getModels(c);
	const id = c.req.param('id');

	try {
		const result = await StickyMessage.getCache({ id: id });
		if (!result)
			return c.json({ success: false, error: 'Sticky message not found' }, 404);

		await result.destroy({ individualHooks: true });
		return c.json({
			success: true,
			message: 'Sticky message deleted successfully',
		});
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

module.exports = app;
