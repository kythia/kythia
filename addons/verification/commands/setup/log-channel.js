/**
 * @namespace: addons/verification/commands/setup/log-channel.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');

const { BaseCommand } = require('kythia-core');

class LogChannelCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('log-channel')
			.setDescription('Channel to log verification events')
			.addChannelOption((option) =>
				option
					.setName('channel')
					.setDescription('Log channel')
					.setRequired(true),
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

		const ch = interaction.options.getChannel('channel');
		if (!ch?.isTextBased()) {
			const components = await simpleContainer(
				interaction,
				await t(interaction, 'verify.setup.log.channel.invalid'),
				{
					color: kythiaConfig.bot.color,
				},
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		config.logChannelId = ch.id;
		await config.save();

		const components = await simpleContainer(
			interaction,
			await t(interaction, 'verify.setup.log.channel.success', {
				channel: `<#${ch.id}>`,
			}),
		);
		return interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}
}

exports.default = LogChannelCommand;
