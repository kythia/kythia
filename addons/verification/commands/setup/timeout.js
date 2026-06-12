/**
 * @namespace: addons/verification/commands/setup/timeout.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');

module.exports = {
	subcommand: true,
	slashCommand: (subcommand) =>
		subcommand
			.setName('timeout')
			.setDescription('How long members have to complete the captcha (seconds)')
			.addIntegerOption((o) =>
				o
					.setName('seconds')
					.setDescription('Timeout in seconds (30-600)')
					.setRequired(true)
					.setMinValue(30)
					.setMaxValue(600),
			),
	async execute(interaction, container) {
		const { models, helpers, kythiaConfig, t } = container;
		const { simpleContainer } = helpers.discord;
		const { VerificationConfig } = models;
		const guildId = interaction.guild.id;

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const [config] = await VerificationConfig.findOrCreateWithCache({
			where: { guildId },
			defaults: { guildId },
		});

		const secs = interaction.options.getInteger('seconds');
		config.timeoutSeconds = secs;
		await config.save();

		const components = await simpleContainer(
			interaction,
			await t(interaction, 'verify.setup.timeout.success', { seconds: secs }),
			{
				color: kythiaConfig.bot.color,
			},
		);
		return interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	},
};
