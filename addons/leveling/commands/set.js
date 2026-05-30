/**
 * @namespace: addons/leveling/commands/set.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { PermissionFlagsBits, MessageFlags } = require('discord.js');

module.exports = {
	subcommand: true,
	permissions: [PermissionFlagsBits.ManageGuild],
	slashCommand: (subcommand) =>
		subcommand
			.setName('set')
			.setDescription("Set a user's level to a specific value.")
			.addUserOption((option) =>
				option
					.setName('user')
					.setDescription('The user to set the level for.')
					.setRequired(true),
			)
			.addIntegerOption((option) =>
				option
					.setName('level')
					.setDescription('The level to set.')
					.setRequired(true),
			),

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { t, models, helpers, kythiaConfig } = container;
		const { simpleContainer } = helpers.discord;
		const { User } = models;

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const targetUser = interaction.options.getUser('user');
		const levelToSet = interaction.options.getInteger('level');
		const user = await User.getCache({
			userId: targetUser.id,
			guildId: interaction.guild.id,
		});

		if (!user) {
			const components = await simpleContainer(
				interaction,
				`## ${await t(interaction, 'leveling.set.leveling.user.not.found.title')}\n${await t(interaction, 'leveling.set.leveling.user.not.found.desc')}`,
				{ color: 'Red' },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		user.level = levelToSet;
		user.xp = 0;
		user.changed('level', true);
		user.changed('xp', true);
		await user.save();

		const components = await simpleContainer(
			interaction,
			`## ${await t(interaction, 'leveling.set.leveling.level.set.title')}\n` +
				(await t(interaction, 'leveling.set.leveling.level.set.desc', {
					username: targetUser.username,
					newLevel: user.level,
				})),
			{ color: kythiaConfig.bot.color },
		);

		return interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	},
};
