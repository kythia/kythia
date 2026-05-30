/**
 * @namespace: addons/core/commands/tools/nick-prefix/add.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { rolePrefix } = require('../../../helpers');

module.exports = {
	subcommand: true,
	slashCommand: (subcommand) =>
		subcommand
			.setName('add')
			.setDescription('📛 Adds the highest role prefix to member nicknames.'),

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { t } = container;

		await interaction.deferReply();

		const updated = await rolePrefix(interaction.guild, container);
		await interaction.editReply({
			content: await t(interaction, 'core.tools.prefix.add.success', {
				count: updated,
			}),
		});
	},
};
