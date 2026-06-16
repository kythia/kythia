/**
 * @namespace: addons/leveling/commands/xp-add.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags, PermissionFlagsBits } = require('discord.js');
const { levelUpXp, calculateLevelAndXp } = require('../helpers');

const { BaseCommand } = require('kythia-core');

class XpAddCommand extends BaseCommand {
	subcommand = true;
	permissions = [PermissionFlagsBits.ManageGuild];

	slashCommand = (subcommand) =>
		subcommand
			.setName('xp-add')
			.setDescription('Add XP to a user.')
			.addUserOption((option) =>
				option
					.setName('user')
					.setDescription('The user to add XP to.')
					.setRequired(true),
			)
			.addIntegerOption((option) =>
				option
					.setName('xp')
					.setDescription('The amount of XP to add.')
					.setRequired(true),
			);

	async execute(interaction) {
		const container = this.container;
		const { t, models, helpers, kythiaConfig } = container;
		const { simpleContainer } = helpers.discord;
		const { User, LevelingSetting } = models;

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const levelingSetting = await LevelingSetting.getCache({
			guildId: interaction.guild.id,
		});
		const curve = levelingSetting?.levelingCurve || 'linear';
		const multiplier =
			typeof levelingSetting?.levelingMultiplier === 'number'
				? levelingSetting.levelingMultiplier
				: 1.0;
		const maxLevel =
			typeof levelingSetting?.levelingMaxLevel === 'number'
				? levelingSetting.levelingMaxLevel
				: null;

		const targetUser = interaction.options.getUser('user');
		const xpToAdd = interaction.options.getInteger('xp');
		const user = await User.getCache({
			userId: targetUser.id,
			guildId: interaction.guild.id,
		});

		if (!user) {
			const components = await simpleContainer(
				interaction,
				`${await t(interaction, 'leveling.xp-set.leveling.user.not.found.title')}\n${await t(interaction, 'leveling.xp-set.leveling.user.not.found.desc')}`,
				{ color: 'Red' },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		let totalXp = user.xp;
		for (let i = 1; i < user.level; i++) {
			totalXp += levelUpXp(i, curve, multiplier);
		}
		totalXp += xpToAdd;

		const { newLevel, newXp } = calculateLevelAndXp(
			totalXp,
			curve,
			multiplier,
			maxLevel,
		);

		user.level = newLevel;
		user.xp = newXp;
		user.changed('xp', true);
		user.changed('level', true);
		await user.save();

		const components = await simpleContainer(
			interaction,
			`${await t(interaction, 'leveling.xp-add.leveling.xp.add.title')}\n` +
				(await t(interaction, 'leveling.xp-add.leveling.xp.add.desc', {
					username: targetUser.username,
					xp: xpToAdd,
					newLevel: user.level,
					newXp: user.xp,
				})),
			{ color: kythiaConfig.bot.color },
		);

		return interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}
}

exports.default = XpAddCommand;
