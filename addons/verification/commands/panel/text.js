/**
 * @namespace: addons/verification/commands/panel/text.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');

const { BaseCommand } = require('kythia-core');

class TextCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('text')
			.setDescription(
				'Set the title and description for the verification panel',
			)
			.addStringOption((o) =>
				o.setName('title').setDescription('Panel title').setRequired(true),
			)
			.addStringOption((o) =>
				o
					.setName('description')
					.setDescription('Panel description')
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

		panelConfig.title = interaction.options.getString('title');
		panelConfig.description = interaction.options.getString('description');
		config.panelConfig = JSON.stringify(panelConfig);
		await config.save();

		const comps = await simpleContainer(
			interaction,
			'✅ Panel text updated successfully! Use `/verify panel send` to deploy it.',
			{ color: kythiaConfig.bot.color },
		);
		return interaction.editReply({
			components: comps,
			flags: MessageFlags.IsComponentsV2,
		});
	}
}

exports.default = TextCommand;
