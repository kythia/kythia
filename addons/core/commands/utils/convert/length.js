/**
 * @namespace: addons/core/commands/utils/convert/length.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');
const { convertLength, lengthChoices } = require('../../../helpers/convert');
const { BaseCommand } = require('kythia-core');
class LengthCommand extends BaseCommand {
	subcommand = true;
	slashCommand = (subcommand) =>
		subcommand
			.setName('length')
			.setDescription('Convert length units (e.g. m to km)')
			.addStringOption((option) =>
				option
					.setName('from')
					.setDescription('From unit')
					.setRequired(true)
					.addChoices(...lengthChoices),
			)
			.addStringOption((option) =>
				option
					.setName('to')
					.setDescription('To unit')
					.setRequired(true)
					.addChoices(...lengthChoices),
			)
			.addNumberOption((option) =>
				option
					.setName('value')
					.setDescription('Value to convert')
					.setRequired(true),
			);
	async execute(interaction) {
		const container = this.container;
		const { t, helpers } = container;
		const { simpleContainer } = helpers.discord;
		await interaction.deferReply();
		const value = interaction.options.getNumber('value');
		const from = interaction.options.getString('from');
		const to = interaction.options.getString('to');
		const result = convertLength(value, from, to);
		if (result == null) {
			const components = await simpleContainer(
				interaction,
				`${await t(interaction, 'core.commands.utils.convert.length.failed')}`,
				{
					color: 'Red',
				},
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
		const desc =
			'' +
			(await t(interaction, 'core.commands.utils.convert.length.title')) +
			'\n' +
			(await t(interaction, 'core.commands.utils.convert.length.result', {
				value,
				from,
				result,
				to,
			}));
		const components = await simpleContainer(interaction, desc);
		return interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}
}
exports.default = LengthCommand;
