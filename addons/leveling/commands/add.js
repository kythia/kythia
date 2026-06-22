/**
 * @namespace: addons/leveling/commands/add.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags, PermissionFlagsBits } = require('discord.js');
const { BaseCommand } = require('kythia-core');
class AddCommand extends BaseCommand {
	subcommand = true;
	permissions = [PermissionFlagsBits.ManageGuild];
	slashCommand = (subcommand) =>
		subcommand
			.setName('add')
			.setDescription('Add levels to a user.')
			.addUserOption((option) =>
				option
					.setName('user')
					.setDescription('The user to add levels to.')
					.setRequired(true),
			)
			.addIntegerOption((option) =>
				option
					.setName('level')
					.setDescription('The amount of levels to add.')
					.setRequired(true),
			);
	async execute(interaction) {
		const container = this.container;
		const { t, models, helpers, kythiaConfig } = container;
		const { simpleContainer } = helpers.discord;
		const { User } = models;
		await interaction.deferReply({
			flags: MessageFlags.Ephemeral,
		});
		const targetUser = interaction.options.getUser('user');
		const levelToAdd = interaction.options.getInteger('level');
		const user = await User.getCache({
			userId: targetUser.id,
			guildId: interaction.guild.id,
		});
		if (!user) {
			const components = await simpleContainer(
				interaction,
				`${await t(interaction, 'leveling.commands.add.leveling.user.not.found.title')}\n${await t(interaction, 'leveling.commands.add.leveling.user.not.found.desc')}`,
				{
					color: 'Red',
				},
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
		user.level += levelToAdd;
		user.xp = 0;
		user.changed('level', true);
		user.changed('xp', true);
		await user.save();
		const components = await simpleContainer(
			interaction,
			`${await t(interaction, 'leveling.commands.add.leveling.level.add.title')}\n` +
				(await t(interaction, 'leveling.commands.add.leveling.level.add.desc', {
					username: targetUser.username,
					level: levelToAdd,
					newLevel: user.level,
				})),
			{
				color: kythiaConfig.bot.color,
			},
		);
		return interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}
}
exports.default = AddCommand;
