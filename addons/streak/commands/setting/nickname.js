/**
 * @namespace: addons/streak/commands/setting/streak/nickname.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 1.0.0-rc
 */

const { MessageFlags, PermissionFlagsBits } = require('discord.js');

module.exports = {
	subcommand: true,
	slashCommand: (subcommand) =>
		subcommand
			.setName('nickname')
			.setDescription('🔥 Toggle auto-nickname for streak')
			.addStringOption((opt) =>
				opt
					.setName('status')
					.setDescription('Select status')
					.setRequired(true)
					.addChoices(
						{ name: 'Enable', value: 'enable' },
						{ name: 'Disable', value: 'disable' },
					),
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
		const status = interaction.options.getString('status');

		const [serverSetting] = await ServerSetting.findOrCreateWithCache({
			where: { guildId },
			defaults: { guildId, guildName },
		});

		serverSetting.streakNickname = status === 'enable';
		await serverSetting.save();

		const components = await simpleContainer(
			interaction,
			await t(interaction, 'core.setting.setting.streak.nickname.set', {
				status: status === 'enable' ? 'Enabled' : 'Disabled',
			}),
			{ color: status === 'enable' ? 'Green' : 'Red' },
		);
		return interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	},
};
