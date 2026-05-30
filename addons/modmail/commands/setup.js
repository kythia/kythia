/**
 * @namespace: addons/modmail/commands/setup.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	MessageFlags,
	ContainerBuilder,
	TextDisplayBuilder,
	SeparatorBuilder,
	SeparatorSpacingSize,
	MediaGalleryBuilder,
	MediaGalleryItemBuilder,
} = require('discord.js');

/** Validate a hex color string like #RRGGBB or #RGB */
function isValidHex(str) {
	return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(str.trim());
}

/** Convert a hex string to decimal (for ContainerBuilder.setAccentColor) */
function hexToDecimal(hex) {
	return parseInt(hex.replace('#', ''), 16);
}

module.exports = {
	subcommand: true,
	slashCommand: (subcommand) =>
		subcommand
			.setName('setup')
			.setDescription('Configure the modmail system for this server.')
			// ── Required ──────────────────────────────────────────────────────
			.addChannelOption((option) =>
				option
					.setName('inbox_channel')
					.setDescription('The channel where modmail threads will be created.')
					.setRequired(true),
			)
			// ── Core options ──────────────────────────────────────────────────
			.addRoleOption((option) =>
				option
					.setName('staff_role')
					.setDescription('Role that will be pinged for new modmail tickets.')
					.setRequired(false),
			)
			.addChannelOption((option) =>
				option
					.setName('logs_channel')
					.setDescription('Channel to post close/action logs.')
					.setRequired(false),
			)
			.addChannelOption((option) =>
				option
					.setName('transcript_channel')
					.setDescription(
						'Channel where transcripts are saved when a modmail is closed.',
					)
					.setRequired(false),
			)
			.addBooleanOption((option) =>
				option
					.setName('ping_staff')
					.setDescription(
						'Whether to ping the staff role when a new modmail opens. (default: true)',
					)
					.setRequired(false),
			)
			// ── Message text ──────────────────────────────────────────────────
			.addStringOption((option) =>
				option
					.setName('greeting_message')
					.setDescription(
						'DM sent to users when they open a modmail. Leave blank for default.',
					)
					.setRequired(false)
					.setMaxLength(1000),
			)
			.addStringOption((option) =>
				option
					.setName('closing_message')
					.setDescription(
						'DM sent to users when their modmail is closed. Leave blank for default.',
					)
					.setRequired(false)
					.setMaxLength(1000),
			)
			// ── Card customization ────────────────────────────────────────────
			.addStringOption((option) =>
				option
					.setName('greeting_color')
					.setDescription(
						'Accent color for the opening DM card (hex, e.g. #5865F2). Blank = bot default.',
					)
					.setRequired(false)
					.setMaxLength(7),
			)
			.addStringOption((option) =>
				option
					.setName('greeting_image')
					.setDescription(
						'Banner image URL shown at the top of the opening DM card.',
					)
					.setRequired(false)
					.setMaxLength(512),
			)
			.addStringOption((option) =>
				option
					.setName('closing_color')
					.setDescription(
						'Accent color for the closing DM card (hex, e.g. #FF5555). Blank = bot default.',
					)
					.setRequired(false)
					.setMaxLength(7),
			)
			.addStringOption((option) =>
				option
					.setName('closing_image')
					.setDescription(
						'Banner image URL shown at the top of the closing DM card.',
					)
					.setRequired(false)
					.setMaxLength(512),
			),

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { models, t, helpers, kythiaConfig, logger } = container;
		const { ModmailConfig } = models;
		const { simpleContainer } = helpers.discord;
		const { convertColor } = helpers.color;

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		try {
			// ── Read options ──────────────────────────────────────────────────
			const inboxChannel = interaction.options.getChannel('inbox_channel');
			const staffRole = interaction.options.getRole('staff_role');
			const logsChannel = interaction.options.getChannel('logs_channel');
			const transcriptChannel =
				interaction.options.getChannel('transcript_channel');
			const pingStaff = interaction.options.getBoolean('ping_staff') ?? true;
			const greetingMessage =
				interaction.options.getString('greeting_message') || null;
			const closingMessage =
				interaction.options.getString('closing_message') || null;

			const rawGreetingColor =
				interaction.options.getString('greeting_color') || null;
			const greetingImage =
				interaction.options.getString('greeting_image') || null;
			const rawClosingColor =
				interaction.options.getString('closing_color') || null;
			const closingImage =
				interaction.options.getString('closing_image') || null;

			// ── Validate hex colors ───────────────────────────────────────────
			if (rawGreetingColor && !isValidHex(rawGreetingColor)) {
				const errMsg = await t(interaction, 'modmail.setup.invalid_color', {
					field: 'greeting_color',
				});
				return interaction.editReply({
					components: await simpleContainer(interaction, errMsg, {
						color: 'Red',
					}),
					flags: MessageFlags.IsComponentsV2,
				});
			}
			if (rawClosingColor && !isValidHex(rawClosingColor)) {
				const errMsg = await t(interaction, 'modmail.setup.invalid_color', {
					field: 'closing_color',
				});
				return interaction.editReply({
					components: await simpleContainer(interaction, errMsg, {
						color: 'Red',
					}),
					flags: MessageFlags.IsComponentsV2,
				});
			}

			const greetingColor = rawGreetingColor?.trim() || null;
			const closingColor = rawClosingColor?.trim() || null;

			// ── Save to DB ────────────────────────────────────────────────────
			const existing = await ModmailConfig.getCache({
				guildId: interaction.guild.id,
			});

			const data = {
				guildId: interaction.guild.id,
				inboxChannelId: inboxChannel.id,
				staffRoleId: staffRole?.id || null,
				logsChannelId: logsChannel?.id || null,
				transcriptChannelId: transcriptChannel?.id || null,
				pingStaff,
				greetingMessage,
				closingMessage,
				greetingColor,
				greetingImage,
				closingColor,
				closingImage,
			};

			if (existing) {
				Object.assign(existing, data);
				await existing.save();
			} else {
				await ModmailConfig.create({
					...data,
					blockedUserIds: [],
					snippets: {},
				});
			}

			// ── Build success card ────────────────────────────────────────────
			// The success card uses the greeting_color as accent (preview)
			const previewColor = greetingColor
				? hexToDecimal(greetingColor)
				: convertColor(kythiaConfig.bot.color, { from: 'hex', to: 'decimal' });
			const footerText = await t(interaction, 'common.container.footer', {
				username: kythiaConfig.bot.name,
			});

			const lines = [
				`📥 **Inbox:** <#${inboxChannel.id}>`,
				staffRole ? `👥 **Staff Role:** <@&${staffRole.id}>` : null,
				logsChannel ? `📋 **Logs:** <#${logsChannel.id}>` : null,
				transcriptChannel
					? `📄 **Transcripts:** <#${transcriptChannel.id}>`
					: null,
				`🔔 **Ping Staff:** ${pingStaff ? 'Yes' : 'No'}`,
				greetingMessage ? `💬 **Greeting:** Custom message set` : null,
				closingMessage ? `👋 **Closing:** Custom message set` : null,
				greetingColor ? `🎨 **Open Color:** \`${greetingColor}\`` : null,
				greetingImage ? `🖼️ **Open Image:** Set` : null,
				closingColor ? `🎨 **Close Color:** \`${closingColor}\`` : null,
				closingImage ? `🖼️ **Close Image:** Set` : null,
				'',
				await t(interaction, 'modmail.setup.info'),
			]
				.filter(Boolean)
				.join('\n');

			const card = new ContainerBuilder().setAccentColor(previewColor);

			// Show greeting image as a preview if provided
			if (greetingImage) {
				card.addMediaGalleryComponents(
					new MediaGalleryBuilder().addItems(
						new MediaGalleryItemBuilder().setURL(greetingImage),
					),
				);
				card.addSeparatorComponents(
					new SeparatorBuilder()
						.setSpacing(SeparatorSpacingSize.Small)
						.setDivider(true),
				);
			}

			card
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(
						await t(interaction, 'modmail.setup.success_title'),
					),
				)
				.addSeparatorComponents(
					new SeparatorBuilder()
						.setSpacing(SeparatorSpacingSize.Small)
						.setDivider(true),
				)
				.addTextDisplayComponents(new TextDisplayBuilder().setContent(lines))
				.addSeparatorComponents(
					new SeparatorBuilder()
						.setSpacing(SeparatorSpacingSize.Small)
						.setDivider(true),
				)
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(footerText),
				);

			return interaction.editReply({
				components: [card],
				flags: MessageFlags.IsComponentsV2,
			});
		} catch (error) {
			logger.error(`setup command failed: ${error.message || error}`, {
				label: 'modmail',
			});
			const desc = await t(interaction, 'modmail.errors.generic');
			return interaction.editReply({
				components: await simpleContainer(interaction, desc, { color: 'Red' }),
				flags: MessageFlags.IsComponentsV2,
			});
		}
	},
};
