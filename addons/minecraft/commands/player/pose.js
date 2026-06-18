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
const { BaseCommand } = require('kythia-core');
const {
	CROP_CHOICES,
	RENDER_TYPES,
	SKIN_API_BASE,
	USERNAME_REGEX,
	RENDER_CHOICES_1,
} = require('../../helpers/constants');
class PoseCommand extends BaseCommand {
	subcommand = true;
	slashCommand = (subcommand) =>
		subcommand
			.setName('pose')
			.setDescription('Render a player in any Starlight Skins pose')
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
			);
	async execute(interaction) {
		const container = this.container;
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
					await t(interaction, 'minecraft.player.pose.title_md', {
						player: playerName,
						pose: poseLabel,
						crop,
					}),
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
	}
}
exports.default = PoseCommand;
