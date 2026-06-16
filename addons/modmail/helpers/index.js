/**
 * @namespace: addons/modmail/helpers/index.js
 * @type: Helper Script
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	ChannelType,
	MessageFlags,
	ContainerBuilder,
	TextDisplayBuilder,
	SeparatorBuilder,
	SeparatorSpacingSize,
	MediaGalleryBuilder,
	MediaGalleryItemBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	AttachmentBuilder,
	FileBuilder,
} = require('discord.js');

// ─────────────────────────────────────────────────────────────────────────────
// Internal utilities
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Truncates a string to a given max length, appending "…" if needed.
 * @param {string} str
 * @param {number} max
 * @returns {string}
 */
function truncate(str, max = 100) {
	if (!str) return '';
	return str.length > max ? `${str.slice(0, max - 1)}…` : str;
}

// ─────────────────────────────────────────────────────────────────────────────
// processAttachments
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Downloads and categorizes attachments from a Discord message.
 * Returns:
 *   - imageUrls: CDN URLs for image attachments (used in MediaGallery)
 *   - fileBuilders: AttachmentBuilder instances for non-image files (re-uploaded)
 *   - fileSummary: plain-text summary for transcript
 *
 * @param {import('discord.js').Collection} attachments
 * @returns {Promise<{ imageUrls: string[], fileEntries: Array<{builder: AttachmentBuilder, fileComponent: FileBuilder}>, fileSummary: string }>}
 */
async function processAttachments(attachments) {
	const imageUrls = [];
	const fileEntries = [];
	let fileSummary = '';
	if (!attachments || attachments.size === 0) {
		return {
			imageUrls,
			fileEntries,
			fileSummary,
		};
	}
	const IMAGE_TYPES = [
		'image/png',
		'image/jpeg',
		'image/jpg',
		'image/gif',
		'image/webp',
		'image/svg+xml',
	];
	for (const attachment of attachments.values()) {
		const contentType = attachment.contentType || '';
		const isImage =
			IMAGE_TYPES.some((t) => contentType.startsWith(t)) ||
			/\.(png|jpg|jpeg|gif|webp|svg)$/i.test(attachment.name);
		if (isImage) {
			// Images: use CDN URL directly in MediaGallery (no download needed)
			imageUrls.push(attachment.url);
			fileSummary += `\n[Image: ${attachment.url}]`;
		} else {
			// Non-image files: download and re-upload so they're properly forwarded
			try {
				const res = await fetch(attachment.url);
				if (!res.ok) throw new Error(`HTTP ${res.status}`);
				const buffer = Buffer.from(await res.arrayBuffer());
				const builder = new AttachmentBuilder(buffer).setName(attachment.name);
				const fileComponent = new FileBuilder()
					.setURL(`attachment://${attachment.name}`)
					.setSpoiler(false);
				fileEntries.push({
					builder,
					fileComponent,
				});
				fileSummary += `\n[File: ${attachment.name} — ${attachment.url}]`;
			} catch (_e) {
				// If download fails, fall back to URL in text
				fileSummary += `\n[File (unavailable): ${attachment.url}]`;
			}
		}
	}
	return {
		imageUrls,
		fileEntries,
		fileSummary,
	};
}

// ─────────────────────────────────────────────────────────────────────────────
// Container builder helper
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Builds a styled modmail ContainerBuilder.
 * @param {number} accentColor
 * @param {string} titleMarkdown - e.g. "## 📬 New Modmail"
 * @param {string} body - main body text
 * @param {string} footer - footer text
 * @param {import('discord.js').ActionRowBuilder|null} actionRow
 * @returns {ContainerBuilder}
 */
function buildModmailContainer(
	accentColor,
	titleMarkdown,
	body,
	footer,
	actionRow = null,
) {
	const container = new ContainerBuilder()
		.setAccentColor(accentColor)
		.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(titleMarkdown),
		)
		.addSeparatorComponents(
			new SeparatorBuilder()
				.setSpacing(SeparatorSpacingSize.Small)
				.setDivider(true),
		)
		.addTextDisplayComponents(new TextDisplayBuilder().setContent(body));
	if (actionRow) {
		container.addSeparatorComponents(
			new SeparatorBuilder()
				.setSpacing(SeparatorSpacingSize.Small)
				.setDivider(false),
		);
		container.addActionRowComponents(actionRow);
	}
	container
		.addSeparatorComponents(
			new SeparatorBuilder()
				.setSpacing(SeparatorSpacingSize.Small)
				.setDivider(true),
		)
		.addTextDisplayComponents(new TextDisplayBuilder().setContent(footer));
	return container;
}

// ─────────────────────────────────────────────────────────────────────────────
// createModmailThread
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creates a new modmail thread in the inbox channel, sends the opening container,
 * optionally notifies staff, and saves the Modmail record to the database.
 *
 * @param {import('discord.js').User} user - The user who initiated the modmail
 * @param {string} guildId - Target guild ID
 * @param {string} initialContent - The first DM message content
 * @param {import('discord.js').Collection} attachments - Attachments from first DM
 * @param {object} container - Kythia DI container
 * @returns {Promise<import('./').Modmail|null>} The created Modmail record
 */
async function createModmailThread(
	user,
	guildId,
	initialContent,
	attachments,
	container,
) {
	const { models, t, kythiaConfig, helpers, logger, client } = container;
	const { Modmail, ModmailConfig } = models;
	const { convertColor } = helpers.color;
	try {
		const config = await ModmailConfig.getCache({
			guildId,
		});
		if (!config) return null;
		const guild = await client.container.helpers.discord.getGuildSafe(
			client,
			guildId,
		);
		if (!guild) return null;
		const inboxChannel = await helpers.discord.getChannelSafe(
			guild,
			config.inboxChannelId,
		);
		if (!inboxChannel) return null;

		// Create a private thread named "modmail-{username}" in the inbox channel
		const safeName =
			user.username
				.toLowerCase()
				.replace(/[^a-z0-9]/g, '')
				.slice(0, 12) || 'user';
		const threadName = `modmail-${safeName}`;
		const thread = await inboxChannel.threads.create({
			name: threadName,
			type: ChannelType.PrivateThread,
			invitable: false,
		});
		const accentColor = convertColor(kythiaConfig.bot.color, {
			from: 'hex',
			to: 'decimal',
		});
		const fakeInteraction = {
			client,
			locale: kythiaConfig.bot.locale || 'en-US',
		};

		// ─── Opening container inside the thread (staff-side) ───────────────
		const titleText = await t(fakeInteraction, 'modmail.thread.open_title');
		const userInfoText = await t(fakeInteraction, 'modmail.thread.user_info', {
			userId: user.id,
			username: user.username,
			tag: user.tag,
			createdAt: `<t:${Math.floor(user.createdTimestamp / 1000)}:D>`,
		});
		const footerText = await t(fakeInteraction, 'common.container.footer', {
			username: kythiaConfig.bot.name,
		});
		const closeRow = new ActionRowBuilder().addComponents(
			new ButtonBuilder()
				.setCustomId('mm-close')
				.setLabel(await t(fakeInteraction, 'modmail.thread.close_button'))
				.setStyle(ButtonStyle.Secondary)
				.setEmoji('🔒'),
		);
		const openContainer = buildModmailContainer(
			accentColor,
			await t(fakeInteraction, 'modmail.thread.open_title_md', {
				title: titleText,
			}),
			userInfoText,
			footerText,
			closeRow,
		);
		await thread.send({
			components: [openContainer],
			flags: MessageFlags.IsComponentsV2,
		});

		// ─── Relay the first user message into the thread ────────────────────
		const { imageUrls: openImageUrls, fileEntries: openFileEntries } =
			await processAttachments(attachments);
		const receivedTitle = await t(
			fakeInteraction,
			'modmail.relay.received_title',
		);
		const fromLine = await t(fakeInteraction, 'modmail.relay.received_from', {
			userId: user.id,
			username: user.username,
		});
		const firstMsgCard = new ContainerBuilder()
			.setAccentColor(accentColor)
			.addTextDisplayComponents(
				await t(fakeInteraction, 'modmail.relay.received_title_md', {
					title: receivedTitle,
					user: fromLine,
				}),
			)
			.addSeparatorComponents(
				new SeparatorBuilder()
					.setSpacing(SeparatorSpacingSize.Small)
					.setDivider(true),
			);
		if (initialContent) {
			firstMsgCard.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(initialContent),
			);
		}
		if (openImageUrls.length > 0) {
			firstMsgCard.addMediaGalleryComponents(
				new MediaGalleryBuilder().addItems(
					openImageUrls.map((url) => new MediaGalleryItemBuilder().setURL(url)),
				),
			);
		}
		for (const { fileComponent } of openFileEntries) {
			firstMsgCard.addFileComponents(fileComponent);
		}
		firstMsgCard
			.addSeparatorComponents(
				new SeparatorBuilder()
					.setSpacing(SeparatorSpacingSize.Small)
					.setDivider(true),
			)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(footerText),
			);
		await thread.send({
			components: [firstMsgCard],
			files: openFileEntries.map((e) => e.builder),
			flags: MessageFlags.IsComponentsV2,
			allowedMentions: {
				parse: [],
			},
		});

		// ─── Notify staff role if configured ────────────────────────────────
		if (config.staffRoleId && config.pingStaff) {
			await thread.send({
				content: `<@&${config.staffRoleId}>`,
				allowedMentions: {
					roles: [config.staffRoleId],
				},
			});
		}

		// ─── Send greeting DM to user ───────────────────────────────────────
		const greetingText =
			config.greetingMessage ||
			(await t(fakeInteraction, 'modmail.dm.greeting'));

		// Use custom greeting color if set, else fall back to bot color
		const greetingAccent = config.greetingColor
			? parseInt(config.greetingColor.replace('#', ''), 16)
			: accentColor;
		try {
			const greetingCard = new ContainerBuilder().setAccentColor(
				greetingAccent,
			);

			// Optional banner image at the top
			if (config.greetingImage) {
				greetingCard.addMediaGalleryComponents(
					new MediaGalleryBuilder().addItems(
						new MediaGalleryItemBuilder().setURL(config.greetingImage),
					),
				);
				greetingCard.addSeparatorComponents(
					new SeparatorBuilder()
						.setSpacing(SeparatorSpacingSize.Small)
						.setDivider(true),
				);
			}
			greetingCard
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(greetingText),
				)
				.addSeparatorComponents(
					new SeparatorBuilder()
						.setSpacing(SeparatorSpacingSize.Small)
						.setDivider(true),
				)
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(
						await t(fakeInteraction, 'common.container.footer', {
							username: kythiaConfig.bot.name,
						}),
					),
				);
			await user.send({
				components: [greetingCard],
				flags: MessageFlags.IsComponentsV2,
			});
		} catch (_e) {
			logger.warn(
				`Could not send greeting DM to ${user.username} — DMs may be closed.`,
				{
					label: 'modmail',
				},
			);
		}

		// ─── Save to DB ──────────────────────────────────────────────────────
		const modmail = await Modmail.create({
			guildId,
			userId: user.id,
			threadChannelId: thread.id,
			status: 'open',
			openedAt: Date.now(),
		});
		return modmail;
	} catch (error) {
		logger.error(
			`[modmail:helpers:create-thread] Error: ${error.message || String(error)}`,
			{
				label: 'modmail:helpers:create-thread',
			},
		);
		return null;
	}
}

// ─────────────────────────────────────────────────────────────────────────────
// relayUserMessage
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Relays a DM message from the user into the modmail thread using Components V2.
 * Supports images (inline MediaGallery) and files (re-uploaded FileBuilder).
 * Also reacts ✅ to the user's DM as delivery confirmation.
 *
 * @param {import('discord.js').Message} message - The DM message
 * @param {object} modmail - The Modmail DB record
 * @param {object} container - Kythia DI container
 */
async function relayUserMessage(message, modmail, container) {
	const { t, logger, client, kythiaConfig, helpers } = container;
	const { convertColor } = helpers.color;
	// const { simpleContainer } = helpers.discord;

	try {
		const thread = await client.container.helpers.discord.getChannelGlobalSafe(
			client,
			modmail.threadChannelId,
		);
		if (!thread) return;
		const fakeInteraction = {
			client,
			locale: kythiaConfig.bot.locale || 'en-US',
		};
		const accentColor = convertColor(kythiaConfig.bot.color, {
			from: 'hex',
			to: 'decimal',
		});
		const footerText = await t(fakeInteraction, 'common.container.footer', {
			username: kythiaConfig.bot.name,
		});
		const bodyText = message.content?.trim() || '';

		// ── Process attachments ───────────────────────────────────────────────
		const { imageUrls, fileEntries } = await processAttachments(
			message.attachments,
		);
		const receivedTitle = await t(
			fakeInteraction,
			'modmail.relay.received_title',
		);
		const fromLine = await t(fakeInteraction, 'modmail.relay.received_from', {
			userId: message.author.id,
			username: message.author.username,
		});
		const headerText = await t(
			fakeInteraction,
			'modmail.relay.received_title_md',
			{ title: receivedTitle, user: fromLine },
		);
		const threadCard = new ContainerBuilder()
			.setAccentColor(accentColor)
			.addTextDisplayComponents(new TextDisplayBuilder().setContent(headerText))
			.addSeparatorComponents(
				new SeparatorBuilder()
					.setSpacing(SeparatorSpacingSize.Small)
					.setDivider(true),
			);
		if (bodyText) {
			threadCard.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(bodyText),
			);
		}

		// Add images inline
		if (imageUrls.length > 0) {
			threadCard.addMediaGalleryComponents(
				new MediaGalleryBuilder().addItems(
					imageUrls.map((url) => new MediaGalleryItemBuilder().setURL(url)),
				),
			);
		}

		// Add non-image files inline
		for (const { fileComponent } of fileEntries) {
			threadCard.addFileComponents(fileComponent);
		}
		threadCard
			.addSeparatorComponents(
				new SeparatorBuilder()
					.setSpacing(SeparatorSpacingSize.Small)
					.setDivider(true),
			)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(footerText),
			);
		await thread.send({
			components: [threadCard],
			files: fileEntries.map((e) => e.builder),
			flags: MessageFlags.IsComponentsV2,
			allowedMentions: {
				parse: [],
			},
		});

		// ── Send "Message Sent" confirmation card to user ──────────────────────
		try {
			const sentTitle = await t(fakeInteraction, 'modmail.relay.sent_title');
			const sentCard = new ContainerBuilder()
				.setAccentColor(accentColor)
				.addTextDisplayComponents(
					await t(fakeInteraction, 'modmail.relay.sent_title_md', {
						title: sentTitle,
						user: message.author.username,
					}),
				)
				.addSeparatorComponents(
					new SeparatorBuilder()
						.setSpacing(SeparatorSpacingSize.Small)
						.setDivider(true),
				)
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(
						bodyText || '*(attachment only)*',
					),
				);

			// Show images inline in confirmation too (same as thread card)
			if (imageUrls.length > 0) {
				sentCard.addMediaGalleryComponents(
					new MediaGalleryBuilder().addItems(
						imageUrls.map((url) => new MediaGalleryItemBuilder().setURL(url)),
					),
				);
			}
			sentCard
				.addSeparatorComponents(
					new SeparatorBuilder()
						.setSpacing(SeparatorSpacingSize.Small)
						.setDivider(true),
				)
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(footerText),
				);
			await message.author.send({
				components: [sentCard],
				flags: MessageFlags.IsComponentsV2,
			});
		} catch (_e) {}
	} catch (error) {
		logger.error(`relayUserMessage failed: ${error.message || error}`, {
			label: 'modmail',
		});
	}
}

// ─────────────────────────────────────────────────────────────────────────────
// relayStaffReply
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Sends a staff reply to the user's DMs and mirrors it in the thread.
 * If anonymous, the username is replaced with "Staff".
 *
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 * @param {string} content - Reply content
 * @param {boolean} anonymous - Whether to hide the staff member's identity
 * @param {object} container - Kythia DI container
 */
async function relayStaffReply(interaction, content, anonymous, container) {
	const { models, t, helpers, kythiaConfig, logger } = container;
	const { Modmail } = models;
	const { simpleContainer } = helpers.discord;
	const { convertColor } = helpers.color;
	try {
		const modmail = await Modmail.getCache({
			threadChannelId: interaction.channel.id,
			status: 'open',
		});
		if (!modmail) {
			const desc = await t(interaction, 'modmail.errors.not_a_modmail');
			return interaction.reply({
				components: await simpleContainer(interaction, desc, {
					color: 'Red',
				}),
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			});
		}
		const displayName = anonymous
			? await t(interaction, 'modmail.reply.anonymous_name')
			: interaction.user.username;
		const accentColor = convertColor(kythiaConfig.bot.color, {
			from: 'hex',
			to: 'decimal',
		});
		const footerText = await t(interaction, 'common.container.footer', {
			username: kythiaConfig.bot.name,
		});

		// ─── DM the user ────────────────────────────────────────────────────
		const dmTitleKey = anonymous
			? 'modmail.dm.staff_reply_anon'
			: 'modmail.dm.staff_reply';
		const dmTitle = await t(interaction, dmTitleKey, {
			name: displayName,
		});
		const dmContainer = buildModmailContainer(
			accentColor,
			await t(interaction, 'modmail.dm.title_md', { title: dmTitle }),
			content,
			footerText,
		);
		let dmSent = false;
		try {
			const user = await helpers.discord.getUserSafe(
				interaction.client,
				modmail.userId,
			);
			await user.send({
				components: [dmContainer],
				flags: MessageFlags.IsComponentsV2,
			});
			dmSent = true;
		} catch (_e) {
			dmSent = false;
		}

		// ─── Mirror in thread ────────────────────────────────────────────────
		const threadTag = anonymous
			? await t(interaction, 'modmail.relay.anon_reply_prefix')
			: await t(interaction, 'modmail.relay.staff_reply_prefix', {
					userId: interaction.user.id,
				});
		await interaction.channel.send({
			content: `${threadTag}\n${content}`,
			allowedMentions: {
				parse: [],
			},
		});

		// ─── Ack to staff ────────────────────────────────────────────────────
		const ackKey = dmSent ? 'modmail.reply.success' : 'modmail.reply.dm_failed';
		const ackDesc = await t(interaction, ackKey);
		return interaction.reply({
			components: await simpleContainer(interaction, ackDesc, {
				color: dmSent ? 'Green' : 'Yellow',
			}),
			flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
		});
	} catch (error) {
		logger.error(
			`[modmail:helpers:relay-staff-reply] Error: ${error.message || String(error)}`,
			{
				label: 'modmail:helpers:relay-staff-reply',
			},
		);
		const descError = await t(interaction, 'modmail.errors.generic');
		if (interaction.replied || interaction.deferred) {
			return interaction.followUp({
				components: await simpleContainer(interaction, descError, {
					color: 'Red',
				}),
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			});
		}
		return interaction.reply({
			components: await simpleContainer(interaction, descError, {
				color: 'Red',
			}),
			flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
		});
	}
}

// ─────────────────────────────────────────────────────────────────────────────
// relayGuildReply
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Called when a staff member types directly in a modmail thread.
 * - Sends a Components V2 "Message Sent" card in the thread (with author info)
 * - Sends a Components V2 "Reply from X" card to the user's DMs
 * - If anonymous = true, shows "Staff" instead of the real name
 *
 * @param {import('discord.js').Message} message - The original (now deleted) guild message
 * @param {object} modmail - The Modmail DB record
 * @param {boolean} anonymous - Whether to hide the sender's identity
 * @param {string} content - Message text content
 * @param {object} container - Kythia DI container
 * @param {import('discord.js').Client} client - Discord client
 */
async function relayGuildReply(
	message,
	modmail,
	anonymous,
	content,
	container,
	client,
) {
	const { t, helpers, kythiaConfig, logger } = container;
	const { convertColor } = helpers.color;
	const accentColor = convertColor(kythiaConfig.bot.color, {
		from: 'hex',
		to: 'decimal',
	});
	const fakeInteraction = {
		client,
		locale: kythiaConfig.bot.locale || 'en-US',
	};
	const footerText = await t(fakeInteraction, 'common.container.footer', {
		username: kythiaConfig.bot.name,
	});
	const displayName = anonymous
		? await t(fakeInteraction, 'modmail.reply.anonymous_name')
		: message.author.username;

	// Build attachment components
	const { imageUrls, fileEntries } = await processAttachments(
		message.attachments,
	);
	const bodyText = content || '';

	// ── Thread card: "Message Sent" ──────────────────────────────────────────
	const threadTitle = await t(
		fakeInteraction,
		'modmail.guild_reply.sent_title',
	);
	const sentByLine = anonymous
		? await t(fakeInteraction, 'modmail.guild_reply.sent_by_anon')
		: await t(fakeInteraction, 'modmail.guild_reply.sent_by', {
				userId: message.author.id,
				username: message.author.username,
			});
	const threadCard = new ContainerBuilder()
		.setAccentColor(accentColor)
		.addTextDisplayComponents(
			await t(fakeInteraction, 'modmail.guild_reply.sent_title_md', {
				title: threadTitle,
				user: sentByLine,
			}),
		)
		.addSeparatorComponents(
			new SeparatorBuilder()
				.setSpacing(SeparatorSpacingSize.Small)
				.setDivider(true),
		);
	if (bodyText) {
		threadCard.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(bodyText),
		);
	}
	if (imageUrls.length > 0) {
		threadCard.addMediaGalleryComponents(
			new MediaGalleryBuilder().addItems(
				imageUrls.map((url) => new MediaGalleryItemBuilder().setURL(url)),
			),
		);
	}
	for (const { fileComponent } of fileEntries) {
		threadCard.addFileComponents(fileComponent);
	}
	threadCard
		.addSeparatorComponents(
			new SeparatorBuilder()
				.setSpacing(SeparatorSpacingSize.Small)
				.setDivider(true),
		)
		.addTextDisplayComponents(new TextDisplayBuilder().setContent(footerText));
	try {
		await message.channel.send({
			components: [threadCard],
			files: fileEntries.map((e) => e.builder),
			flags: MessageFlags.IsComponentsV2,
			allowedMentions: {
				parse: [],
			},
		});
	} catch (err) {
		logger.error(
			`relayGuildReply: failed to send thread card: ${err.message || err}`,
			{
				label: 'modmail',
			},
		);
	}

	// ── DM card: "Reply from X" ──────────────────────────────────────────────
	const dmTitleKey = anonymous
		? 'modmail.dm.staff_reply_anon'
		: 'modmail.dm.staff_reply';
	const dmTitle = await t(fakeInteraction, dmTitleKey, {
		name: displayName,
	});
	const dmCard = new ContainerBuilder()
		.setAccentColor(accentColor)
		.addTextDisplayComponents(
			await t(fakeInteraction, 'modmail.dm.title_user_md', {
				title: dmTitle,
				user: displayName,
			}),
		)
		.addSeparatorComponents(
			new SeparatorBuilder()
				.setSpacing(SeparatorSpacingSize.Small)
				.setDivider(true),
		);
	if (bodyText) {
		dmCard.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(bodyText),
		);
	}
	if (imageUrls.length > 0) {
		dmCard.addMediaGalleryComponents(
			new MediaGalleryBuilder().addItems(
				imageUrls.map((url) => new MediaGalleryItemBuilder().setURL(url)),
			),
		);
	}
	// For files in DM: re-upload the same buffers (fileEntries already downloaded)
	// We need fresh builders since Discord consumes them
	const dmFileEntries = await processAttachments(message.attachments);
	for (const { fileComponent } of dmFileEntries.fileEntries) {
		dmCard.addFileComponents(fileComponent);
	}
	dmCard
		.addSeparatorComponents(
			new SeparatorBuilder()
				.setSpacing(SeparatorSpacingSize.Small)
				.setDivider(true),
		)
		.addTextDisplayComponents(new TextDisplayBuilder().setContent(footerText));
	try {
		const user = await client.container.helpers.discord.getUserSafe(
			client,
			modmail.userId,
		);
		await user.send({
			components: [dmCard],
			files: dmFileEntries.fileEntries.map((e) => e.builder),
			flags: MessageFlags.IsComponentsV2,
		});
	} catch (_e) {
		// User DMs closed: add a note in the thread
		const failNote = await t(fakeInteraction, 'modmail.errors.dm_closed');
		await message.channel
			.send({
				components: [
					new ContainerBuilder()
						.setAccentColor(0xffa500)
						.addTextDisplayComponents(
							new TextDisplayBuilder().setContent(failNote),
						),
				],
				flags: MessageFlags.IsComponentsV2,
			})
			.catch(() => {});
	}
}

// ─────────────────────────────────────────────────────────────────────────────
// createTranscript
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generates a plain-text transcript of a modmail thread.
 * @param {import('discord.js').ThreadChannel} thread
 * @param {object} container - Kythia DI container
 * @returns {Promise<string>}
 */
async function createTranscript(thread, container) {
	const { kythiaConfig } = container;
	const locale = kythiaConfig.bot.locale || 'en-US';
	const timezone = kythiaConfig.bot.timezone || 'UTC';
	const collection = [];
	let lastId = null;
	let loop = true;
	const MAX_MESSAGES = 5000;
	while (loop) {
		const options = {
			limit: 100,
		};
		if (lastId) options.before = lastId;
		const messages = await container.helpers.discord.getMessageSafe(
			thread,
			options,
		);
		if (messages.size === 0) break;
		collection.push(...messages.values());
		lastId = messages.last().id;
		if (collection.length >= MAX_MESSAGES) loop = false;
	}
	const sorted = collection.sort(
		(a, b) => a.createdTimestamp - b.createdTimestamp,
	);
	let text = `=============== KYTHIA'S MODMAIL FEATURE ===============\n\n`;
	text += `THREAD: ${thread.name}\n`;
	text += `SERVER: ${thread.guild.name}\n`;
	text += `GENERATED AT: ${new Date().toLocaleString(locale, {
		timeZone: timezone,
	})}\n`;
	text += `TOTAL MESSAGES: ${sorted.length}\n`;
	text += `======================================================\n\n`;
	sorted.forEach((msg) => {
		const time = msg.createdAt.toLocaleString(locale, {
			timeZone: timezone,
		});
		const author = msg.author?.tag ?? 'System';
		let content = msg.content || '';
		if (msg.attachments.size > 0) {
			const urls = msg.attachments
				.map((a) => `[Attachment: ${a.url}]`)
				.join(' ');
			content = content ? `${content} ${urls}` : urls;
		}
		if (!content && msg.embeds.length > 0)
			content = '[Message contains Embeds]';
		if (!content && msg.components.length > 0)
			content = '[Message contains Components]';
		if (!content) content = '[System Message]';
		text += `[${time}] ${author}: ${content}\n`;
	});
	return text;
}

// ─────────────────────────────────────────────────────────────────────────────
// closeModmail
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Handles full modmail closing:
 * 1. Generates transcript and sends to transcript channel
 * 2. Posts a log entry to the logs channel
 * 3. Sends a closing DM to the user (optional closing message)
 * 4. Marks the DB record as closed
 * 5. Deletes (archives) the thread
 *
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 * @param {object} container - Kythia DI container
 * @param {string|null} reason - Closing reason
 */
async function closeModmail(interaction, container, reason = null) {
	const { models, t, helpers, kythiaConfig, logger } = container;
	const { Modmail, ModmailConfig } = models;
	const { simpleContainer, getChannelSafe } = helpers.discord;
	const { convertColor } = helpers.color;
	try {
		const modmail = await Modmail.getCache({
			threadChannelId: interaction.channel.id,
			status: 'open',
		});
		if (!modmail) {
			const desc = await t(interaction, 'modmail.errors.not_a_modmail');
			if (interaction.replied || interaction.deferred) {
				return interaction.followUp({
					components: await simpleContainer(interaction, desc, {
						color: 'Red',
					}),
					flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
				});
			}
			return interaction.reply({
				components: await simpleContainer(interaction, desc, {
					color: 'Red',
				}),
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			});
		}
		const config = await ModmailConfig.getCache({
			guildId: modmail.guildId,
		});
		if (!config) {
			const desc = await t(interaction, 'modmail.errors.config_missing');
			if (interaction.replied || interaction.deferred) {
				return interaction.followUp({
					components: await simpleContainer(interaction, desc, {
						color: 'Red',
					}),
					flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
				});
			}
			return interaction.reply({
				components: await simpleContainer(interaction, desc, {
					color: 'Red',
				}),
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			});
		}

		// Defer early so we don't time out while processing transcript
		if (!interaction.replied && !interaction.deferred) {
			await interaction.reply({
				content: await t(interaction, 'modmail.close.thinking'),
				flags: MessageFlags.Ephemeral,
			});
		}
		const accentColor = convertColor(kythiaConfig.bot.color, {
			from: 'hex',
			to: 'decimal',
		});

		// ─── Generate transcript ─────────────────────────────────────────────
		const transcriptText = await createTranscript(
			interaction.channel,
			container,
		);
		const filename = `modmail-transcript-${modmail.id}.txt`;
		const transcriptBuffer = Buffer.from(transcriptText, 'utf-8');
		const attachment = new AttachmentBuilder(transcriptBuffer).setName(
			filename,
		);
		const fileComponent = new FileBuilder()
			.setURL(`attachment://${filename}`)
			.setSpoiler(false);

		// ─── Send transcript ─────────────────────────────────────────────────
		const transcriptChannel = config.transcriptChannelId
			? await getChannelSafe(interaction.guild, config.transcriptChannelId)
			: null;
		if (transcriptChannel) {
			const transcriptTitle = await t(interaction, 'modmail.transcript.title', {
				modmailId: modmail.id,
			});
			const transcriptUserLine = await t(
				interaction,
				'modmail.transcript.user',
				{
					userId: modmail.userId,
				},
			);
			const footerText = await t(interaction, 'common.container.footer', {
				username: kythiaConfig.bot.name,
			});
			const transcriptContainer = new ContainerBuilder()
				.setAccentColor(accentColor)
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(transcriptTitle),
				)
				.addSeparatorComponents(
					new SeparatorBuilder()
						.setSpacing(SeparatorSpacingSize.Small)
						.setDivider(true),
				)
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(transcriptUserLine),
				)
				.addFileComponents(fileComponent)
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(footerText),
				);
			await transcriptChannel.send({
				components: [transcriptContainer],
				files: [attachment],
				flags: MessageFlags.IsComponentsV2,
				allowedMentions: {
					parse: [],
				},
			});
		}

		// ─── Send log entry ──────────────────────────────────────────────────
		const logsChannel = config.logsChannelId
			? await getChannelSafe(interaction.guild, config.logsChannelId)
			: null;
		if (logsChannel) {
			const logDesc = await t(interaction, 'modmail.close.log_message', {
				modmailId: modmail.id,
				userId: modmail.userId,
				openedAt: `<t:${Math.floor(modmail.openedAt / 1000)}:R>`,
				closerId: interaction.user.id,
				reason: reason || 'No reason specified',
			});
			await logsChannel.send({
				components: await simpleContainer(interaction, logDesc),
				flags: MessageFlags.IsComponentsV2,
				allowedMentions: {
					parse: [],
				},
			});
		}

		// ─── DM closing message to user ──────────────────────────────────────
		const closingText =
			config.closingMessage ||
			(await t(interaction, 'modmail.dm.closing_message'));

		// Use custom closing color if set, else fall back to bot color
		const closingAccent = config.closingColor
			? parseInt(config.closingColor.replace('#', ''), 16)
			: accentColor;
		try {
			const user = await helpers.discord.getUserSafe(
				interaction.client,
				modmail.userId,
			);
			const closingCard = new ContainerBuilder().setAccentColor(closingAccent);

			// Optional banner image at the top
			if (config.closingImage) {
				closingCard.addMediaGalleryComponents(
					new MediaGalleryBuilder().addItems(
						new MediaGalleryItemBuilder().setURL(config.closingImage),
					),
				);
				closingCard.addSeparatorComponents(
					new SeparatorBuilder()
						.setSpacing(SeparatorSpacingSize.Small)
						.setDivider(true),
				);
			}
			const fakeInteraction = {
				client: interaction.client,
				locale: kythiaConfig.bot.locale || 'en-US',
			};
			closingCard
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(closingText),
				)
				.addSeparatorComponents(
					new SeparatorBuilder()
						.setSpacing(SeparatorSpacingSize.Small)
						.setDivider(true),
				)
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(
						await t(fakeInteraction, 'common.container.footer', {
							username: kythiaConfig.bot.name,
						}),
					),
				);
			await user.send({
				components: [closingCard],
				flags: MessageFlags.IsComponentsV2,
			});
		} catch (_e) {
			logger.warn(`Could not send closing DM to userId ${modmail.userId}`, {
				label: 'modmail',
			});
		}

		// ─── Update DB record ────────────────────────────────────────────────
		modmail.status = 'closed';
		modmail.closedAt = Date.now();
		modmail.closedByUserId = interaction.user.id;
		modmail.closedReason = reason;
		await modmail.save();

		// ─── Release AI collision guard for this user ────────────────────────
		// Now that the modmail is closed, DMs from this user can go to AI again
		interaction.client.modmailActiveDMs?.delete(modmail.userId);

		// ─── Delete (archive) thread ─────────────────────────────────────────
		await interaction.channel.delete();
	} catch (error) {
		logger.error(
			`[modmail:helpers:close-modmail] Error: ${error.message || String(error)}`,
			{
				label: 'modmail:helpers:close-modmail',
			},
		);
		const descError = await t(interaction, 'modmail.errors.close_failed');
		if (!interaction.replied && !interaction.deferred) {
			return interaction.reply({
				components: await simpleContainer(interaction, descError, {
					color: 'Red',
				}),
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			});
		}
		return interaction.followUp({
			components: await simpleContainer(interaction, descError, {
				color: 'Red',
			}),
			flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
		});
	}
}

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────

module.exports = {
	buildModmailContainer,
	createModmailThread,
	relayUserMessage,
	relayStaffReply,
	relayGuildReply,
	createTranscript,
	closeModmail,
	truncate,
};
