/**
 * @namespace: addons/reaction-role/commands/panel/create.js
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
	SeparatorSpacingSize,
} = require('discord.js');

const { BaseCommand } = require('kythia-core');

class CreateCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('create')
			.setDescription(
				'➕ Create a new reaction role panel (interactive setup).',
			);

	async execute(interaction) {
		const container = this.container;
		const { kythiaConfig, helpers, t } = container;
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
					await t(interaction, 'reaction-role.panel.create.intro_md'),
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
	}
}

exports.default = CreateCommand;
