/**
 * @namespace: addons/ticket/helpers/index.js
 * @type: Helper Script
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	ChannelType,
	PermissionsBitField,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ContainerBuilder,
	TextDisplayBuilder,
	SeparatorBuilder,
	SeparatorSpacingSize,
	StringSelectMenuBuilder,
	MessageFlags,
	FileBuilder,
	AttachmentBuilder,
	MediaGalleryBuilder,
	MediaGalleryItemBuilder,
} = require('discord.js');
const TICKET_STYLE_THREAD = 'thread';
function getSafeEmoji(emoji, fallback = '🎫') {
	if (!emoji || typeof emoji !== 'string') return fallback;
	const cleanEmoji = emoji.trim();
	if (cleanEmoji.length === 0) return fallback;
	const customEmojiRegex = /^<a?:.+?:\d{17,20}>$/;
	if (customEmojiRegex.test(cleanEmoji)) {
		return cleanEmoji;
	}
	try {
		const unicodeEmojiRegex = /\p{Extended_Pictographic}/u;
		if (unicodeEmojiRegex.test(cleanEmoji)) {
			return cleanEmoji;
		}
	} catch (_e) {
		const oldSchoolRegex =
			/(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/;
		if (oldSchoolRegex.test(cleanEmoji)) {
			return cleanEmoji;
		}
	}
	return fallback;
}

/**
 * Refreshes the ticket panel message with current ticket types and translations.
 * @param {string} panelMessageId
 * @param {object} container - Dependency injection container (models, config, helpers, etc)
 */

async function refreshTicketPanel(panelMessageId, container) {
	const { models, kythiaConfig, helpers, t, logger } = container;
	const { TicketPanel, TicketConfig } = models;
	const { convertColor } = helpers.color;
	const fakeInteraction = {
		client: container.client,
	};
	try {
		const panel = await TicketPanel.getCache({
			messageId: panelMessageId,
		});
		if (!panel)
			throw new Error(`Panel with messageId ${panelMessageId} not found.`);
		const allTypes = await TicketConfig.getAllCache({
			panelMessageId,
		});
		const accentColor = convertColor(kythiaConfig.bot.color, {
			from: 'hex',
			to: 'decimal',
		});
		const placeholder = await t(
			fakeInteraction,
			'ticket.panel.select_placeholder',
		);
		const description =
			panel.description ||
			(await t(fakeInteraction, 'ticket.panel.default_desc'));
		const panelContainer = new ContainerBuilder()
			.setAccentColor(accentColor)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					await t(fakeInteraction, 'ticket.helpers.panel_title_md', {
						title: panel.title,
					}),
				),
			)
			.addSeparatorComponents(
				new SeparatorBuilder()
					.setSpacing(SeparatorSpacingSize.Small)
					.setDivider(true),
			)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(description),
			)
			.addSeparatorComponents(
				new SeparatorBuilder()
					.setSpacing(SeparatorSpacingSize.Small)
					.setDivider(true),
			);
		if (
			panel.image &&
			(panel.image.startsWith('http://') || panel.image.startsWith('https://'))
		) {
			panelContainer.addMediaGalleryComponents(
				new MediaGalleryBuilder().addItems([
					new MediaGalleryItemBuilder().setURL(panel.image),
				]),
			);
			panelContainer.addSeparatorComponents(
				new SeparatorBuilder()
					.setSpacing(SeparatorSpacingSize.Small)
					.setDivider(true),
			);
		}
		if (!allTypes || allTypes.length === 0) {
			panelContainer.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					await t(fakeInteraction, 'ticket.panel.no_types'),
				),
			);
		} else {
			let actionRow;
			if (allTypes.length === 1) {
				const type = allTypes[0];
				const safeEmoji = getSafeEmoji(type.typeEmoji);
				actionRow = new ActionRowBuilder().addComponents(
					new ButtonBuilder()
						.setCustomId(`ticket-create:${type.id}`)
						.setLabel(type.typeName.slice(0, 80))
						.setStyle(ButtonStyle.Secondary)
						.setEmoji(safeEmoji),
				);
			} else {
				const options = allTypes.map((type) => ({
					label: type.typeName.slice(0, 100),
					value: type.id.toString(),
					emoji: getSafeEmoji(type.typeEmoji),
				}));
				actionRow = new ActionRowBuilder().addComponents(
					new StringSelectMenuBuilder()
						.setCustomId('ticket-select')
						.setPlaceholder(placeholder.slice(0, 150))
						.setOptions(options),
				);
			}
			panelContainer.addActionRowComponents(actionRow);
		}
		panelContainer.addSeparatorComponents(
			new SeparatorBuilder()
				.setSpacing(SeparatorSpacingSize.Small)
				.setDivider(true),
		);
		panelContainer.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				await t(fakeInteraction, 'common.container.footer', {
					username: kythiaConfig.bot.name,
				}),
			),
		);
		const channel = await helpers.discord.getChannelSafe(
			container.client,
			panel.channelId,
		);
		if (!channel) throw new Error(`Channel ${panel.channelId} not found.`);
		const message = await helpers.discord.getMessageSafe(
			channel,
			panel.messageId,
		);
		if (!message) throw new Error(`Message ${panel.messageId} not found.`);
		await message.edit({
			components: [panelContainer],
			flags: MessageFlags.IsComponentsV2,
		});
	} catch (error) {
		logger.error(
			`REFRESH PANEL FAILED (${panelMessageId}): ${error.message || error}`,
			{
				label: 'core:helpers:ticket:refresh-ticket-panel',
			},
		);
	}
}

/**
 * Creates a ticket channel after checking for existing tickets and sends an informational container.
 * @param {object} interaction - Interaction object
 * @param {object} ticketConfig - Ticket config entry
 * @param {object} container - Dependency injection object
 */
async function createTicketChannel(
	interaction,
	ticketConfig,
	container,
	reason = null,
) {
	const { models, t, kythiaConfig, helpers, logger } = container;
	const { Ticket } = models;
	const { simpleContainer } = helpers.discord;
	const { convertColor } = helpers.color;
	try {
		const existingTicket = await Ticket.getCache({
			userId: interaction.user.id,
			guildId: interaction.guild.id,
			ticketConfigId: ticketConfig.id,
			status: 'open',
		});
		if (existingTicket) {
			const desc = await t(interaction, 'ticket.errors.already_open', {
				channelId: existingTicket.channelId,
			});
			return interaction.reply({
				components: await simpleContainer(interaction, desc, {
					color: 'Red',
				}),
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			});
		}
		const username = interaction.user.username
			.toLowerCase()
			.replace(/[^a-z0-9]/g, '')
			.slice(0, 8);
		const ticketName = `${ticketConfig.typeName.toLowerCase().replace(/\s+/g, '-')}-${username}`;

		// ─── Determine ticket style: channel (default) or thread ───
		const style = ticketConfig.ticketStyle || 'channel';
		let ticketChannel;
		if (style === TICKET_STYLE_THREAD) {
			// Thread style: create a private thread inside the designated parent channel
			const parentChannel = await helpers.discord.getChannelSafe(
				interaction.guild,
				ticketConfig.ticketThreadChannelId,
			);
			if (!parentChannel) {
				const desc = await t(
					interaction,
					'ticket.errors.thread_channel_required',
				);
				return interaction.reply({
					components: await simpleContainer(interaction, desc, {
						color: 'Red',
					}),
					flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
				});
			}
			ticketChannel = await parentChannel.threads.create({
				name: ticketName,
				type: ChannelType.PrivateThread,
				invitable: false,
			});

			// Add the ticket opener to the private thread
			await ticketChannel.members.add(interaction.user.id);
		} else {
			// Channel style (default): create a new guild text channel
			ticketChannel = await interaction.guild.channels.create({
				name: ticketName,
				type: ChannelType.GuildText,
				parent: ticketConfig.ticketCategoryId || null,
				permissionOverwrites: [
					{
						id: interaction.guild.id,
						type: 0,
						// OverwriteType.Role
						deny: [PermissionsBitField.Flags.ViewChannel],
					},
					{
						id: interaction.user.id,
						type: 1,
						// OverwriteType.Member
						allow: [PermissionsBitField.Flags.ViewChannel],
					},
					...(ticketConfig.staffRoleId
						? [
								{
									id: ticketConfig.staffRoleId,
									type: 0,
									// OverwriteType.Role
									allow: [PermissionsBitField.Flags.ViewChannel],
								},
							]
						: []),
				],
			});
		}
		const defaultMessage = await t(
			interaction,
			'ticket.v2.open_message_default',
			{
				user: interaction.user.toString(),
				staffRoleId: ticketConfig.staffRoleId,
			},
		);
		const openMessageRaw = ticketConfig.ticketOpenMessage || defaultMessage;
		const openMessage = openMessageRaw
			.replace('{user}', interaction.user.toString())
			.replace(
				'{staffRole}',
				ticketConfig.staffRoleId ? `<@&${ticketConfig.staffRoleId}>` : '',
			);
		const accentColor = convertColor(kythiaConfig.bot.color, {
			from: 'hex',
			to: 'decimal',
		});
		const mainContainer = new ContainerBuilder()
			.setAccentColor(accentColor)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					await t(interaction, 'ticket.helpers.type_title_md', {
						typeName: ticketConfig.typeName,
					}),
				),
			)
			.addSeparatorComponents(
				new SeparatorBuilder()
					.setSpacing(SeparatorSpacingSize.Small)
					.setDivider(true),
			);
		if (ticketConfig.ticketOpenImage) {
			mainContainer.addMediaGalleryComponents(
				new MediaGalleryBuilder().addItems(
					new MediaGalleryItemBuilder().setURL(ticketConfig.ticketOpenImage),
				),
			);
			mainContainer.addSeparatorComponents(
				new SeparatorBuilder()
					.setSpacing(SeparatorSpacingSize.Small)
					.setDivider(true),
			);
		}
		const closeButton = new ActionRowBuilder().addComponents(
			new ButtonBuilder()
				.setCustomId('ticket-close')
				.setLabel(await t(interaction, 'ticket.v2.close_button'))
				.setStyle(ButtonStyle.Secondary)
				.setEmoji('🔒'),
			new ButtonBuilder()
				.setCustomId('ticket-claim')
				.setLabel(await t(interaction, 'ticket.v2.claim_button'))
				.setStyle(ButtonStyle.Secondary)
				.setEmoji('🛄'),
		);
		const footerText = await t(interaction, 'common.container.footer', {
			username: interaction.client.user.username,
		});
		mainContainer.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(openMessage),
		);
		if (reason != null) {
			mainContainer.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					await t(interaction, 'ticket.v2.reason_field', {
						reason: reason,
					}),
				),
			);
			mainContainer.addSeparatorComponents(
				new SeparatorBuilder()
					.setSpacing(SeparatorSpacingSize.Small)
					.setDivider(true),
			);
		}
		mainContainer.addActionRowComponents(closeButton);
		mainContainer.addSeparatorComponents(
			new SeparatorBuilder()
				.setSpacing(SeparatorSpacingSize.Small)
				.setDivider(true),
		);
		mainContainer.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(footerText),
		);
		await ticketChannel.send({
			components: [mainContainer],
			allowedMentions: {
				parse: [],
			},
			flags: MessageFlags.IsComponentsV2,
		});
		await Ticket.create({
			guildId: interaction.guild.id,
			userId: interaction.user.id,
			channelId: ticketChannel.id,
			ticketConfigId: ticketConfig.id,
			status: 'open',
			openedAt: Date.now(),
		});
		const descSuccess = await t(interaction, 'ticket.create.success', {
			ticketChannel: ticketChannel.toString(),
		});
		await interaction.reply({
			components: await simpleContainer(interaction, descSuccess, {
				color: 'Green',
			}),
			flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
		});
	} catch (error) {
		logger.error(
			`Error in createTicketChannel helper: ${error.message || error}`,
			{
				label: 'core:helpers:ticket:create-ticket-channel',
			},
		);
		const descError = await t(interaction, 'ticket.errors.create_failed');
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({
				components: await simpleContainer(interaction, descError, {
					color: 'Red',
				}),
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			});
		} else {
			await interaction.reply({
				components: await simpleContainer(interaction, descError, {
					color: 'Red',
				}),
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			});
		}
	}
}

/**
 * Generates a transcript text file for a ticket channel.
 * Fetches all messages using pagination logic.
 * @param {object} channel - Discord channel object
 * @param {object} container - Dependency injection (for config)
 * @returns {Promise<string>}
 */
async function createTicketTranscript(channel, container) {
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
		if (lastId) {
			options.before = lastId;
		}
		const messages = await container.helpers.discord.getMessageSafe(
			channel,
			options,
		);
		if (messages.size === 0) {
			loop = false;
			break;
		}
		collection.push(...messages.values());
		lastId = messages.last().id;
		if (collection.length >= MAX_MESSAGES) {
			loop = false;
		}
	}
	const sortedMessages = collection.sort(
		(a, b) => a.createdTimestamp - b.createdTimestamp,
	);
	let transcriptText = '';
	transcriptText += `=============== KYTHIA'S TICKET FEATURE ===============\n\n`;
	transcriptText += `TRANSCRIPT FOR: ${channel.name}\n`;
	transcriptText += `SERVER: ${channel.guild.name}\n`;
	transcriptText += `GENERATED AT: ${new Date().toLocaleString(locale, {
		timeZone: timezone,
	})}\n`;
	transcriptText += `TOTAL MESSAGES: ${sortedMessages.length}\n`;
	transcriptText += `=======================================================\n\n`;
	sortedMessages.forEach((msg) => {
		const time = msg.createdAt.toLocaleString(locale, {
			timeZone: timezone,
		});
		const author = msg.author.tag;
		let content = msg.content;
		if (msg.attachments.size > 0) {
			const attachmentUrls = msg.attachments
				.map((a) => `[Attachment: ${a.url}]`)
				.join(' ');
			content = content ? `${content} ${attachmentUrls}` : attachmentUrls;
		}
		if (!content && msg.embeds.length > 0) {
			content = '[Message contains Embeds]';
		}
		if (!content) content = '[System Message/Sticker]';
		transcriptText += `[${time}] ${author}: ${content}\n`;
	});
	return transcriptText;
}

/**
 * Closes the ticket, creates a transcript, logs actions, and deletes the channel.
 * @param {object} interaction - Interaction object
 * @param {object} container - Dependency injection (models, etc)
 * @param {string | null} reason - The reason for closing (jika ada)
 */
async function closeTicket(interaction, container, reason = null) {
	const { models, t, helpers, kythiaConfig, logger } = container;
	const { Ticket, TicketConfig } = models;
	const { simpleContainer, getChannelSafe } = helpers.discord;
	const { convertColor } = helpers.color;
	try {
		const ticket = await Ticket.getCache({
			channelId: interaction.channel.id,
			status: 'open',
		});
		if (!ticket) {
			const desc = await t(interaction, 'ticket.errors.not_a_ticket');
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
		const ticketConfig = await TicketConfig.getCache({
			id: ticket.ticketConfigId,
		});
		if (!ticketConfig) {
			const desc = await t(interaction, 'ticket.errors.config_missing');
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
		const logsChannel = await getChannelSafe(
			interaction.guild,
			ticketConfig.logsChannelId,
		);
		const transcriptChannel = await getChannelSafe(
			interaction.guild,
			ticketConfig.transcriptChannelId,
		);
		if (!transcriptChannel) {
			const desc = await t(
				interaction,
				'ticket.errors.transcript_channel_missing',
				{
					channelId: ticketConfig.transcriptChannelId,
				},
			);
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
		if (!interaction.replied && !interaction.deferred) {
			await interaction.reply({
				content: await t(interaction, 'ticket.close.thinking'),
				flags: MessageFlags.Ephemeral,
			});
		}
		const transcriptText = await createTicketTranscript(
			interaction.channel,
			container,
		);
		const filename = `transcript-${ticket.id}.txt`;
		const transcriptBuffer = Buffer.from(transcriptText, 'utf-8');
		const accentColor = convertColor(kythiaConfig.bot.color, {
			from: 'hex',
			to: 'decimal',
		});
		const title = await t(interaction, 'ticket.transcript.title', {
			ticketId: ticket.id,
			typeName: ticketConfig.typeName,
		});
		const userLine = await t(interaction, 'ticket.transcript.user', {
			userId: ticket.userId,
		});
		const footerText = await t(interaction, 'common.container.footer', {
			username: interaction.client.user.username,
		});
		const attachment = new AttachmentBuilder(transcriptBuffer)
			.setName(filename)
			.setDescription(/* ... */);
		const fileComponent = new FileBuilder()
			.setURL(`attachment://${filename}`)
			.setSpoiler(false);
		const v2Components = [
			new ContainerBuilder()
				.setAccentColor(accentColor)
				.addTextDisplayComponents(new TextDisplayBuilder().setContent(title))
				.addSeparatorComponents(
					new SeparatorBuilder()
						.setSpacing(SeparatorSpacingSize.Small)
						.setDivider(true),
				)
				.addTextDisplayComponents(new TextDisplayBuilder().setContent(userLine))
				.addFileComponents(fileComponent)
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(footerText),
				),
		];
		await transcriptChannel.send({
			components: v2Components,
			files: [attachment],
			flags: MessageFlags.IsComponentsV2,
			allowedMentions: {
				parse: [],
			},
		});
		if (logsChannel) {
			const logDesc = await t(interaction, 'ticket.v2.log_message', {
				ticketId: ticket.id,
				typeName: ticketConfig.typeName,
				userId: ticket.userId,
				openedAt: `<t:${Math.floor(ticket.openedAt / 1000)}:R>`,
				closerId: interaction.user.id,
				reason: reason ? reason : 'No Reason Specified',
			});
			await logsChannel.send({
				components: await simpleContainer(interaction, logDesc),
				allowedMentions: {
					parse: [],
				},
				flags: MessageFlags.IsComponentsV2,
			});
		}
		ticket.status = 'closed';
		ticket.closedAt = Date.now();
		ticket.closedReason = reason;
		ticket.closedByUserId = interaction.user.id;
		await ticket.save();
		await interaction.channel.delete();
	} catch (error) {
		logger.error(`Failed to close ticket: ${error.message || error}`, {
			label: 'core:helpers:ticket:close-ticket',
		});
		const descError = await t(interaction, 'ticket.errors.close_failed');
		if (!interaction.replied && !interaction.deferred) {
			await interaction.reply({
				components: await simpleContainer(interaction, descError, {
					color: 'Red',
				}),
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			});
		} else {
			await interaction.followUp({
				components: await simpleContainer(interaction, descError, {
					color: 'Red',
				}),
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			});
		}
	}
}
module.exports = {
	refreshTicketPanel,
	createTicketChannel,
	createTicketTranscript,
	closeTicket,
};
