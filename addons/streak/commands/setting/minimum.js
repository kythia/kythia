/**
 * @namespace: addons/streak/commands/setting/minimum.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags, PermissionFlagsBits } = require('discord.js');

module.exports = {
	subcommand: true,
	slashCommand: (subcommand) =>
		subcommand
			.setName('minimum')
			.setDescription('🔥 Set minimum streak')
			.addIntegerOption((opt) =>
				opt
					.setName('minimum')
					.setDescription('Minimum streak')
					.setRequired(true),
			),
	permissions: [PermissionFlagsBits.ManageGuild],

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { t, models, helpers } = container;
		const { ServerSetting } = models;
		const { simpleContainer } = helpers.discord;

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const guildId = interaction.guild.id;
		const guildName = interaction.guild.name;
		const minimum = interaction.options.getInteger('minimum');

		const [serverSetting] = await ServerSetting.findOrCreateWithCache({
			where: { guildId },
			defaults: { guildId, guildName },
		});

		serverSetting.streakMinimum = minimum;
		await serverSetting.save();

		const components = await simpleContainer(
			interaction,
			await t(interaction, 'core.setting.setting.streak.minimum.set', {
				minimum,
			}),
			{ color: 'Green' },
		);
		return interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	},
};
