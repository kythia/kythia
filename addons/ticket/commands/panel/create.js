/**
 * @namespace: addons/ticket/commands/panel/create.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	ButtonStyle,
	MessageFlags,
	ButtonBuilder,
	ActionRowBuilder,
	ContainerBuilder,
	SeparatorBuilder,
	TextDisplayBuilder,
	MediaGalleryBuilder,
	SeparatorSpacingSize,
	MediaGalleryItemBuilder,
} = require('discord.js');
const { BaseCommand } = require('kythia-core');
class CreateCommand extends BaseCommand {
	slashCommand = (subcommand) =>
		subcommand
			.setName('create')
			.setDescription('Creates a new ticket panel (interactive setup)');
	async execute(interaction) {
		const container = this.container;
		const { t, kythiaConfig, helpers } = container;
		const { convertColor } = helpers.color;
		const accentColor = convertColor(kythiaConfig.bot.color, {
			from: 'hex',
			to: 'decimal',
		});
		const startButton = new ButtonBuilder()
			.setCustomId('tkt-panel-modal-show')
			.setLabel(
				await t(interaction, 'ticket.commands.panel.create.start_button'),
			)
			.setStyle(ButtonStyle.Primary)
			.setEmoji('🎟️');
		const components = [
			new ContainerBuilder()
				.setAccentColor(accentColor)
				.addMediaGalleryComponents(
					new MediaGalleryBuilder().addItems([
						new MediaGalleryItemBuilder().setURL(
							kythiaConfig.settings.ticketBannerImage,
						),
					]),
				)
				.addSeparatorComponents(
					new SeparatorBuilder()
						.setSpacing(SeparatorSpacingSize.Small)
						.setDivider(true),
				)
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(
						await t(interaction, 'ticket.commands.panel.create.start_title'),
					),
				)
				.addSeparatorComponents(
					new SeparatorBuilder()
						.setSpacing(SeparatorSpacingSize.Small)
						.setDivider(true),
				)
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(
						await t(interaction, 'ticket.commands.panel.create.start_desc'),
					),
				)
				.addSeparatorComponents(
					new SeparatorBuilder()
						.setSpacing(SeparatorSpacingSize.Small)
						.setDivider(true),
				)
				.addActionRowComponents(
					new ActionRowBuilder().addComponents(startButton),
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
				),
		];
		await interaction.reply({
			components: components,
			flags: MessageFlags.IsComponentsV2,
		});
		return;
	}
}
exports.default = CreateCommand;
