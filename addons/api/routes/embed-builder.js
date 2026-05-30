/**
 * @namespace: addons/api/routes/embed-builder.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { Hono } = require('hono');
const { EmbedBuilder, MessageFlags } = require('discord.js');

const app = new Hono();

// Helpers
const getBot = (c) => c.get('client');
const getContainer = (c) => getBot(c).container;
const getModels = (c) => getContainer(c).models;

// =============================================================================
// HELPERS: Build & Send Discord message from stored data
// =============================================================================

/**
 * Validate and normalise an allowedMentions value coming from the API body.
 * Accepts the full Discord AllowedMentionsOptions object or one of the
 * shorthand strings: "everyone" | "roles" | "users" | "none".
 * Returns a valid AllowedMentionsOptions, defaulting to full parse when absent.
 * @param {string|object|undefined} raw
 * @returns {{ parse: string[] }}
 */
function resolveAllowedMentions(raw) {
	const SHORTHANDS = {
		everyone: { parse: ['everyone', 'roles', 'users'] },
		roles: { parse: ['roles'] },
		users: { parse: ['users'] },
		none: { parse: [] },
	};
	if (!raw) return { parse: ['everyone', 'roles', 'users'] };
	if (typeof raw === 'string')
		return SHORTHANDS[raw] ?? { parse: ['everyone', 'roles', 'users'] };
	// Accept a raw object (e.g. { parse: ['roles'] } passed directly)
	if (typeof raw === 'object' && Array.isArray(raw.parse)) return raw;
	return { parse: ['everyone', 'roles', 'users'] };
}

/**
 * Send a classic embed from stored data JSON to a Discord channel.
 * @param {import('discord.js').TextChannel} channel
 * @param {object} data  Raw embed data object stored in DB
 * @param {{ parse: string[] }} [allowedMentions]
 * @returns {Promise<import('discord.js').Message>}
 */
function sendClassicEmbed(channel, data, allowedMentions) {
	const embed = new EmbedBuilder();
	if (data.title) embed.setTitle(data.title.slice(0, 256));
	if (data.description) embed.setDescription(data.description.slice(0, 4000));
	if (data.color != null) embed.setColor(data.color);
	if (data.url) embed.setURL(data.url);
	if (data.timestamp)
		embed.setTimestamp(
			data.timestamp === true ? Date.now() : new Date(data.timestamp),
		);
	if (data.image?.url) embed.setImage(data.image.url);
	if (data.thumbnail?.url) embed.setThumbnail(data.thumbnail.url);
	if (data.author?.name)
		embed.setAuthor({
			name: data.author.name,
			iconURL: data.author.icon_url,
			url: data.author.url,
		});
	if (data.footer?.text)
		embed.setFooter({
			text: data.footer.text,
			iconURL: data.footer.icon_url,
		});
	if (Array.isArray(data.fields)) embed.addFields(data.fields);

	return channel.send({ embeds: [embed], allowedMentions });
}

/**
 * Edit an existing Discord message in-place with the latest saved data.
 * @param {import('discord.js').TextChannel} channel
 * @param {string} messageId
 * @param {object} record  EmbedBuilder DB record
 */
async function editDiscordMessage(channel, messageId, record) {
	const msg = await channel.messages.fetch(messageId).catch(() => null);
	if (!msg) return null;

	if (record.mode === 'embed') {
		const embed = new EmbedBuilder();
		const data = record.data || {};
		if (data.title) embed.setTitle(data.title.slice(0, 256));
		if (data.description) embed.setDescription(data.description.slice(0, 4000));
		if (data.color != null) embed.setColor(data.color);
		if (data.url) embed.setURL(data.url);
		if (data.timestamp)
			embed.setTimestamp(
				data.timestamp === true ? Date.now() : new Date(data.timestamp),
			);
		if (data.image?.url) embed.setImage(data.image.url);
		if (data.thumbnail?.url) embed.setThumbnail(data.thumbnail.url);
		if (data.author?.name)
			embed.setAuthor({
				name: data.author.name,
				iconURL: data.author.icon_url,
				url: data.author.url,
			});
		if (data.footer?.text)
			embed.setFooter({
				text: data.footer.text,
				iconURL: data.footer.icon_url,
			});
		if (Array.isArray(data.fields)) embed.addFields(data.fields);

		return msg.edit({ embeds: [embed] });
	}

	// components_v2
	const componentsData = record.data?.components ?? [];
	return msg.edit({
		components: componentsData,
		flags: MessageFlags.IsComponentsV2,
	});
}

// =============================================================================
// GET /api/embed-builder — list
// Query: ?guildId, ?mode, ?createdBy
// =============================================================================

app.get('/', async (c) => {
	const { EmbedBuilder: EmbedModel } = getModels(c);
	const where = {};

	const guildId = c.req.query('guildId');
	const mode = c.req.query('mode');
	const createdBy = c.req.query('createdBy');

	if (guildId) where.guildId = guildId;
	if (mode) where.mode = mode;
	if (createdBy) where.createdBy = createdBy;

	try {
		const data = await EmbedModel.getAllCache({
			where,
			order: [['createdAt', 'DESC']],
		});
		return c.json({ success: true, count: data.length, data });
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

// =============================================================================
// GET /api/embed-builder/:id — get one
// =============================================================================

app.get('/:id', async (c) => {
	const { EmbedBuilder: EmbedModel } = getModels(c);
	const id = parseInt(c.req.param('id'), 10);

	try {
		const record = await EmbedModel.getCache({ id: id });
		if (!record)
			return c.json({ success: false, error: 'Embed not found' }, 404);
		return c.json({ success: true, data: record });
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

// =============================================================================
// POST /api/embed-builder — create
// Body: { guildId, createdBy, name, mode?, data? }
// =============================================================================

app.post('/', async (c) => {
	const { EmbedBuilder: EmbedModel } = getModels(c);
	const body = await c.req.json();
	const { guildId, createdBy, name, mode = 'embed', data } = body;

	if (!guildId || !createdBy || !name) {
		return c.json(
			{
				success: false,
				error: 'Missing required fields: guildId, createdBy, name',
			},
			400,
		);
	}

	if (mode !== 'embed' && mode !== 'components_v2') {
		return c.json(
			{
				success: false,
				error: 'Invalid mode. Must be "embed" or "components_v2".',
			},
			400,
		);
	}

	// Check duplicate name in same guild
	const existing = await EmbedModel.getCache({ where: { guildId, name } });
	if (existing) {
		return c.json(
			{
				success: false,
				error: `An embed named "${name}" already exists in this guild (id=${existing.id}).`,
			},
			409,
		);
	}

	const defaultData =
		data ??
		(mode === 'embed'
			? {
					title: 'My Embed',
					description: 'Edit me via the dashboard.',
					color: 0x5865f2,
				}
			: {
					components: [
						{
							type: 17,
							accent_color: 0x5865f2,
							components: [
								{
									type: 10,
									content: 'Edit me via the dashboard.',
								},
							],
						},
					],
				});

	try {
		const record = await EmbedModel.create({
			guildId,
			createdBy,
			name,
			mode,
			data: defaultData,
			messageId: null,
			channelId: null,
		});
		return c.json({ success: true, data: record }, 201);
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

// =============================================================================
// PATCH /api/embed-builder/:id — update data/name/mode (DB only, no Discord sync)
// Body: { name?, mode?, data? }
// To push changes to Discord, call POST /:id/resend afterwards.
// =============================================================================

app.patch('/:id', async (c) => {
	const { EmbedBuilder: EmbedModel } = getModels(c);
	const id = parseInt(c.req.param('id'), 10);
	const body = await c.req.json();

	const ALLOWED = ['name', 'mode', 'data', 'allowedMentions'];

	try {
		const record = await EmbedModel.getCache({ id: id });
		if (!record)
			return c.json({ success: false, error: 'Embed not found' }, 404);

		const updates = {};
		for (const field of ALLOWED) {
			if (field in body) updates[field] = body[field];
		}

		await record.update(updates);
		await record.reload(); // Ensure JSON fields (data) are fresh on the instance

		return c.json({ success: true, data: record });
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

// =============================================================================
// DELETE /api/embed-builder/:id — delete record (+ optionally Discord message)
// Query: ?deleteMessage=true
// =============================================================================

app.delete('/:id', async (c) => {
	const client = getBot(c);
	const { EmbedBuilder: EmbedModel } = getModels(c);
	const id = parseInt(c.req.param('id'), 10);
	const deleteMsg = c.req.query('deleteMessage') === 'true';

	try {
		const record = await EmbedModel.getCache({ id: id });
		if (!record)
			return c.json({ success: false, error: 'Embed not found' }, 404);

		// Optionally delete the Discord message
		if (deleteMsg && record.messageId && record.channelId) {
			try {
				const channel = await client.channels
					.fetch(record.channelId)
					.catch(() => null);
				if (channel) {
					const msg = await channel.messages
						.fetch(record.messageId)
						.catch(() => null);
					if (msg) await msg.delete();
				}
			} catch (_) {
				// Best-effort
			}
		}

		await record.destroy();
		return c.json({
			success: true,
			message: `Embed "${record.name}" (id=${id}) deleted.`,
		});
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

// =============================================================================
// POST /api/embed-builder/:id/send — send to a Discord channel
// Body: { channelId, allowedMentions? }
// =============================================================================

/**
 * POST /api/embed-builder/:id/send
 *
 * Posts the saved embed/components to a Discord channel.
 * On success, updates messageId + channelId + allowedMentions in the DB.
 *
 * Body: { channelId, allowedMentions? }
 */
app.post('/:id/send', async (c) => {
	const client = getBot(c);
	const { EmbedBuilder: EmbedModel } = getModels(c);
	const id = parseInt(c.req.param('id'), 10);
	const body = await c.req.json();
	const { channelId } = body;

	if (!channelId) {
		return c.json(
			{ success: false, error: 'Missing required field: channelId' },
			400,
		);
	}

	try {
		const record = await EmbedModel.getCache({ id: id });
		if (!record)
			return c.json({ success: false, error: 'Embed not found' }, 404);

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

		// Resolve allowedMentions: body value takes priority over stored value
		const allowedMentions = resolveAllowedMentions(
			body.allowedMentions ?? record.allowedMentions,
		);

		let message;
		if (record.mode === 'embed') {
			message = await sendClassicEmbed(
				channel,
				record.data || {},
				allowedMentions,
			);
		} else {
			const components = record.data?.components ?? [];
			if (components.length === 0) {
				return c.json(
					{
						success: false,
						error: 'Components V2 embed has no components yet.',
					},
					422,
				);
			}
			message = await channel.send({
				components,
				flags: MessageFlags.IsComponentsV2,
				allowedMentions,
			});
		}

		await record.update({
			messageId: message.id,
			channelId: channel.id,
			allowedMentions,
		});

		return c.json(
			{
				success: true,
				messageId: message.id,
				messageUrl: `https://discord.com/channels/${channel.guild?.id}/${channel.id}/${message.id}`,
				data: record,
			},
			201,
		);
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

// =============================================================================
// POST /api/embed-builder/:id/resend — edit the existing Discord message in-place
// (no extra body needed — reads channelId + messageId from DB)
// =============================================================================

/**
 * POST /api/embed-builder/:id/resend
 *
 * If the embed was already sent, edits the existing Discord message with
 * the latest saved `data`. Useful after PATCH to sync changes to Discord.
 */
app.post('/:id/resend', async (c) => {
	const client = getBot(c);
	const { EmbedBuilder: EmbedModel } = getModels(c);
	const id = parseInt(c.req.param('id'), 10);

	try {
		const record = await EmbedModel.getCache({ id: id });
		if (!record)
			return c.json({ success: false, error: 'Embed not found' }, 404);

		if (!record.messageId || !record.channelId) {
			return c.json(
				{
					success: false,
					error: 'This embed has not been sent yet. Use POST /send first.',
				},
				422,
			);
		}

		const channel = await client.channels
			.fetch(record.channelId)
			.catch(() => null);
		if (!channel) {
			return c.json(
				{
					success: false,
					error: `Channel (id=${record.channelId}) not found or bot lacks access.`,
				},
				404,
			);
		}

		const updatedMessage = await editDiscordMessage(
			channel,
			record.messageId,
			record,
		);
		if (!updatedMessage) {
			return c.json(
				{
					success: false,
					error:
						'Original message not found — it may have been deleted. Use POST /send to post a new one.',
				},
				404,
			);
		}

		return c.json({
			success: true,
			messageId: record.messageId,
			messageUrl: `https://discord.com/channels/${channel.guild?.id}/${record.channelId}/${record.messageId}`,
			data: record,
		});
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

module.exports = app;
