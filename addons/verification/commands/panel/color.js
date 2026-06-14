/**
 * @namespace: addons/verification/commands/panel/color.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');

const { BaseCommand } = require('kythia-core');

class ColorCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('color')
			.setDescription('Set the color of the verification panel')
			.addStringOption((o) =>
				o
					.setName('hex')
					.setDescription('HEX color code (e.g. #ff0000)')
					.setRequired(true),
			);

	async execute(interaction) {
		const container = this.container;
		const { models, helpers, kythiaConfig } = container;
		const { simpleContainer } = helpers.discord;
		const { VerificationConfig } = models;
		const guildId = interaction.guild.id;

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		let hex = interaction.options.getString('hex').trim();
		if (!/^#?[0-9A-Fa-f]{6}$/.test(hex)) {
			const comps = await simpleContainer(
				interaction,
				'❌ Invalid HEX color format. Example: `#ff0000`',
				{ color: 'Red' },
			);
			return interaction.editReply({
				components: comps,
				flags: MessageFlags.IsComponentsV2,
			});
		}
		if (!hex.startsWith('#')) hex = `#${hex}`;

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

		panelConfig.color = hex;
		config.panelConfig = JSON.stringify(panelConfig);
		await config.save();

		const comps = await simpleContainer(
			interaction,
			`✅ Panel color updated to **${hex}**! Use \`/verify panel send\` to deploy it.`,
			{ color: kythiaConfig.bot.color },
		);
		return interaction.editReply({
			components: comps,
			flags: MessageFlags.IsComponentsV2,
		});
	}
}

exports.default = ColorCommand;
