/**
 * @namespace: addons/minecraft/commands/player/skin.js
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
const { SKIN_API_BASE, USERNAME_REGEX } = require('../../helpers/constants');
class SkinCommand extends BaseCommand {
	subcommand = true;
	slashCommand = (subcommand) =>
		subcommand
			.setName('skin')
			.setDescription(
				'Shows the Minecraft: Java Edition skin of the provided player name',
			)
			.addStringOption((option) =>
				option
					.setName('player')
					.setDescription('The Minecraft Java Edition player name')
					.setRequired(true)
					.setMinLength(3)
					.setMaxLength(16),
			);
	async execute(interaction) {
		const container = this.container;
		const { t, kythiaConfig, helpers } = container;
		const playerName = interaction.options.getString('player');
		if (!USERNAME_REGEX.test(playerName)) {
			return interaction.reply({
				content: await t(
					interaction,
					'minecraft.shared.player.errors.invalid_username',
				),
				flags: MessageFlags.Ephemeral,
			});
		}
		const imageUrl = `${SKIN_API_BASE}/skin/${encodeURIComponent(playerName)}/default`;
		const accentColor = helpers.color.convertColor(kythiaConfig.bot.color, {
			from: 'hex',
			to: 'decimal',
		});
		const container_ = new ContainerBuilder()
			.setAccentColor(accentColor)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					await t(interaction, 'minecraft.commands.player.skin.title', {
						player: playerName,
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
			components: [container_],
			flags: MessageFlags.IsComponentsV2,
		});
	}
}
exports.default = SkinCommand;
