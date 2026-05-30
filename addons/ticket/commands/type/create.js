/**
 * @namespace: addons/ticket/commands/type/create.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	MessageFlags,
	ButtonBuilder,
	ButtonStyle,
	ActionRowBuilder,
	ContainerBuilder,
	SeparatorBuilder,
	TextDisplayBuilder,
	SeparatorSpacingSize,
} = require('discord.js');

module.exports = {
	subcommand: true,
	slashCommand: (subcommand) =>
		subcommand
			.setName('create')
			.setDescription('Creates a new ticket type (interactive setup)'),

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { t, kythiaConfig, helpers } = container;
		const { convertColor } = helpers.color;

		const accentColor = convertColor(kythiaConfig.bot.color, {
			from: 'hex',
			to: 'decimal',
		});

		const startButton = new ButtonBuilder()
			.setCustomId('tkt-type-step1-show')
			.setLabel(await t(interaction, 'ticket.type.start_button'))
			.setStyle(ButtonStyle.Primary)
			.setEmoji('🎟️');

		const components = [
			new ContainerBuilder()
				.setAccentColor(accentColor)
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(
						await t(interaction, 'ticket.type.start_title'),
					),
				)
				// .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(
						await t(interaction, 'ticket.type.start_desc'),
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
	},
};
