/**
 * @namespace: addons/reaction-role/commands/panel/create.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ContainerBuilder,
	MessageFlags,
	SeparatorBuilder,
	SeparatorSpacingSize,
	TextDisplayBuilder,
} = require('discord.js');

module.exports = {
	subcommand: true,
	slashCommand: (subcommand) =>
		subcommand
			.setName('create')
			.setDescription(
				'➕ Create a new reaction role panel (interactive setup).',
			),

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { kythiaConfig, helpers } = container;
		const { convertColor } = helpers.color;

		const accentColor = convertColor(kythiaConfig.bot.color, {
			from: 'hex',
			to: 'decimal',
		});

		const setupButton = new ButtonBuilder()
			.setCustomId('rr-panel-setup-show')
			.setLabel('Setup Reaction Role Panel')
			.setStyle(ButtonStyle.Primary)
			.setEmoji('🎭');

		const setupContainer = new ContainerBuilder()
			.setAccentColor(accentColor)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					'## 🎭 Reaction Role Panel Setup\n\nClick the button below to create a new reaction role panel.\n\n**What is a panel?**\nA panel is a message that users can react to in order to receive roles. You can set up two modes:\n- **Post Embed** — the bot posts a new embed to a channel you choose.\n- **Use Message ID** — the bot attaches reactions to an existing message.',
				),
			)
			.addSeparatorComponents(
				new SeparatorBuilder()
					.setSpacing(SeparatorSpacingSize.Small)
					.setDivider(true),
			)
			.addActionRowComponents(
				new ActionRowBuilder().addComponents(setupButton),
			);

		await interaction.reply({
			components: [setupContainer],
			flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
		});
	},
};
