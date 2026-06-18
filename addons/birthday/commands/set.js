/**
 * @namespace: addons/birthday/commands/set.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');
const { DateTime } = require('luxon');
const { BaseCommand } = require('kythia-core');
class SetCommand extends BaseCommand {
	subcommand = true;
	slashCommand = (subcommand) =>
		subcommand
			.setName('set')
			.setDescription('Set your birthday.')
			.addIntegerOption((option) =>
				option
					.setName('day')
					.setDescription('The day of your birthday (1-31).')
					.setRequired(true)
					.setMinValue(1)
					.setMaxValue(31),
			)
			.addIntegerOption((option) =>
				option
					.setName('month')
					.setDescription('The month of your birthday (1-12).')
					.setRequired(true)
					.setMinValue(1)
					.setMaxValue(12),
			)
			.addIntegerOption((option) =>
				option
					.setName('year')
					.setDescription(
						'The year of your birth (Optional - for age display).',
					)
					.setRequired(false)
					.setMinValue(1900)
					.setMaxValue(new Date().getFullYear()),
			);
	async execute(interaction) {
		const container = this.container;
		const { t, models, helpers } = container;
		const { UserBirthday } = models;
		const { simpleContainer } = helpers.discord;
		await interaction.deferReply({
			flags: MessageFlags.Ephemeral,
		});
		const day = interaction.options.getInteger('day');
		const month = interaction.options.getInteger('month');
		const year = interaction.options.getInteger('year');

		// Validate Date
		// Luxon handles validation better than native Date
		const dateObj = DateTime.fromObject({
			day,
			month,
			year: year || 2000,
		});
		if (!dateObj.isValid) {
			const msg = await t(interaction, 'birthday.set.error.invalid_date');
			const components = await simpleContainer(interaction, msg, {
				color: 'Red',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
		await UserBirthday.updateOrCreateCache(
			{
				guildId: interaction.guild.id,
				userId: interaction.user.id,
			},
			{
				day,
				month,
				year,
			},
		);
		const successMsg = await t(interaction, 'birthday.set.success', {
			date: dateObj.toFormat(year ? 'DDDD' : 'MMMM d'),
		});
		const components = await simpleContainer(interaction, successMsg);
		await interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}
}
exports.default = SetCommand;
