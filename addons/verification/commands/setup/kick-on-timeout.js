/**
 * @namespace: addons/verification/commands/setup/kick-on-timeout.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');

const { BaseCommand } = require('kythia-core');

class KickOnTimeoutCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('kick-on-timeout')
			.setDescription('Kick member if they time out')
			.addBooleanOption((option) =>
				option.setName('enabled').setDescription('Enable?').setRequired(true),
			);

	async execute(interaction) {
		const container = this.container;
		const { models, helpers, kythiaConfig, t } = container;
		const { simpleContainer } = helpers.discord;
		const { VerificationConfig } = models;
		const guildId = interaction.guild.id;

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const [config] = await VerificationConfig.findOrCreateCache({
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
	}
}

exports.default = KickOnTimeoutCommand;
