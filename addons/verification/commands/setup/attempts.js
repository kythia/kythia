/**
 * @namespace: addons/verification/commands/setup/attempts.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { SlashCommandSubcommandBuilder, MessageFlags } = require('discord.js');

module.exports = {
	subcommand: true,
	slashCommand: new SlashCommandSubcommandBuilder()
		.setName('attempts')
		.setDescription('Max wrong attempts before failing')
		.addIntegerOption((o) =>
			o
				.setName('count')
				.setDescription('Max attempts (1-10)')
				.setRequired(true)
				.setMinValue(1)
				.setMaxValue(10),
		),
	async execute(interaction, container) {
		const { models, helpers, kythiaConfig, t } = container;
		const { simpleContainer } = helpers.discord;
		const { VerificationConfig } = models;
		const guildId = interaction.guild.id;

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const [config] = await VerificationConfig.findOrCreate({
			where: { guildId },
			defaults: { guildId },
		});

		const count = interaction.options.getInteger('count');
		config.maxAttempts = count;
		await config.save();

		const components = await simpleContainer(
			interaction,
			await t(interaction, 'verify.setup.attempts.success', { count: count }),
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
