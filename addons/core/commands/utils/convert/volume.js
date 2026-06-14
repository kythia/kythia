/**
 * @namespace: addons/core/commands/utils/convert/volume.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');
const { convertVolume, volumeChoices } = require('./_helpers');

const { BaseCommand } = require('kythia-core');

class VolumeCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('volume')
			.setDescription('🧪 Convert volume units (e.g. L to gal)')
			.addStringOption((option) =>
				option
					.setName('from')
					.setDescription('From unit')
					.setRequired(true)
					.addChoices(...volumeChoices),
			)
			.addStringOption((option) =>
				option
					.setName('to')
					.setDescription('To unit')
					.setRequired(true)
					.addChoices(...volumeChoices),
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
		const result = convertVolume(value, from, to);

		if (result == null) {
			const components = await simpleContainer(
				interaction,
				`## ${await t(interaction, 'core.utils.convert.volume.failed')}`,
				{ color: 'Red' },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const desc =
			'## ' +
			(await t(interaction, 'core.utils.convert.volume.title')) +
			'\n' +
			(await t(interaction, 'core.utils.convert.volume.result', {
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

exports.default = VolumeCommand;
