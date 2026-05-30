/**
 * @namespace: addons/minecraft/commands/player/pose.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	MessageFlags,
	ContainerBuilder,
	SeparatorBuilder,
	TextDisplayBuilder,
	MediaGalleryBuilder,
	SeparatorSpacingSize,
	MediaGalleryItemBuilder,
} = require('discord.js');

const SKIN_API_BASE = 'https://starlightskins.lunareclipse.studio/render';

// Map each render type → its valid crops (first = default)
const RENDER_TYPES = {
	default: ['full', 'bust', 'face'],
	marching: ['full', 'bust', 'face'],
	walking: ['full', 'bust', 'face'],
	crouching: ['full', 'bust', 'face'],
	crossed: ['full', 'bust', 'face'],
	criss_cross: ['full', 'bust', 'face'],
	ultimate: ['full', 'bust', 'face'],
	isometric: ['full', 'bust', 'face', 'head'],
	head: ['full'],
	custom: ['full', 'bust', 'face'],
	cheering: ['full', 'bust', 'face'],
	relaxing: ['full', 'bust', 'face'],
	trudging: ['full', 'bust', 'face'],
	cowering: ['full', 'bust', 'face'],
	pointing: ['full', 'bust', 'face'],
	lunging: ['full', 'bust', 'face'],
	dungeons: ['full', 'bust', 'face'],
	facepalm: ['full', 'bust', 'face'],
	sleeping: ['full', 'bust'],
	dead: ['full', 'bust', 'face'],
	archer: ['full', 'bust', 'face'],
	kicking: ['full', 'bust', 'face'],
	mojavatar: ['full', 'bust'],
	reading: ['full', 'bust', 'face'],
	high_ground: ['full', 'bust', 'face'],
};

// Discord max is 25 choices — split into two groups
const RENDER_CHOICES_1 = [
	{ name: 'Default', value: 'default' },
	{ name: 'Marching', value: 'marching' },
	{ name: 'Walking', value: 'walking' },
	{ name: 'Crouching', value: 'crouching' },
	{ name: 'Crossed', value: 'crossed' },
	{ name: 'Criss Cross', value: 'criss_cross' },
	{ name: 'Ultimate', value: 'ultimate' },
	{ name: 'Isometric', value: 'isometric' },
	{ name: 'Head', value: 'head' },
	{ name: 'Custom', value: 'custom' },
	{ name: 'Cheering', value: 'cheering' },
	{ name: 'Relaxing', value: 'relaxing' },
	{ name: 'Trudging', value: 'trudging' },
	{ name: 'Cowering', value: 'cowering' },
	{ name: 'Pointing', value: 'pointing' },
	{ name: 'Lunging', value: 'lunging' },
	{ name: 'Dungeons', value: 'dungeons' },
	{ name: 'Facepalm', value: 'facepalm' },
	{ name: 'Sleeping', value: 'sleeping' },
	{ name: 'Dead', value: 'dead' },
	{ name: 'Archer', value: 'archer' },
	{ name: 'Kicking', value: 'kicking' },
	{ name: 'Mojavatar', value: 'mojavatar' },
	{ name: 'Reading', value: 'reading' },
	{ name: 'High Ground', value: 'high_ground' },
];

const CROP_CHOICES = [
	{ name: 'Full Body', value: 'full' },
	{ name: 'Bust', value: 'bust' },
	{ name: 'Face', value: 'face' },
	{ name: 'Head', value: 'head' },
	{ name: 'Default', value: 'default' },
	{ name: 'Processed', value: 'processed' },
	{ name: 'Barebones', value: 'barebones' },
];

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,16}$/;

module.exports = {
	subcommand: true,
	slashCommand: (subcommand) =>
		subcommand
			.setName('pose')
			.setDescription('🎭 Render a player in any Starlight Skins pose')
			.addStringOption((option) =>
				option
					.setName('player')
					.setDescription('Minecraft player name or UUID')
					.setRequired(true)
					.setMinLength(3)
					.setMaxLength(36),
			)
			.addStringOption((option) =>
				option
					.setName('pose')
					.setDescription('Render type — choose from poses 1–25')
					.setRequired(true)
					.addChoices(...RENDER_CHOICES_1),
			)
			.addStringOption((option) =>
				option
					.setName('crop')
					.setDescription('Crop type (auto-selects best if omitted)')
					.setRequired(false)
					.addChoices(...CROP_CHOICES),
			),

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { t, kythiaConfig, helpers } = container;

		const playerName = interaction.options.getString('player');
		const pose = interaction.options.getString('pose');
		const renderType = pose;
		const requestedCrop = interaction.options.getString('crop');

		const validCrops = RENDER_TYPES[renderType];
		if (!validCrops) {
			return interaction.reply({
				content: `❌ Unknown render type \`${renderType}\`. Use \`/minecraft player info\` to see all available poses.`,
				flags: MessageFlags.Ephemeral,
			});
		}

		// Use requested crop if valid for this render type, otherwise auto-pick the first valid crop
		const crop =
			requestedCrop && validCrops.includes(requestedCrop)
				? requestedCrop
				: validCrops[0];

		// UUID passthrough — don't validate UUIDs with USERNAME_REGEX
		const isUuid = playerName.length > 16;
		if (!isUuid && !USERNAME_REGEX.test(playerName)) {
			return interaction.reply({
				content: await t(
					interaction,
					'minecraft.player.errors.invalid_username',
				),
				flags: MessageFlags.Ephemeral,
			});
		}

		const imageUrl = `${SKIN_API_BASE}/${renderType}/${encodeURIComponent(playerName)}/${crop}`;

		const accentColor = helpers.color.convertColor(kythiaConfig.bot.color, {
			from: 'hex',
			to: 'decimal',
		});

		// Build a readable label – e.g. "criss_cross" → "Criss Cross"
		const poseLabel = renderType
			.replace(/_/g, ' ')
			.replace(/\b\w/g, (c) => c.toUpperCase());

		const responseContainer = new ContainerBuilder()
			.setAccentColor(accentColor)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					`## ${playerName} — ${poseLabel}\n-# Crop: ${crop}`,
				),
			)
			.addSeparatorComponents(
				new SeparatorBuilder()
					.setSpacing(SeparatorSpacingSize.Small)
					.setDivider(true),
			)
			.addMediaGalleryComponents(
				new MediaGalleryBuilder().addItems([
					new MediaGalleryItemBuilder().setURL(imageUrl),
				]),
			)
			.addSeparatorComponents(
				new SeparatorBuilder()
					.setSpacing(SeparatorSpacingSize.Small)
					.setDivider(true),
			)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					await t(interaction, 'common.container.footer', {
						username: interaction.client.user.username,
					}),
				),
			);

		return interaction.reply({
			components: [responseContainer],
			flags: MessageFlags.IsComponentsV2,
		});
	},
};
