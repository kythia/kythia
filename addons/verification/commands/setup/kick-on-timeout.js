/**
 * @namespace: addons/verification/commands/setup/kick-on-timeout.js
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
			.setName('kick-on-timeout')
			.setDescription('Kick member if they time out')
			.addBooleanOption((o) =>
				o.setName('enabled').setDescription('Enable?').setRequired(true),
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

		config.kickOnTimeout = interaction.options.getBoolean('enabled');
		await config.save();

		const desc = await t(interaction, 'verify.setup.kick.timeout.success', {
			status: config.kickOnTimeout ? 'enabled' : 'disabled',
		});
		const components = await simpleContainer(interaction, desc, {
			color: kythiaConfig.bot.color,
		});
		return interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	},
};
