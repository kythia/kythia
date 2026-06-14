/**
 * @namespace: addons/verification/commands/panel/button.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');

const { BaseCommand } = require('kythia-core');

class ButtonCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('button')
			.setDescription('Set the text on the verification panel button')
			.addStringOption((o) =>
				o
					.setName('label')
					.setDescription('Button text (e.g. Verify Me)')
					.setRequired(true),
			);

	async execute(interaction) {
		const container = this.container;
		const { models, helpers, kythiaConfig } = container;
		const { simpleContainer } = helpers.discord;
		const { VerificationConfig } = models;
		const guildId = interaction.guild.id;

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const [config] = await VerificationConfig.findOrCreateCache({
			where: { guildId },
			defaults: { guildId },
		});

		let panelConfig = {};
		if (config.panelConfig) {
			try {
				panelConfig = JSON.parse(config.panelConfig);
			} catch {}
		}

		panelConfig.buttonText = interaction.options.getString('label');
		config.panelConfig = JSON.stringify(panelConfig);
		await config.save();

		const comps = await simpleContainer(
			interaction,
			'✅ Panel button text updated successfully! Use `/verify panel send` to deploy it.',
			{ color: kythiaConfig.bot.color },
		);
		return interaction.editReply({
			components: comps,
			flags: MessageFlags.IsComponentsV2,
		});
	}
}

exports.default = ButtonCommand;
