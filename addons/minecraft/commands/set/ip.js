/**
 * @namespace: addons/minecraft/commands/set/ip.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags, PermissionFlagsBits } = require('discord.js');

module.exports = {
	subcommand: true,
	guildOnly: true,
	permissions: [PermissionFlagsBits.ManageGuild],
	slashCommand: (subcommand) =>
		subcommand
			.setName('ip')
			.setDescription('🖥️ Set the Minecraft server IP for this guild')
			.addStringOption((option) =>
				option
					.setName('ip')
					.setDescription('Minecraft server IP address')
					.setRequired(true),
			),

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { t, helpers, models } = container;
		const { ServerSetting } = models;
		const { simpleContainer } = helpers.discord;

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const ip = interaction.options.getString('ip');

		const [serverSetting] = await ServerSetting.findOrCreateWithCache({
			where: { guildId: interaction.guild.id },
			defaults: {
				guildId: interaction.guild.id,
				guildName: interaction.guild.name,
			},
		});

		serverSetting.minecraftIp = ip;
		await serverSetting.save();

		const components = await simpleContainer(
			interaction,
			await t(interaction, 'core.setting.setting.minecraft.ip.set', { ip }),
			{ color: 'Green' },
		);

		return interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	},
};
