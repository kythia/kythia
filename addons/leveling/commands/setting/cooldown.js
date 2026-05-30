/**
 * @namespace: addons/leveling/commands/setting/cooldown.js
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
			.setName('cooldown')
			.setDescription('🎮 Set XP gain cooldown')
			.addIntegerOption((opt) =>
				opt
					.setName('cooldown')
					.setDescription('Cooldown in seconds')
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
		const cooldown = interaction.options.getInteger('cooldown');

		const [serverSetting] = await ServerSetting.findOrCreateWithCache({
			where: { guildId },
			defaults: { guildId, guildName },
		});

		serverSetting.levelingCooldown = cooldown * 1000;
		await serverSetting.save();

		const components = await simpleContainer(
			interaction,
			await t(interaction, 'core.setting.setting.leveling.cooldown.set', {
				cooldown,
			}),
			{ color: 'Green' },
		);
		return interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	},
};
