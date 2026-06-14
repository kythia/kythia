/**
 * @namespace: addons/verification/commands/setup/welcome-message.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');

const { BaseCommand } = require('kythia-core');

class WelcomeMessageCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('welcome-message')
			.setDescription('DM sent to members after they verify')
			.addStringOption((o) =>
				o
					.setName('message')
					.setDescription('Welcome message text (or "none" to disable)')
					.setRequired(true),
			);

	async execute(interaction) {
		const container = this.container;
		const { models, helpers, kythiaConfig, t } = container;
		const { simpleContainer } = helpers.discord;
		const { VerificationConfig } = models;
		const guildId = interaction.guild.id;

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const [config] = await VerificationConfig.findOrCreateWithCache({
			where: { guildId },
			defaults: { guildId },
		});

		const msg = interaction.options.getString('message');
		config.welcomeMessage = msg === 'none' ? null : msg;
		await config.save();

		const desc =
			msg === 'none'
				? await t(interaction, 'verify.setup.welcome.disabled')
				: await t(interaction, 'verify.setup.welcome.success');

		const components = await simpleContainer(interaction, desc, {
			color: kythiaConfig.bot.color,
		});
		return interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}
}

exports.default = WelcomeMessageCommand;
