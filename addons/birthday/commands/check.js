/**
 * @namespace: addons/birthday/commands/check.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');
const { DateTime } = require('luxon');
const { BaseCommand } = require('kythia-core');
class CheckCommand extends BaseCommand {
	subcommand = true;
	slashCommand = (subcommand) =>
		subcommand
			.setName('check')
			.setDescription("Check your or another user's birthday.")
			.addUserOption((option) =>
				option
					.setName('user')
					.setDescription('The user to check (defaults to yourself).')
					.setRequired(false),
			);
	async execute(interaction) {
		const container = this.container;
		const { t, models, helpers } = container;
		const { UserBirthday } = models;
		const { simpleContainer } = helpers.discord;
		await interaction.deferReply();
		const targetUser = interaction.options.getUser('user') || interaction.user;
		const birthday = await UserBirthday.getCache({
			guildId: interaction.guild.id,
			userId: targetUser.id,
		});
		if (!birthday) {
			const key =
				targetUser.id === interaction.user.id
					? 'birthday.check.error.self_not_set'
					: 'birthday.check.error.other_not_set';
			const msg = await t(interaction, key, {
				user: targetUser.toString(),
			});
			const components = await simpleContainer(interaction, msg, {
				color: 'Red',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		// Calculate Next Birthday
		const now = DateTime.now();
		let nextBirthday = DateTime.fromObject({
			day: birthday.day,
			month: birthday.month,
			year: now.year,
		});
		if (nextBirthday < now) {
			nextBirthday = nextBirthday.plus({
				years: 1,
			});
		}
		const diff = nextBirthday.diff(now, ['days', 'hours']).toObject();
		const daysLeft = Math.floor(diff.days);

		// Format output
		const dateStr = DateTime.fromObject({
			day: birthday.day,
			month: birthday.month,
			year: birthday.year || 2000,
		}).toFormat(birthday.year ? 'DDDD' : 'MMMM d');
		let ageContent = '';
		if (birthday.year) {
			const age = nextBirthday.year - birthday.year;
			ageContent = await t(interaction, 'birthday.commands.check.turning_age', {
				age,
			});
		}
		const msg = await t(interaction, 'birthday.commands.check.success', {
			user: targetUser.toString(),
			date: dateStr,
			days: daysLeft,
			ageInfo: ageContent,
		});
		const components = await simpleContainer(interaction, msg);
		await interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}
}
exports.default = CheckCommand;
