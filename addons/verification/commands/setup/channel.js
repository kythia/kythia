/**
 * @namespace: addons/verification/commands/setup/channel.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 1.0.0-rc
 */

const { SlashCommandSubcommandBuilder, MessageFlags } = require('discord.js');

module.exports = {
	subcommand: true,
	slashCommand: new SlashCommandSubcommandBuilder()
		.setName('channel')
		.setDescription('Channel where captcha is sent (leave blank for DM only)')
		.addChannelOption((o) =>
			o
				.setName('channel')
				.setDescription('Verification channel')
				.setRequired(false),
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

		const ch = interaction.options.getChannel('channel');
		config.channelId = ch ? ch.id : null;
		await config.save();

		const desc = ch
			? await t(interaction, 'verify.setup.channel.success', {
					channel: `<#${ch.id}>`,
				})
			: await t(interaction, 'verify.setup.channel.cleared');
		const components = await simpleContainer(interaction, desc, {
			color: kythiaConfig.bot.color,
		});

		return interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	},
};
