/**
 * @namespace: addons/api/routes/reaction-roles.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { Hono } = require('hono');
const app = new Hono();

// Helpers
const getBot = (c) => c.get('client');
const getContainer = (c) => getBot(c).container;
const getModels = (c) => getContainer(c).models;

// Import reaction-role helpers
const rrHelpers = require('../../reaction-role/helpers/index.js');

// =============================================================================
// LIST / GET endpoints
// =============================================================================

// GET /api/reaction-roles
// Query: ?guildId, ?channelId, ?messageId
app.get('/', async (c) => {
	const { ReactionRole } = getModels(c);
	const where = {};

	const guildId = c.req.query('guildId');
	const channelId = c.req.query('channelId');
	const messageId = c.req.query('messageId');

	if (guildId) where.guildId = guildId;
	if (channelId) where.channelId = channelId;
	if (messageId) where.messageId = messageId;

	try {
		const data = await ReactionRole.getAllCache({ where });
		return c.json({ success: true, count: data.length, data });
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

// =============================================================================
// CREATE endpoint
// =============================================================================

/**
 * POST /api/reaction-roles
 * Body: { guildId, channelId, messageId, emoji, roleId }
 *
 * - Validates the emoji by actually reacting to the message (same as the bot command).
 * - Upserts (create or update) the DB record.
 * - Calls refreshReactionRoleMessage to re-edit the live Discord message.
 */
app.post('/', async (c) => {
	const client = getBot(c);
	const container = getContainer(c);
	const { ReactionRole } = getModels(c);
	const body = await c.req.json();
	const { guildId, channelId, messageId, emoji, roleId } = body;

	if (!guildId || !channelId || !messageId || !emoji || !roleId) {
		return c.json(
			{
				success: false,
				error:
					'Missing required fields: guildId, channelId, messageId, emoji, roleId',
			},
			400,
		);
	}

	try {
		// Fetch the Discord channel & message
		const channel = await client.channels.fetch(channelId).catch(() => null);
		if (!channel)
			return c.json(
				{ success: false, error: `Channel ${channelId} not found` },
				404,
			);

		const message = await channel.messages.fetch(messageId).catch(() => null);
		if (!message)
			return c.json(
				{ success: false, error: `Message ${messageId} not found` },
				404,
			);

		// Validate emoji by reacting — mirrors bot command behaviour
		try {
			await message.react(emoji);
		} catch (_) {
			return c.json({ success: false, error: `Invalid emoji: ${emoji}` }, 400);
		}

		// Upsert — find existing or create new
		const [rr, created] = await ReactionRole.findOrCreate({
			where: { guildId, messageId, emoji },
			defaults: { guildId, channelId, messageId, emoji, roleId },
		});

		if (!created) {
			// Update role & channel on existing record
			rr.roleId = roleId;
			rr.channelId = channelId;
			await rr.save();
		}

		// Refresh the live Discord message
		await rrHelpers.refreshReactionRoleMessage(messageId, container);

		return c.json({ success: true, created, data: rr });
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

// =============================================================================
// UPDATE endpoint
// =============================================================================

/**
 * PATCH /api/reaction-roles/:id
 * Body: { emoji?, roleId?, channelId? }
 *
 * - If emoji changed: removes the old bot reaction, adds the new one.
 * - Saves updated record.
 * - Calls refreshReactionRoleMessage so the Discord message reflects the change.
 */

// =============================================================================
// DELETE endpoints
// =============================================================================

/**
 * DELETE /api/reaction-roles/:id
 *
 * - Removes the bot reaction from the Discord message (best-effort).
 * - Destroys the DB record.
 * - Calls refreshReactionRoleMessage so remaining RRs are reflected.
 */

/**
 * DELETE /api/reaction-roles/message/:messageId
 *
 * Bulk-delete ALL reaction roles tied to a Discord message.
 * Removes every bot reaction from the message, then destroys all DB records.
 */
app.delete('/message/:messageId', async (c) => {
	const client = getBot(c);
	const { ReactionRole } = getModels(c);
	const messageId = c.req.param('messageId');

	try {
		const records = await ReactionRole.getAllCache({ where: { messageId } });

		if (records.length === 0) {
			return c.json(
				{ success: false, error: 'No reaction roles found for this message' },
				404,
			);
		}

		const channelId = records[0].channelId;

		// Remove all bot reactions (best-effort)
		try {
			const channel = await client.channels.fetch(channelId).catch(() => null);
			if (channel) {
				const message = await channel.messages
					.fetch(messageId)
					.catch(() => null);
				if (message) {
					for (const rr of records) {
						try {
							const botReaction = message.reactions.cache.find((r) => {
								const reactEmoji = r.emoji.id ?? r.emoji.name;
								return (
									reactEmoji === rr.emoji ||
									`<:${r.emoji.name}:${r.emoji.id}>` === rr.emoji
								);
							});
							if (botReaction) {
								await botReaction.users.remove(client.user.id);
							}
						} catch (_) {
							// Continue on individual reaction removal failure
						}
					}
				}
			}
		} catch (_) {
			// Non-critical
		}

		// Bulk destroy all records for this message
		const deletedCount = await ReactionRole.destroy({ where: { messageId } });

		return c.json({
			success: true,
			message: `Deleted ${deletedCount} reaction role(s) for message ${messageId}`,
		});
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

// =============================================================================
// REFRESH endpoint
// =============================================================================

/**
 * POST /api/reaction-roles/message/:messageId/refresh
 *
 * Force-refresh the Discord message for the given messageId.
 * Reads all current DB records and re-edits the message.
 */
app.post('/message/:messageId/refresh', async (c) => {
	const container = getContainer(c);
	const messageId = c.req.param('messageId');

	try {
		await rrHelpers.refreshReactionRoleMessage(messageId, container);
		return c.json({ success: true, message: `Message ${messageId} refreshed` });
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

// =============================================================================
// PANEL endpoints
// =============================================================================

/**
 * GET /api/reaction-roles/panels
 * Query: ?guildId (required)
 *
 * List all panels for a guild, with an emoji binding count per panel.
 */
app.get('/panels', async (c) => {
	const { ReactionRolePanel, ReactionRole } = getModels(c);
	const guildId = c.req.query('guildId');

	if (!guildId)
		return c.json({ success: false, error: 'guildId is required' }, 400);

	try {
		const panels = await ReactionRolePanel.getAllCache({ where: { guildId } });

		const bindings = await ReactionRole.getAllCache({
			where: { guildId },
			attributes: ['panelId'],
		});
		const countMap = {};
		for (const b of bindings) {
			if (b.panelId != null)
				countMap[b.panelId] = (countMap[b.panelId] || 0) + 1;
		}

		const data = panels.map((p) => ({
			...p.toJSON(),
			emojiCount: countMap[p.id] || 0,
		}));
		return c.json({ success: true, count: data.length, data });
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

/**
 * GET /api/reaction-roles/panels/:id
 *
 * Fetch a single panel with all its emoji bindings.
 */
app.get('/panels/:id', async (c) => {
	const { ReactionRolePanel, ReactionRole } = getModels(c);
	const id = c.req.param('id');

	try {
		const panel = await ReactionRolePanel.getCache({ id: id });
		if (!panel)
			return c.json({ success: false, error: 'Panel not found' }, 404);

		const bindings = await ReactionRole.getAllCache({ where: { panelId: id } });
		return c.json({ success: true, data: { ...panel.toJSON(), bindings } });
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

/**
 * POST /api/reaction-roles/panels
 * Body: { guildId, channelId, mode, title?, description?, messageId? }
 *
 * Create a new panel.
 * - 'post_embed': bot posts an embed to channelId and saves the message ID.
 * - 'use_message': validates the existing messageId and stores it.
 */
app.post('/panels', async (c) => {
	const client = getBot(c);
	const container = getContainer(c);
	const { ReactionRolePanel } = getModels(c);
	const body = await c.req.json();
	const {
		guildId,
		channelId,
		mode = 'post_embed',
		panelType = 'reaction',
		title,
		description,
		messageId: bodyMessageId,
		layout = null,
	} = body;

	if (!guildId || !channelId) {
		return c.json(
			{ success: false, error: 'guildId and channelId are required' },
			400,
		);
	}

	try {
		const channel = await client.channels.fetch(channelId).catch(() => null);
		if (!channel?.isTextBased())
			return c.json(
				{ success: false, error: 'Channel not found or not a text channel' },
				404,
			);

		let panelMessageId = null;

		if (mode === 'use_message') {
			if (!bodyMessageId)
				return c.json(
					{
						success: false,
						error: 'messageId is required for use_message mode',
					},
					400,
				);
			const msg = await channel.messages.fetch(bodyMessageId).catch(() => null);
			if (!msg)
				return c.json(
					{ success: false, error: `Message ${bodyMessageId} not found` },
					404,
				);
			panelMessageId = bodyMessageId;
		} else {
			// post_embed — send an initial embed
			const { MessageFlags } = require('discord.js');
			const panelTitle = title || '🎭 Reaction Roles';
			const embed = rrHelpers.buildPanelEmbed(
				{
					title: panelTitle,
					description: description || null,
					whitelistRoles: [],
					blacklistRoles: [],
					layout: layout || null,
				},
				[],
				container,
			);
			const sent = await channel.send({
				components: [embed],
				flags: MessageFlags.IsComponentsV2,
			});
			panelMessageId = sent.id;
		}

		const panel = await ReactionRolePanel.create({
			guildId,
			channelId,
			messageId: panelMessageId,
			mode,
			panelType,
			title: title || null,
			description: description || null,
			whitelistRoles: body.whitelistRoles || [],
			blacklistRoles: body.blacklistRoles || [],
			messageType: body.messageType || 'normal',
			layout: layout || null,
		});

		// Refresh to render the panel properly
		await rrHelpers.refreshPanelMessage(panel.id, container);

		return c.json({ success: true, data: panel }, 201);
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

/**
 * PATCH /api/reaction-roles/panels/:id
 * Body: { title?, description?, whitelistRoles?, blacklistRoles?, messageType?, channelId?, mode?, messageId? }
 *
 * Full panel update. Also handles:
 * - Channel migration (post_embed): deletes old message, posts new embed in new channel, migrates bindings.
 * - Mode change (use_message → post_embed): posts new embed in current/new channel.
 * - Mode change (post_embed → use_message): validates provided messageId in channel.
 */
app.patch('/panels/:id', async (c) => {
	const client = getBot(c);
	const container = getContainer(c);
	const { ReactionRolePanel, ReactionRole } = getModels(c);
	const id = c.req.param('id');
	const body = await c.req.json();
	const { MessageFlags } = require('discord.js');

	try {
		const panel = await ReactionRolePanel.getCache({ id: id });
		if (!panel)
			return c.json({ success: false, error: 'Panel not found' }, 404);

		// --- Simple metadata fields ---
		const oldPanelType = panel.panelType || 'reaction';

		const metadataFields = [
			'panelType',
			'title',
			'description',
			'whitelistRoles',
			'blacklistRoles',
			'messageType',
			'layout',
		];
		for (const key of metadataFields) {
			if (body[key] !== undefined) panel[key] = body[key];
		}

		const newPanelType = panel.panelType || 'reaction';

		// If switching panel types, add or remove the bot's emoji reactions on the active message
		if (oldPanelType !== newPanelType && panel.messageId) {
			try {
				const channel = await client.channels
					.fetch(panel.channelId)
					.catch(() => null);
				if (channel) {
					const message = await channel.messages
						.fetch(panel.messageId)
						.catch(() => null);
					if (message) {
						const bindings = await ReactionRole.getAllCache({
							where: { panelId: panel.id },
						});
						for (const rr of bindings) {
							if (newPanelType === 'dropdown') {
								// Remove reaction
								const reaction = message.reactions.cache.find(
									(r) =>
										(r.emoji.id || r.emoji.name) === rr.emoji ||
										`<:${r.emoji.name}:${r.emoji.id}>` === rr.emoji,
								);
								if (reaction)
									await reaction.users.remove(client.user.id).catch(() => {});
							} else if (newPanelType === 'reaction') {
								// Add reaction
								await message.react(rr.emoji).catch(() => {});
							}
						}
					}
				}
			} catch (_) {}
		}

		// --- Channel / mode migration ---
		const newChannelId = body.channelId;
		const newMode = body.mode;
		const newMessageId = body.messageId;
		const channelChanging = newChannelId && newChannelId !== panel.channelId;
		const modeChanging = newMode && newMode !== panel.mode;

		if (
			channelChanging ||
			modeChanging ||
			(newMode === 'use_message' && newMessageId)
		) {
			const targetChannelId = newChannelId || panel.channelId;
			const targetMode = newMode || panel.mode;

			const targetChannel = await client.channels
				.fetch(targetChannelId)
				.catch(() => null);
			if (!targetChannel?.isTextBased()) {
				return c.json(
					{
						success: false,
						error: 'Target channel not found or not a text channel',
					},
					404,
				);
			}

			// Fetch all bindings before migration
			const bindings = await ReactionRole.getAllCache({
				where: { panelId: panel.id },
			});

			if (targetMode === 'use_message') {
				// Attaching to an existing message
				if (!newMessageId) {
					return c.json(
						{
							success: false,
							error: 'messageId is required when switching to use_message mode',
						},
						400,
					);
				}
				const targetMessage = await targetChannel.messages
					.fetch(newMessageId)
					.catch(() => null);
				if (!targetMessage) {
					return c.json(
						{
							success: false,
							error: `Message ${newMessageId} not found in channel`,
						},
						404,
					);
				}

				// Best-effort: remove reactions from old message
				if (panel.messageId && (channelChanging || modeChanging)) {
					try {
						const oldChannel = await client.channels
							.fetch(panel.channelId)
							.catch(() => null);
						const oldMessage = oldChannel
							? await oldChannel.messages
									.fetch(panel.messageId)
									.catch(() => null)
							: null;
						if (oldMessage)
							await oldMessage.reactions.removeAll().catch(() => {});
					} catch (_) {}
				}

				// React on the new message
				for (const rr of bindings) {
					try {
						await targetMessage.react(rr.emoji);
					} catch (_) {}
				}

				panel.channelId = targetChannelId;
				panel.messageId = newMessageId;
				panel.mode = 'use_message';
			} else {
				// post_embed: post a new embed in the target channel
				const panelTitle = panel.title || '🎭 Reaction Roles';
				const embed = rrHelpers.buildPanelEmbed(
					{
						title: panelTitle,
						description: panel.description,
						whitelistRoles: panel.whitelistRoles || [],
						blacklistRoles: panel.blacklistRoles || [],
					},
					[],
					container,
				);
				const sent = await targetChannel.send({
					components: [embed],
					flags: MessageFlags.IsComponentsV2,
				});

				// Delete old panel message if channel is changing (best-effort)
				if (channelChanging && panel.messageId) {
					try {
						const oldChannel = await client.channels
							.fetch(panel.channelId)
							.catch(() => null);
						const oldMessage = oldChannel
							? await oldChannel.messages
									.fetch(panel.messageId)
									.catch(() => null)
							: null;
						if (oldMessage) await oldMessage.delete().catch(() => {});
					} catch (_) {}
				}

				// Update binding records to point at new channel/message
				if (bindings.length > 0) {
					await ReactionRole.update(
						{ channelId: targetChannelId, messageId: sent.id },
						{ where: { panelId: panel.id } },
					);
					// Re-react on the new message
					for (const rr of bindings) {
						try {
							await sent.react(rr.emoji);
						} catch (_) {}
					}
				}

				panel.channelId = targetChannelId;
				panel.messageId = sent.id;
				panel.mode = 'post_embed';
			}
		}

		await panel.save();
		await rrHelpers.refreshPanelMessage(panel.id, container);

		return c.json({ success: true, data: panel });
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

/**
 * DELETE /api/reaction-roles/panels/:id
 *
 * Delete panel + all bindings. Removes bot reactions from the panel message.
 */
app.delete('/panels/:id', async (c) => {
	const client = getBot(c);
	const { ReactionRolePanel, ReactionRole } = getModels(c);
	const id = c.req.param('id');

	try {
		const panel = await ReactionRolePanel.getCache({ id: id });
		if (!panel)
			return c.json({ success: false, error: 'Panel not found' }, 404);

		// Remove bot reactions (best-effort)
		try {
			const channel = await client.channels
				.fetch(panel.channelId)
				.catch(() => null);
			if (channel && panel.messageId) {
				const message = await channel.messages
					.fetch(panel.messageId)
					.catch(() => null);
				if (message) {
					const bindings = await ReactionRole.getAllCache({
						where: { panelId: panel.id },
					});
					for (const rr of bindings) {
						try {
							const reaction = message.reactions.cache.find((r) => {
								const e = r.emoji.id ?? r.emoji.name;
								return (
									e === rr.emoji ||
									`<:${r.emoji.name}:${r.emoji.id}>` === rr.emoji
								);
							});
							if (reaction) await reaction.users.remove(client.user.id);
						} catch (_) {}
					}
				}
			}
		} catch (_) {}

		await panel.destroy(); // cascades to reaction_roles

		return c.json({ success: true, message: `Panel ${id} deleted` });
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

/**
 * POST /api/reaction-roles/panels/:id/emoji
 * Body: { emoji, roleId }
 *
 * Add an emoji→role binding to a panel. Reacts on the panel message.
 */
app.post('/panels/:id/emoji', async (c) => {
	const client = getBot(c);
	const container = getContainer(c);
	const { ReactionRolePanel, ReactionRole } = getModels(c);
	const id = c.req.param('id');
	const body = await c.req.json();
	const { emoji, roleId, label } = body;

	if (!emoji || !roleId)
		return c.json(
			{ success: false, error: 'emoji and roleId are required' },
			400,
		);

	try {
		const panel = await ReactionRolePanel.getCache({ id: id });
		if (!panel)
			return c.json({ success: false, error: 'Panel not found' }, 404);

		const channel = await client.channels
			.fetch(panel.channelId)
			.catch(() => null);
		if (!channel)
			return c.json({ success: false, error: 'Panel channel not found' }, 404);

		const message = await channel.messages
			.fetch(panel.messageId)
			.catch(() => null);
		if (!message)
			return c.json({ success: false, error: 'Panel message not found' }, 404);

		// Validate emoji
		try {
			const reaction = await message.react(emoji);
			if (panel.panelType === 'dropdown') {
				try {
					await reaction.users.remove(client.user.id);
				} catch (_) {}
			}
		} catch (_) {
			return c.json({ success: false, error: `Invalid emoji: ${emoji}` }, 400);
		}

		const [rr, created] = await ReactionRole.findOrCreate({
			where: { guildId: panel.guildId, messageId: panel.messageId, emoji },
			defaults: {
				guildId: panel.guildId,
				channelId: panel.channelId,
				messageId: panel.messageId,
				emoji,
				roleId,
				label: label || null,
				panelId: panel.id,
			},
		});

		if (!created) {
			rr.roleId = roleId;
			if (label !== undefined) rr.label = label || null;
			await rr.save();
		}

		await rrHelpers.refreshPanelMessage(panel.id, container);

		return c.json({ success: true, created, data: rr });
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

/**
 * DELETE /api/reaction-roles/panels/:id/emoji/:rrId
 *
 * Remove a single emoji binding from a panel.
 */
app.delete('/panels/:id/emoji/:rrId', async (c) => {
	const client = getBot(c);
	const container = getContainer(c);
	const { ReactionRole } = getModels(c);
	const rrId = c.req.param('rrId');

	try {
		const rr = await ReactionRole.getCache({ id: rrId });
		if (!rr) return c.json({ success: false, error: 'Binding not found' }, 404);

		// Remove bot reaction (best-effort)
		try {
			const channel = await client.channels
				.fetch(rr.channelId)
				.catch(() => null);
			if (channel) {
				const message = await channel.messages
					.fetch(rr.messageId)
					.catch(() => null);
				if (message) {
					const reaction = message.reactions.cache.find((r) => {
						const e = r.emoji.id ?? r.emoji.name;
						return (
							e === rr.emoji || `<:${r.emoji.name}:${r.emoji.id}>` === rr.emoji
						);
					});
					if (reaction) await reaction.users.remove(client.user.id);
				}
			}
		} catch (_) {}

		const panelId = rr.panelId;
		await rr.destroy();

		if (panelId) await rrHelpers.refreshPanelMessage(panelId, container);

		return c.json({ success: true, message: `Binding ${rrId} removed` });
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

/**
 * POST /api/reaction-roles/panels/:id/refresh
 *
 * Force-refresh the Discord panel message.
 */
app.post('/panels/:id/refresh', async (c) => {
	const container = getContainer(c);
	const id = c.req.param('id');

	try {
		await rrHelpers.refreshPanelMessage(parseInt(id, 10), container);
		return c.json({ success: true, message: `Panel ${id} refreshed` });
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

// =============================================================================
// PANEL — additional dashboard endpoints
// =============================================================================

/**
 * PATCH /api/reaction-roles/panels/:id/emoji/:rrId
 * Body: { emoji?, roleId? }
 *
 * Edit an existing emoji→role binding on a panel.
 * - If emoji changes: removes old bot reaction, adds new one.
 * - If roleId changes: updates DB only.
 * - Always refreshes the panel embed afterward.
 */
app.patch('/panels/:id/emoji/:rrId', async (c) => {
	const client = getBot(c);
	const container = getContainer(c);
	const { ReactionRole } = getModels(c);
	const rrId = c.req.param('rrId');
	const body = await c.req.json();

	try {
		const rr = await ReactionRole.getCache({ id: rrId });
		if (!rr) return c.json({ success: false, error: 'Binding not found' }, 404);

		const newEmoji = body.emoji ?? rr.emoji;
		const newRoleId = body.roleId ?? rr.roleId;
		const newLabel = body.label !== undefined ? body.label : rr.label;
		const emojiChanged = newEmoji !== rr.emoji;

		if (emojiChanged) {
			// Fetch the panel message for reaction updates
			const channel = await client.channels
				.fetch(rr.channelId)
				.catch(() => null);
			const message = channel
				? await channel.messages.fetch(rr.messageId).catch(() => null)
				: null;

			if (message) {
				// Validate new emoji first
				try {
					await message.react(newEmoji);
				} catch (_) {
					return c.json(
						{ success: false, error: `Invalid emoji: ${newEmoji}` },
						400,
					);
				}

				// Remove old bot reaction (best-effort)
				try {
					const oldReaction = message.reactions.cache.find((r) => {
						const e = r.emoji.id ?? r.emoji.name;
						return (
							e === rr.emoji || `<:${r.emoji.name}:${r.emoji.id}>` === rr.emoji
						);
					});
					if (oldReaction) await oldReaction.users.remove(client.user.id);
				} catch (_) {}
			}
		}

		await rr.update({ emoji: newEmoji, roleId: newRoleId, label: newLabel });

		if (rr.panelId) await rrHelpers.refreshPanelMessage(rr.panelId, container);

		return c.json({ success: true, data: rr });
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

/**
 * PUT /api/reaction-roles/panels/:id/emoji
 * Body: { bindings: [{ emoji, roleId }, ...] }
 *
 * Bulk-replace ALL emoji bindings on a panel.
 * Removes all existing bot reactions and bindings, then creates the new set.
 * Ideal for the dashboard drag-and-drop reorder flow.
 */
app.put('/panels/:id/emoji', async (c) => {
	const client = getBot(c);
	const container = getContainer(c);
	const { ReactionRolePanel, ReactionRole } = getModels(c);
	const id = c.req.param('id');
	const body = await c.req.json();
	const { bindings } = body;

	if (!Array.isArray(bindings)) {
		return c.json(
			{
				success: false,
				error: '`bindings` must be an array of { emoji, roleId }',
			},
			400,
		);
	}

	try {
		const panel = await ReactionRolePanel.getCache({ id: id });
		if (!panel)
			return c.json({ success: false, error: 'Panel not found' }, 404);

		const channel = await client.channels
			.fetch(panel.channelId)
			.catch(() => null);
		const message =
			channel && panel.messageId
				? await channel.messages.fetch(panel.messageId).catch(() => null)
				: null;

		// Remove all existing bot reactions (best-effort)
		if (message) {
			try {
				await message.reactions.removeAll();
			} catch (_) {
				// Fallback: individually remove bot's reactions
				const existing = await ReactionRole.getAllCache({
					where: { panelId: panel.id },
				});
				for (const rr of existing) {
					try {
						const reaction = message.reactions.cache.find((r) => {
							const e = r.emoji.id ?? r.emoji.name;
							return (
								e === rr.emoji ||
								`<:${r.emoji.name}:${r.emoji.id}>` === rr.emoji
							);
						});
						if (reaction) await reaction.users.remove(client.user.id);
					} catch (_) {}
				}
			}
		}

		// Destroy all existing bindings for this panel
		await ReactionRole.destroy({ where: { panelId: panel.id } });

		// Create new bindings and react
		const created = [];
		for (const { emoji, roleId, label } of bindings) {
			if (!emoji || !roleId) continue;

			// React to validate + establish the reaction
			if (message && panel.panelType !== 'dropdown') {
				try {
					await message.react(emoji);
				} catch (_) {
					continue; // Skip invalid emojis silently in bulk mode
				}
			}

			const rr = await ReactionRole.create({
				guildId: panel.guildId,
				channelId: panel.channelId,
				messageId: panel.messageId,
				emoji,
				roleId,
				label: label || null,
				panelId: panel.id,
			});
			created.push(rr);
		}

		await rrHelpers.refreshPanelMessage(panel.id, container);

		return c.json({ success: true, count: created.length, data: created });
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

/**
 * POST /api/reaction-roles/panels/:id/emoji/validate
 * Body: { emoji }
 *
 * Validate an emoji against the panel's message WITHOUT saving anything.
 * Returns { valid: true } if the bot can react with it, { valid: false, error } otherwise.
 * Useful for live form validation in the dashboard.
 */
app.post('/panels/:id/emoji/validate', async (c) => {
	const client = getBot(c);
	const { ReactionRolePanel } = getModels(c);
	const id = c.req.param('id');
	const body = await c.req.json();
	const { emoji } = body;

	if (!emoji)
		return c.json({ success: false, error: 'emoji is required' }, 400);

	try {
		const panel = await ReactionRolePanel.getCache({ id: id });
		if (!panel)
			return c.json({ success: false, error: 'Panel not found' }, 404);

		const channel = await client.channels
			.fetch(panel.channelId)
			.catch(() => null);
		if (!channel)
			return c.json({
				success: true,
				valid: false,
				error: 'Panel channel not found',
			});

		const message = panel.messageId
			? await channel.messages.fetch(panel.messageId).catch(() => null)
			: null;
		if (!message)
			return c.json({
				success: true,
				valid: false,
				error: 'Panel message not found',
			});

		try {
			const reaction = await message.react(emoji);
			// Remove the test reaction immediately
			try {
				await reaction.users.remove(client.user.id);
			} catch (_) {}
			return c.json({ success: true, valid: true });
		} catch (_) {
			return c.json({
				success: true,
				valid: false,
				error: `Cannot react with: ${emoji}`,
			});
		}
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

/**
 * POST /api/reaction-roles/panels/:id/duplicate
 * Body: { channelId, title? }
 *
 * Duplicate a panel (all its metadata + bindings) to a target channel.
 * Useful for copying a panel setup to another channel from the dashboard.
 */
app.post('/panels/:id/duplicate', async (c) => {
	const client = getBot(c);
	const container = getContainer(c);
	const { ReactionRolePanel, ReactionRole } = getModels(c);
	const id = c.req.param('id');
	const body = await c.req.json();
	const { channelId: targetChannelId, title: overrideTitle } = body;

	if (!targetChannelId) {
		return c.json(
			{ success: false, error: 'targetChannelId is required' },
			400,
		);
	}

	try {
		const sourcePanel = await ReactionRolePanel.getCache({ id: id });
		if (!sourcePanel)
			return c.json({ success: false, error: 'Source panel not found' }, 404);

		const targetChannel = await client.channels
			.fetch(targetChannelId)
			.catch(() => null);
		if (!targetChannel?.isTextBased()) {
			return c.json(
				{
					success: false,
					error: 'Target channel not found or not a text channel',
				},
				404,
			);
		}

		// Post initial embed to target channel
		const { MessageFlags } = require('discord.js');
		const newTitle = overrideTitle || sourcePanel.title || '🎭 Reaction Roles';
		const embed = rrHelpers.buildPanelEmbed(
			{
				title: newTitle,
				description: sourcePanel.description,
				whitelistRoles: sourcePanel.whitelistRoles || [],
				blacklistRoles: sourcePanel.blacklistRoles || [],
			},
			[],
			container,
		);
		const sent = await targetChannel.send({
			components: [embed],
			flags: MessageFlags.IsComponentsV2,
		});

		// Create new panel record
		const newPanel = await ReactionRolePanel.create({
			guildId: sourcePanel.guildId,
			channelId: targetChannelId,
			messageId: sent.id,
			mode: 'post_embed',
			panelType: sourcePanel.panelType,
			title: newTitle,
			description: sourcePanel.description,
			whitelistRoles: sourcePanel.whitelistRoles || [],
			blacklistRoles: sourcePanel.blacklistRoles || [],
			messageType: sourcePanel.messageType,
		});

		// Copy all emoji bindings to the new panel
		const sourceBindings = await ReactionRole.getAllCache({
			where: { panelId: sourcePanel.id },
		});
		const newBindings = [];
		for (const rr of sourceBindings) {
			try {
				if (sourcePanel.panelType !== 'dropdown') await sent.react(rr.emoji);
				const newRr = await ReactionRole.create({
					guildId: newPanel.guildId,
					channelId: newPanel.channelId,
					messageId: newPanel.messageId,
					emoji: rr.emoji,
					roleId: rr.roleId,
					label: rr.label,
					panelId: newPanel.id,
				});
				newBindings.push(newRr);
			} catch (_) {} // Skip invalid emojis
		}

		// Refresh to render properly
		await rrHelpers.refreshPanelMessage(newPanel.id, container);

		return c.json(
			{ success: true, data: { ...newPanel.toJSON(), bindings: newBindings } },
			201,
		);
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

// =============================================================================
// SINGLE RECORD endpoints — must be LAST so /panels is not swallowed by /:id
// =============================================================================

// GET /api/reaction-roles/:id
app.get('/:id', async (c) => {
	const { ReactionRole } = getModels(c);
	const id = c.req.param('id');

	try {
		const rr = await ReactionRole.getCache({ id: id });
		if (!rr)
			return c.json({ success: false, error: 'ReactionRole not found' }, 404);
		return c.json({ success: true, data: rr });
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

/**
 * PATCH /api/reaction-roles/:id
 * Body: { emoji?, roleId?, channelId? }
 *
 * - If emoji changed: removes the old bot reaction, adds the new one.
 * - Saves updated record.
 * - Calls refreshReactionRoleMessage so the Discord message reflects the change.
 */
app.patch('/:id', async (c) => {
	const client = getBot(c);
	const container = getContainer(c);
	const { ReactionRole } = getModels(c);
	const id = c.req.param('id');
	const body = await c.req.json();

	try {
		const rr = await ReactionRole.getCache({ id: id });
		if (!rr)
			return c.json({ success: false, error: 'ReactionRole not found' }, 404);

		const oldEmoji = rr.emoji;
		const newEmoji = body.emoji ?? rr.emoji;
		const emojiChanged = newEmoji !== oldEmoji;

		// If emoji is changing, validate the new emoji first
		if (emojiChanged) {
			const channel = await client.channels
				.fetch(body.channelId ?? rr.channelId)
				.catch(() => null);

			if (channel) {
				const message = await channel.messages
					.fetch(rr.messageId)
					.catch(() => null);

				if (message) {
					// Remove old bot reaction
					try {
						const oldReaction = message.reactions.cache.find((r) => {
							const reactEmoji = r.emoji.id ?? r.emoji.name;
							return (
								reactEmoji === oldEmoji ||
								`<:${r.emoji.name}:${r.emoji.id}>` === oldEmoji
							);
						});
						if (oldReaction) {
							await oldReaction.users.remove(client.user.id);
						}
					} catch (_) {
						// Best-effort; continue even if removal fails
					}

					// Validate & add new emoji reaction
					try {
						await message.react(newEmoji);
					} catch (_) {
						return c.json(
							{ success: false, error: `Invalid emoji: ${newEmoji}` },
							400,
						);
					}
				}
			}
		}

		// Persist updates
		await rr.update({
			emoji: newEmoji,
			roleId: body.roleId ?? rr.roleId,
			channelId: body.channelId ?? rr.channelId,
		});

		// Refresh the live Discord message
		await rrHelpers.refreshReactionRoleMessage(rr.messageId, container);

		return c.json({ success: true, data: rr });
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

/**
 * DELETE /api/reaction-roles/:id
 *
 * - Removes the bot reaction from the Discord message (best-effort).
 * - Destroys the DB record.
 * - Calls refreshReactionRoleMessage so remaining RRs are reflected.
 */
app.delete('/:id', async (c) => {
	const client = getBot(c);
	const container = getContainer(c);
	const { ReactionRole } = getModels(c);
	const id = c.req.param('id');

	try {
		const rr = await ReactionRole.getCache({ id: id });
		if (!rr)
			return c.json({ success: false, error: 'ReactionRole not found' }, 404);

		const { channelId, messageId, emoji } = rr;

		// Destroy DB record first
		await rr.destroy();

		// Remove bot reaction (best-effort)
		try {
			const channel = await client.channels.fetch(channelId).catch(() => null);
			if (channel) {
				const message = await channel.messages
					.fetch(messageId)
					.catch(() => null);
				if (message) {
					const botReaction = message.reactions.cache.find((r) => {
						const reactEmoji = r.emoji.id ?? r.emoji.name;
						return (
							reactEmoji === emoji ||
							`<:${r.emoji.name}:${r.emoji.id}>` === emoji
						);
					});
					if (botReaction) {
						await botReaction.users.remove(client.user.id);
					}
				}
			}
		} catch (_) {
			// Non-critical — continue
		}

		// Refresh the live Discord message with remaining reaction roles
		await rrHelpers.refreshReactionRoleMessage(messageId, container);

		return c.json({
			success: true,
			message: `ReactionRole (id=${id}) deleted successfully`,
		});
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

module.exports = app;
