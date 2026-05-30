/**
 * @namespace: addons/verification/commands/setup/unverified-role.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 1.0.0-rc
 */

const { SlashCommandSubcommandBuilder, MessageFlags } = require('discord.js');

module.exports = {
	subcommand: true,
	slashCommand: new SlashCommandSubcommandBuilder()
		.setName('unverified-role')
		.setDescription('Role assigned on join (restricts unverified members)')
		.addRoleOption((o) =>
			o.setName('role').setDescription('Unverified role').setRequired(true),
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

		const role = interaction.options.getRole('role');
		config.unverifiedRoleId = role.id;
		await config.save();
		const components = await simpleContainer(
			interaction,
			await t(interaction, 'verify.setup.unverified.role.success', {
				role: role.toString(),
			}),
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
