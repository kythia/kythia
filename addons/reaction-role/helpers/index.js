/**
 * @namespace: addons/reaction-role/helpers/index.js
 * @type: Helper Script
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 1.0.0-rc
 */

const {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ContainerBuilder,
	MediaGalleryBuilder,
	MediaGalleryItemBuilder,
	SeparatorBuilder,
	SeparatorSpacingSize,
	StringSelectMenuBuilder,
	TextDisplayBuilder,
	MessageFlags,
} = require('discord.js');

// =============================================================================
// getSafeEmoji — validate emoji string before passing to select menu options
// =============================================================================

function getSafeEmoji(emoji, fallback = '🎭') {
	if (!emoji || typeof emoji !== 'string') return fallback;
	const clean = emoji.trim();
	if (clean.length === 0) return fallback;
	// Custom emoji: <:name:id> or <a:name:id>
	if (/^<a?:.+?:\d{17,20}>$/.test(clean)) return clean;
	try {
		if (/\p{Extended_Pictographic}/u.test(clean)) return clean;
	} catch (_) {
		if (
			/(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/.test(
				clean,
			)
		)
			return clean;
	}
	return fallback;
}

// =============================================================================
// buildLayoutContainer — embed-builder JSON → Components V2
// =============================================================================

/**
 * Layout schema (all fields optional):
 * {
 *   accentColor:   string,  // hex  e.g. "#5865F2"
 *   authorName:    string,
 *   authorIconUrl: string,  // stored but not renderable natively in CV2 — ignored
 *   authorUrl:     string,
 *   title:         string,
 *   titleUrl:      string,
 *   description:   string,
 *   fields:        [{ name: string, value: string, inline?: boolean }],
 *   imageUrl:      string,  // large image at bottom
 *   thumbnailUrl:  string,  // small image shown above title
 *   footerText:    string,
 *   footerIconUrl: string,  // stored but not renderable natively in CV2 — ignored
 *   timestamp:     string,  // ISO 8601 — appended to footer as Discord timestamp
 * }
 *
 * @param {object}   layout      Layout config object (see schema above).
 * @param {object[]} bindings    Array of ReactionRole DB instances.
 * @param {object}   container   Kythia DI container.
 * @param {object}   [panelData] Panel DB record (for whitelist/blacklist + id).
 * @returns {ContainerBuilder}
 */
function buildLayoutContainer(layout, bindings, container, panelData = {}) {
	const { helpers } = container;
	const { convertColor } = helpers.color;

	// --- Accent color ---
	let accentColor;
	try {
		accentColor = layout.accentColor
			? convertColor(layout.accentColor, { from: 'hex', to: 'decimal' })
			: convertColor(container.kythiaConfig.bot.color, {
					from: 'hex',
					to: 'decimal',
				});
	} catch (_) {
		accentColor = convertColor(container.kythiaConfig.bot.color, {
			from: 'hex',
			to: 'decimal',
		});
	}

	const builder = new ContainerBuilder().setAccentColor(accentColor);

	// --- Thumbnail (shown above title as a small gallery item) ---
	if (layout.thumbnailUrl) {
		builder.addMediaGalleryComponents(
			new MediaGalleryBuilder().addItems(
				new MediaGalleryItemBuilder().setURL(layout.thumbnailUrl),
			),
		);
		builder.addSeparatorComponents(
			new SeparatorBuilder()
				.setSpacing(SeparatorSpacingSize.Small)
				.setDivider(false),
		);
	}

	// --- Author ---
	if (layout.authorName) {
		const authorText = layout.authorUrl
			? `[${layout.authorName}](${layout.authorUrl})`
			: layout.authorName;
		builder.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(`-# ${authorText}`),
		);
	}

	// --- Title ---
	if (layout.title) {
		const titleText = layout.titleUrl
			? `## [${layout.title}](${layout.titleUrl})`
			: `## ${layout.title}`;
		builder.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(titleText),
		);
	}

	// --- Divider after header block ---
	if (layout.authorName || layout.title) {
		builder.addSeparatorComponents(
			new SeparatorBuilder()
				.setSpacing(SeparatorSpacingSize.Small)
				.setDivider(true),
		);
	}

	// --- Description ---
	if (layout.description) {
		builder.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(layout.description),
		);
	}

	// --- Fields ---
	if (Array.isArray(layout.fields) && layout.fields.length > 0) {
		if (layout.description) {
			builder.addSeparatorComponents(
				new SeparatorBuilder()
					.setSpacing(SeparatorSpacingSize.Small)
					.setDivider(false),
			);
		}

		// Pair inline fields two-at-a-time
		const inlineBuffer = [];
		const flushInline = () => {
			for (const f of inlineBuffer) {
				builder.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(`**${f.name}**\n${f.value}`),
				);
			}
			inlineBuffer.length = 0;
		};

		for (const field of layout.fields) {
			if (field.inline) {
				inlineBuffer.push(field);
				if (inlineBuffer.length === 2) {
					builder.addTextDisplayComponents(
						new TextDisplayBuilder().setContent(
							`**${inlineBuffer[0].name}**　|　**${inlineBuffer[1].name}**\n${inlineBuffer[0].value}　|　${inlineBuffer[1].value}`,
						),
					);
					inlineBuffer.length = 0;
				}
			} else {
				flushInline();
				builder.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(
						`**${field.name}**\n${field.value}`,
					),
				);
			}
		}
		flushInline();
	}

	// --- Emoji bindings ---
	const isDropdown = panelData.panelType === 'dropdown';

	if (isDropdown) {
		if (bindings && bindings.length > 0) {
			builder.addSeparatorComponents(
				new SeparatorBuilder()
					.setSpacing(SeparatorSpacingSize.Small)
					.setDivider(true),
			);
			const guild = container.client.guilds.cache.get(panelData.guildId);
			const options = bindings.map((rr) => {
				const roleName = guild?.roles.cache.get(rr.roleId)?.name;
				return {
					label: rr.label || roleName || `Role ${rr.roleId}`,
					value: rr.roleId,
					emoji: getSafeEmoji(rr.emoji),
				};
			});
			builder.addActionRowComponents(
				new ActionRowBuilder().addComponents(
					new StringSelectMenuBuilder()
						.setCustomId(`rr-dropdown-select:${panelData.id}`)
						.setPlaceholder('Select a role…')
						.setMinValues(1)
						.setMaxValues(1)
						.setOptions(options),
				),
			);
		}
	} else {
		if (bindings && bindings.length > 0) {
			builder.addSeparatorComponents(
				new SeparatorBuilder()
					.setSpacing(SeparatorSpacingSize.Small)
					.setDivider(true),
			);
			let bindingLines = '';
			for (const rr of bindings) {
				bindingLines += `${rr.emoji} <@&${rr.roleId}>\n`;
			}
			builder.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(bindingLines.trimEnd()),
			);
		}
	}

	// --- Large image (bottom, before footer) ---
	if (layout.imageUrl) {
		builder.addSeparatorComponents(
			new SeparatorBuilder()
				.setSpacing(SeparatorSpacingSize.Small)
				.setDivider(false),
		);
		builder.addMediaGalleryComponents(
			new MediaGalleryBuilder().addItems(
				new MediaGalleryItemBuilder().setURL(layout.imageUrl),
			),
		);
	}

	// --- Footer (text + timestamp) ---
	const footerParts = [];
	if (layout.footerText) footerParts.push(layout.footerText);
	if (layout.timestamp) {
		try {
			const ts = Math.floor(new Date(layout.timestamp).getTime() / 1000);
			footerParts.push(`<t:${ts}:f>`);
		} catch (_) {
			footerParts.push(layout.timestamp);
		}
	}
	if (footerParts.length > 0) {
		builder.addSeparatorComponents(
			new SeparatorBuilder()
				.setSpacing(SeparatorSpacingSize.Small)
				.setDivider(true),
		);
		builder.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(`-# ${footerParts.join(' • ')}`),
		);
	}

	// --- Whitelist / blacklist roles note ---
	const wlbl = [];
	const whitelist = panelData.whitelistRoles || [];
	const blacklist = panelData.blacklistRoles || [];
	if (whitelist.length > 0)
		wlbl.push(`🟢 Whitelist: ${whitelist.map((id) => `<@&${id}>`).join(', ')}`);
	if (blacklist.length > 0)
		wlbl.push(`🔴 Blacklist: ${blacklist.map((id) => `<@&${id}>`).join(', ')}`);
	if (wlbl.length > 0) {
		builder.addSeparatorComponents(
			new SeparatorBuilder()
				.setSpacing(SeparatorSpacingSize.Small)
				.setDivider(true),
		);
		builder.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(wlbl.join('\n')),
		);
	}

	// --- Add Emoji button (if panel ID known and no bindings exist) ---
	if (panelData.id && (!bindings || bindings.length === 0)) {
		builder.addSeparatorComponents(
			new SeparatorBuilder()
				.setSpacing(SeparatorSpacingSize.Small)
				.setDivider(false),
		);
		builder.addActionRowComponents(
			new ActionRowBuilder().addComponents(
				new ButtonBuilder()
					.setCustomId(`rr-panel-add-emoji-show:${panelData.id}`)
					.setLabel('Add Emoji → Role')
					.setStyle(ButtonStyle.Success)
					.setEmoji('➕'),
			),
		);
	}

	return builder;
}

// =============================================================================
// buildPanelEmbed — simple default panel (no custom layout)
// =============================================================================

/**
 * Build a Components V2 ContainerBuilder for a reaction role panel.
 * If `panelData.layout` is set, delegates to buildLayoutContainer() for
 * full embed-builder-style rendering; otherwise renders a simple default.
 *
 * @param {object}   panelData     Panel DB record or plain object.
 * @param {object[]} reactionRoles Array of ReactionRole DB instances.
 * @param {object}   container     Kythia DI container.
 * @returns {ContainerBuilder}
 */
function buildPanelEmbed(panelData, reactionRoles, container) {
	// Delegate to custom layout renderer if a layout config is present
	if (panelData.layout && typeof panelData.layout === 'object') {
		// Merge panel-level title/description into layout as defaults
		const mergedLayout = {
			title: panelData.title,
			description: panelData.description,
			...panelData.layout,
		};
		return buildLayoutContainer(
			mergedLayout,
			reactionRoles,
			container,
			panelData,
		);
	}

	const { kythiaConfig, helpers } = container;
	const { convertColor } = helpers.color;

	const accentColor = convertColor(kythiaConfig.bot.color, {
		from: 'hex',
		to: 'decimal',
	});

	const builder = new ContainerBuilder().setAccentColor(accentColor);

	// Title
	const title = panelData.title || '🎭 Reaction Roles';
	builder.addTextDisplayComponents(
		new TextDisplayBuilder().setContent(`## ${title}`),
	);

	builder.addSeparatorComponents(
		new SeparatorBuilder()
			.setSpacing(SeparatorSpacingSize.Small)
			.setDivider(true),
	);

	// Description (optional)
	if (panelData.description) {
		builder.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(panelData.description),
		);
		builder.addSeparatorComponents(
			new SeparatorBuilder()
				.setSpacing(SeparatorSpacingSize.Small)
				.setDivider(false),
		);
	}

	const isDropdown = panelData.panelType === 'dropdown';

	if (isDropdown) {
		// ── Dropdown mode: render a StringSelectMenu ──────────────────────────
		if (!reactionRoles || reactionRoles.length === 0) {
			builder.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					'> *No roles added yet. Use the button below to add some!*',
				),
			);
		} else {
			const guild = container.client.guilds.cache.get(panelData.guildId);
			const options = reactionRoles.map((rr) => {
				const roleName = guild?.roles.cache.get(rr.roleId)?.name;
				return {
					label: rr.label || roleName || `Role ${rr.roleId}`,
					value: rr.roleId,
					emoji: getSafeEmoji(rr.emoji),
				};
			});
			builder.addActionRowComponents(
				new ActionRowBuilder().addComponents(
					new StringSelectMenuBuilder()
						.setCustomId(`rr-dropdown-select:${panelData.id}`)
						.setPlaceholder('Select a role…')
						.setMinValues(1)
						.setMaxValues(1)
						.setOptions(options),
				),
			);
		}
	} else {
		// ── Reaction mode: list emoji → role lines ────────────────────────────
		if (!reactionRoles || reactionRoles.length === 0) {
			builder.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					'> *No reaction roles added yet. Use the buttons below to add some!*',
				),
			);
		} else {
			let lines = '';
			for (const rr of reactionRoles) {
				lines += `${rr.emoji} <@&${rr.roleId}>\n`;
			}
			builder.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(lines.trimEnd()),
			);
		}
	}

	// Whitelist / blacklist footer
	const flags = [];
	const whitelist = panelData.whitelistRoles || [];
	const blacklist = panelData.blacklistRoles || [];
	if (whitelist.length > 0)
		flags.push(
			`🟢 Whitelist: ${whitelist.map((id) => `<@&${id}>`).join(', ')}`,
		);
	if (blacklist.length > 0)
		flags.push(
			`🔴 Blacklist: ${blacklist.map((id) => `<@&${id}>`).join(', ')}`,
		);
	if (flags.length > 0) {
		builder.addSeparatorComponents(
			new SeparatorBuilder()
				.setSpacing(SeparatorSpacingSize.Small)
				.setDivider(true),
		);
		builder.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(flags.join('\n')),
		);
	}

	// Add Emoji button (only shown if panelId is present and no roles exist)
	if (panelData.id && (!reactionRoles || reactionRoles.length === 0)) {
		builder.addSeparatorComponents(
			new SeparatorBuilder()
				.setSpacing(SeparatorSpacingSize.Small)
				.setDivider(false),
		);
		builder.addActionRowComponents(
			new ActionRowBuilder().addComponents(
				new ButtonBuilder()
					.setCustomId(`rr-panel-add-emoji-show:${panelData.id}`)
					.setLabel('Add Emoji → Role')
					.setStyle(ButtonStyle.Success)
					.setEmoji('➕'),
			),
		);
	}

	return builder;
}

// =============================================================================
// buildReactionRoleComponents — legacy (no panel)
// =============================================================================

/**
 * Backwards-compatible builder used by old (non-panel) reaction roles.
 *
 * @param {object[]} reactionRoles
 * @param {object}   container
 * @returns {ContainerBuilder}
 */
function buildReactionRoleComponents(reactionRoles, container) {
	return buildPanelEmbed(
		{
			title: '🎭 Reaction Roles',
			description: null,
			whitelistRoles: [],
			blacklistRoles: [],
		},
		reactionRoles,
		container,
	);
}

// =============================================================================
// refreshPanelMessage
// =============================================================================

/**
 * Re-fetch all ReactionRole records for a given panel, then re-edit the
 * Discord panel message using the panel's current layout (custom or default).
 *
 * @param {number} panelId   DB primary key of the ReactionRolePanel record.
 * @param {object} container Kythia DI container.
 * @returns {Promise<void>}
 */
async function refreshPanelMessage(panelId, container) {
	const { models, logger } = container;
	const client = container.client;
	const { ReactionRolePanel, ReactionRole } = models;

	const panel = await ReactionRolePanel.findByPk(panelId);
	if (!panel || !panel.messageId) return;

	// For dropdown panels we always need to refresh (the select menu lives in the embed)
	// For reaction type + use_message, the reactions are on the user's message — skip rebuild
	if (
		panel.mode === 'use_message' &&
		(panel.panelType || 'reaction') === 'reaction'
	)
		return;

	const reactionRoles = await ReactionRole.getAllCache({
		where: { panelId: panel.id },
	});

	const channel = await client.channels
		.fetch(panel.channelId)
		.catch(() => null);
	if (!channel) {
		logger.warn(`Channel ${panel.channelId} not found for panel ${panelId}.`, {
			label: 'reaction-role refresh',
		});
		return;
	}

	const message = await channel.messages
		.fetch(panel.messageId)
		.catch(() => null);
	if (!message) {
		logger.warn(
			`Message ${panel.messageId} not found in channel ${panel.channelId}.`,
			{ label: 'reaction-role refresh' },
		);
		return;
	}

	const updatedContainer = buildPanelEmbed(
		panel.toJSON(),
		reactionRoles,
		container,
	);

	await message.edit({
		components: [updatedContainer],
		flags: MessageFlags.IsComponentsV2,
	});
}

// =============================================================================
// refreshReactionRoleMessage — legacy (no panel)
// =============================================================================

/**
 * Legacy helper — refreshes a Discord message that has reaction roles but
 * no associated panel (backwards compatibility with old add-command records).
 *
 * @param {string} messageId   Discord message ID.
 * @param {object} container   Kythia DI container.
 * @returns {Promise<void>}
 */
async function refreshReactionRoleMessage(messageId, container) {
	const { models, logger } = container;
	const client = container.client;
	const { ReactionRole } = models;

	const reactionRoles = await ReactionRole.getAllCache({
		where: { messageId },
	});
	if (reactionRoles.length === 0) return;

	// If these belong to a panel, delegate to panel refresh
	const firstWithPanel = reactionRoles.find((rr) => rr.panelId != null);
	if (firstWithPanel) {
		return refreshPanelMessage(firstWithPanel.panelId, container);
	}

	const channelId = reactionRoles[0].channelId;
	const channel = await client.channels.fetch(channelId).catch(() => null);
	if (!channel) {
		logger.warn(`Channel ${channelId} not found.`, {
			label: 'reaction-role refresh',
		});
		return;
	}

	const message = await channel.messages.fetch(messageId).catch(() => null);
	if (!message) {
		logger.warn(`Message ${messageId} not found.`, {
			label: 'reaction-role refresh',
		});
		return;
	}

	const updatedContainer = buildReactionRoleComponents(
		reactionRoles,
		container,
	);
	await message.edit({
		components: [updatedContainer],
		flags: MessageFlags.IsComponentsV2,
	});
}

module.exports = {
	buildLayoutContainer,
	buildPanelEmbed,
	buildReactionRoleComponents,
	refreshPanelMessage,
	refreshReactionRoleMessage,
};
